import { useSyncExternalStore } from 'react'
import { computeMatch } from './scoring'
import { knockoutSeeds, roundRobin, shuffle } from './tournament'
import type { AppData, Id, Match, MatchConfig, Player, Side, Tournament, TournamentFormat } from './types'

const STORAGE_KEY = 'ping-pong-data-v1'

const EMPTY: AppData = { version: 1, players: [], matches: [], tournaments: [] }

export const PLAYER_COLORS = ['#ff5a5f', '#ffb400', '#00a699', '#3b82f6', '#a855f7', '#ec4899', '#22c55e', '#f97316', '#14b8a6', '#eab308']
export const PLAYER_EMOJIS = ['🦊', '🐯', '🐼', '🐸', '🦁', '🐙', '🦄', '🐲', '🦅', '🐺', '🐻', '🐵', '🦈', '🐝', '🦖', '🐧', '🐨', '🐔', '🤖', '👽', '🔥', '⚡', '🌮', '🍕']

export function uid(): Id {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
}

function load(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY
    return validate(JSON.parse(raw))
  } catch {
    return EMPTY
  }
}

export function validate(input: unknown): AppData {
  const d = input as Partial<AppData> | null
  if (!d || typeof d !== 'object' || !Array.isArray(d.players) || !Array.isArray(d.matches) || !Array.isArray(d.tournaments)) {
    throw new Error('Formato de datos inválido')
  }
  return { version: 1, players: d.players, matches: d.matches, tournaments: d.tournaments }
}

let data: AppData = load()
const listeners = new Set<() => void>()

function commit(next: AppData) {
  data = next
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // Sin espacio o modo privado: seguimos en memoria.
  }
  listeners.forEach((l) => l())
}

if (typeof window !== 'undefined') {
  // Mantener sincronizadas varias pestañas abiertas.
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) {
      data = load()
      listeners.forEach((l) => l())
    }
  })
}

function subscribe(l: () => void) {
  listeners.add(l)
  return () => listeners.delete(l)
}

export function useData(): AppData {
  return useSyncExternalStore(subscribe, () => data)
}

export function getData(): AppData {
  return data
}

function updateMatch(id: Id, fn: (m: Match) => Match) {
  commit({ ...data, matches: data.matches.map((m) => (m.id === id ? fn(m) : m)) })
}

/** Aplica un nuevo listado de puntos y actualiza estado/ganador del partido. */
function withPoints(m: Match, points: Side[]): Match {
  const state = computeMatch(points, m.config, m.firstServer)
  const next: Match = { ...m, points, status: state.finished ? 'finished' : 'live', startedAt: m.startedAt ?? Date.now() }
  if (state.finished) {
    next.finishedAt = m.status === 'finished' && m.finishedAt ? m.finishedAt : Date.now()
    next.winner = state.winner === 'a' ? m.playerA : state.winner === 'b' ? m.playerB : null
  } else {
    delete next.finishedAt
    delete next.winner
  }
  return next
}

export const actions = {
  addPlayer(name: string, emoji: string, color: string): Player {
    const p: Player = { id: uid(), name: name.trim(), emoji, color, createdAt: Date.now() }
    commit({ ...data, players: [...data.players, p] })
    return p
  },

  updatePlayer(id: Id, patch: Partial<Omit<Player, 'id'>>) {
    commit({ ...data, players: data.players.map((p) => (p.id === id ? { ...p, ...patch } : p)) })
  },

  /** Borra un jugador. Sólo se permite si no jugó partidos. */
  deletePlayer(id: Id): boolean {
    if (data.matches.some((m) => m.playerA === id || m.playerB === id)) return false
    if (data.tournaments.some((t) => t.playerIds.includes(id))) return false
    commit({ ...data, players: data.players.filter((p) => p.id !== id) })
    return true
  },

  createMatch(playerA: Id, playerB: Id, config: MatchConfig, firstServer: Side): Match {
    const m: Match = {
      id: uid(),
      createdAt: Date.now(),
      startedAt: Date.now(),
      playerA,
      playerB,
      config,
      points: [],
      firstServer,
      status: 'live',
    }
    commit({ ...data, matches: [...data.matches, m] })
    return m
  },

  scorePoint(matchId: Id, side: Side) {
    updateMatch(matchId, (m) => (m.status === 'finished' ? m : withPoints(m, [...m.points, side])))
  },

  undoPoint(matchId: Id) {
    updateMatch(matchId, (m) => withPoints(m, m.points.slice(0, -1)))
  },

  /** Antes de empezar: cambiar quién saca primero. */
  setFirstServer(matchId: Id, side: Side) {
    updateMatch(matchId, (m) => (m.points.length ? m : { ...m, firstServer: side }))
  },

  /** Intercambia A y B (para que quede del lado correcto de la mesa). */
  swapSides(matchId: Id) {
    updateMatch(matchId, (m) => ({
      ...m,
      playerA: m.playerB,
      playerB: m.playerA,
      firstServer: m.firstServer === 'a' ? 'b' : 'a',
      points: m.points.map((p) => (p === 'a' ? 'b' : 'a')),
    }))
  },

  startMatch(matchId: Id) {
    updateMatch(matchId, (m) => (m.status === 'pending' ? { ...m, status: 'live', startedAt: Date.now() } : m))
  },

  /** Reinicia un partido (borra los puntos). */
  resetMatch(matchId: Id) {
    updateMatch(matchId, (m) => {
      const next: Match = { ...m, points: [], status: m.tournamentId ? 'pending' : 'live' }
      delete next.winner
      delete next.finishedAt
      return next
    })
  },

  deleteMatch(matchId: Id) {
    commit({ ...data, matches: data.matches.filter((m) => m.id !== matchId) })
  },

  createTournament(name: string, format: TournamentFormat, playerIds: Id[], config: MatchConfig, doubleRound: boolean): Tournament {
    const id = uid()
    const now = Date.now()
    const order = shuffle(playerIds)
    const t: Tournament = { id, name: name.trim(), createdAt: now, format, playerIds, config }
    const matches: Match[] = []
    if (format === 'league') {
      t.doubleRound = doubleRound
      roundRobin(order, doubleRound).forEach((round, r) =>
        round.forEach(([a, b], i) =>
          matches.push({
            id: uid(),
            createdAt: now + r * 100 + i,
            playerA: a,
            playerB: b,
            config,
            points: [],
            firstServer: Math.random() < 0.5 ? 'a' : 'b',
            status: 'pending',
            tournamentId: id,
            round: r,
          }),
        ),
      )
    } else {
      t.seeds = knockoutSeeds(order)
    }
    commit({ ...data, tournaments: [...data.tournaments, t], matches: [...data.matches, ...matches] })
    return t
  },

  /** Crea (si no existe) el partido de una llave de eliminación directa. */
  ensureKnockoutMatch(tournamentId: Id, round: number, slot: number, a: Id, b: Id): Match {
    const existing = data.matches.find((m) => m.tournamentId === tournamentId && m.round === round && m.slot === slot)
    if (existing) {
      const samePlayers = (existing.playerA === a && existing.playerB === b) || (existing.playerA === b && existing.playerB === a)
      // Si cambió quién llega a la llave (p. ej. se corrigió un resultado) y todavía no se jugó, se actualiza.
      if (samePlayers || existing.points.length) return existing
      const fixed = { ...existing, playerA: a, playerB: b }
      updateMatch(existing.id, () => fixed)
      return fixed
    }
    const t = data.tournaments.find((x) => x.id === tournamentId)!
    const m: Match = {
      id: uid(),
      createdAt: Date.now(),
      playerA: a,
      playerB: b,
      config: t.config,
      points: [],
      firstServer: Math.random() < 0.5 ? 'a' : 'b',
      status: 'pending',
      tournamentId,
      round,
      slot,
    }
    commit({ ...data, matches: [...data.matches, m] })
    return m
  },

  deleteTournament(id: Id) {
    commit({
      ...data,
      tournaments: data.tournaments.filter((t) => t.id !== id),
      matches: data.matches.filter((m) => m.tournamentId !== id),
    })
  },

  importData(next: AppData) {
    commit(validate(next))
  },

  resetAll() {
    commit(EMPTY)
  },
}

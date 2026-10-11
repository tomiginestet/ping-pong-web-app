import { computeMatch, pointTotals } from './scoring'
import { isDoubles, sidePlayers } from './teams'
import type { AppData, Id, Match, Player, Side } from './types'

export const INITIAL_ELO = 1000
const K = 32

export interface PlayerStats {
  playerId: Id
  elo: number
  /** ELO después de cada partido, en orden cronológico (incluye el inicial). */
  eloHistory: number[]
  played: number
  wins: number
  losses: number
  draws: number
  gamesWon: number
  gamesLost: number
  pointsWon: number
  pointsLost: number
  /** Racha actual: positiva = victorias seguidas, negativa = derrotas seguidas. */
  streak: number
  bestStreak: number
  tournamentsWon: number
  doublesPlayed: number
  doublesWins: number
  /** Juegos ganados sin que el rival haga un punto (a 5 o más). */
  shutouts: number
  /** Mayor desventaja que dio vuelta en un juego que terminó ganando. */
  bestComeback: number
  /** Partidos ganados en el juego decisivo. */
  clutchWins: number
  /** Cuántos puntos más allá del objetivo se estiró el juego ganado más largo. */
  longestExtension: number
  /** Mayor diferencia de ELO a favor del rival en un partido ganado. */
  biggestUpset: number
}

export interface MatchResultInfo {
  match: Match
  eloDelta: { a: number; b: number }
}

export type LevelIconId = 'egg' | 'hatching' | 'paddle' | 'pepper' | 'lightning' | 'belt' | 'dragon'

export const LEVELS: { min: number; name: string; icon: LevelIconId }[] = [
  { min: -Infinity, name: 'Pelotita', icon: 'egg' },
  { min: 900, name: 'Aprendiz', icon: 'hatching' },
  { min: 975, name: 'Amateur', icon: 'paddle' },
  { min: 1050, name: 'Picante', icon: 'pepper' },
  { min: 1125, name: 'Crack', icon: 'lightning' },
  { min: 1200, name: 'Maestro', icon: 'belt' },
  { min: 1300, name: 'Leyenda', icon: 'dragon' },
]

export function levelFor(elo: number) {
  let level = LEVELS[0]
  for (const l of LEVELS) if (elo >= l.min) level = l
  return level
}

export function expectedScore(eloA: number, eloB: number): number {
  return 1 / (1 + 10 ** ((eloB - eloA) / 400))
}

function emptyStats(playerId: Id): PlayerStats {
  return {
    playerId,
    elo: INITIAL_ELO,
    eloHistory: [INITIAL_ELO],
    played: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    gamesWon: 0,
    gamesLost: 0,
    pointsWon: 0,
    pointsLost: 0,
    streak: 0,
    bestStreak: 0,
    tournamentsWon: 0,
    doublesPlayed: 0,
    doublesWins: 0,
    shutouts: 0,
    bestComeback: 0,
    clutchWins: 0,
    longestExtension: 0,
    biggestUpset: 0,
  }
}

export function finishedMatches(matches: Match[]): Match[] {
  return matches
    .filter((m) => m.status === 'finished')
    .sort((x, y) => (x.finishedAt ?? x.createdAt) - (y.finishedAt ?? y.createdAt))
}

export interface Leaderboard {
  stats: Map<Id, PlayerStats>
  /** Cambio de ELO de cada partido terminado, por id de partido. */
  eloDeltas: Map<Id, { a: number; b: number }>
}

/** Recorre todo el historial y calcula ELO y estadísticas (de donde salen los logros). */
export function computeLeaderboard(data: AppData): Leaderboard {
  const stats = new Map<Id, PlayerStats>()
  const eloDeltas = new Map<Id, { a: number; b: number }>()
  for (const p of data.players) stats.set(p.id, emptyStats(p.id))
  const get = (id: Id) => {
    let s = stats.get(id)
    if (!s) {
      s = emptyStats(id)
      stats.set(id, s)
    }
    return s
  }

  for (const m of finishedMatches(data.matches)) {
    const teamA = sidePlayers(m, 'a').map(get)
    const teamB = sidePlayers(m, 'b').map(get)
    const doubles = teamA.length > 1
    const state = computeMatch(m.points, m.config, m.firstServer)
    // En dobles, cada equipo juega con el promedio de ELO de sus integrantes.
    const avg = (team: PlayerStats[]) => team.reduce((sum, s) => sum + s.elo, 0) / team.length
    const eloA = avg(teamA)
    const eloB = avg(teamB)
    const scoreA = state.winner === 'a' ? 1 : state.winner === 'b' ? 0 : 0.5
    const deltaA = Math.round(K * (scoreA - expectedScore(eloA, eloB)))
    for (const s of teamA) s.elo += deltaA
    for (const s of teamB) s.elo -= deltaA
    eloDeltas.set(m.id, { a: deltaA, b: -deltaA })

    const totals = pointTotals(m.points)
    const sides: [PlayerStats[], Side, number][] = [
      [teamA, 'a', eloB - eloA],
      [teamB, 'b', eloA - eloB],
    ]
    for (const [team, side, eloGap] of sides) {
      const opp: Side = side === 'a' ? 'b' : 'a'
      for (const s of team) {
        s.played++
        s.eloHistory.push(s.elo)
        s.gamesWon += state.gamesWon[side]
        s.gamesLost += state.gamesWon[opp]
        s.pointsWon += totals[side]
        s.pointsLost += totals[opp]
        if (doubles) s.doublesPlayed++
        const won = state.winner === side
        const lost = state.winner === opp
        if (won) {
          s.wins++
          if (doubles) s.doublesWins++
          s.streak = s.streak > 0 ? s.streak + 1 : 1
          s.bestStreak = Math.max(s.bestStreak, s.streak)
          s.biggestUpset = Math.max(s.biggestUpset, Math.round(eloGap))
          const gamesPlayed = state.gamesWon.a + state.gamesWon.b
          if (m.config.bestOf > 1 && state.gamesWon[opp] === state.gamesNeeded - 1 && gamesPlayed > 1) {
            s.clutchWins++
          }
        } else if (lost) {
          s.losses++
          s.streak = s.streak < 0 ? s.streak - 1 : -1
        } else {
          s.draws++
          s.streak = 0
        }
      }
    }

    // Datos por juego: juegos en cero, remontadas y juegos largos.
    for (const g of gameTraces(m)) {
      const team = g.winner === 'a' ? teamA : teamB
      const loserPoints = g.winner === 'a' ? g.b : g.a
      const winnerPoints = g.winner === 'a' ? g.a : g.b
      for (const s of team) {
        if (loserPoints === 0 && m.config.pointsToWin >= 5) s.shutouts++
        s.bestComeback = Math.max(s.bestComeback, g.maxDeficit[g.winner])
        if (m.config.winByTwo) s.longestExtension = Math.max(s.longestExtension, winnerPoints - m.config.pointsToWin)
      }
    }
  }

  for (const t of data.tournaments) {
    const champ = tournamentChampion(t.id, data)
    if (champ) {
      const s = get(champ)
      s.tournamentsWon++
    }
  }

  return { stats, eloDeltas }
}

interface GameTrace {
  a: number
  b: number
  winner: Side
  /** Máxima desventaja que tuvo cada lado durante el juego. */
  maxDeficit: { a: number; b: number }
}

function gameTraces(m: Match): GameTrace[] {
  const out: GameTrace[] = []
  let a = 0
  let b = 0
  let maxDeficit = { a: 0, b: 0 }
  const state = computeMatch(m.points, m.config, m.firstServer)
  let gi = 0
  for (const p of m.points) {
    if (p === 'a') a++
    else b++
    maxDeficit = { a: Math.max(maxDeficit.a, b - a), b: Math.max(maxDeficit.b, a - b) }
    const g = state.games[gi]
    if (g && g.winner && g.a === a && g.b === b) {
      out.push({ a, b, winner: g.winner, maxDeficit })
      a = 0
      b = 0
      maxDeficit = { a: 0, b: 0 }
      gi++
    }
  }
  return out
}

export function rankedPlayers(players: Player[], board: Leaderboard): { player: Player; stats: PlayerStats }[] {
  return players
    .map((player) => ({ player, stats: board.stats.get(player.id) ?? emptyStats(player.id) }))
    .sort((x, y) => y.stats.elo - x.stats.elo || y.stats.wins - x.stats.wins || x.player.name.localeCompare(y.player.name))
}

export interface HeadToHead {
  opponentId: Id
  played: number
  wins: number
  losses: number
  draws: number
}

export function headToHead(playerId: Id, matches: Match[]): HeadToHead[] {
  const map = new Map<Id, HeadToHead>()
  for (const m of finishedMatches(matches)) {
    if (isDoubles(m) || (m.playerA !== playerId && m.playerB !== playerId)) continue
    const opp = m.playerA === playerId ? m.playerB : m.playerA
    const h = map.get(opp) ?? { opponentId: opp, played: 0, wins: 0, losses: 0, draws: 0 }
    h.played++
    if (m.winner === playerId) h.wins++
    else if (m.winner === opp) h.losses++
    else h.draws++
    map.set(opp, h)
  }
  return [...map.values()].sort((x, y) => y.played - x.played)
}

export function winRate(s: Pick<PlayerStats, 'wins' | 'played'>): number {
  return s.played ? s.wins / s.played : 0
}

// ---------------------------------------------------------------------------
// Torneos

export interface StandingRow {
  playerId: Id
  played: number
  wins: number
  draws: number
  losses: number
  gamesFor: number
  gamesAgainst: number
  pointsFor: number
  pointsAgainst: number
  /** Puntos de tabla: 3 por victoria, 1 por empate. */
  points: number
}

export function leagueStandings(tournamentId: Id, data: AppData): StandingRow[] {
  const t = data.tournaments.find((x) => x.id === tournamentId)
  if (!t) return []
  const rows = new Map<Id, StandingRow>()
  for (const id of t.playerIds) {
    rows.set(id, {
      playerId: id,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      gamesFor: 0,
      gamesAgainst: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      points: 0,
    })
  }
  for (const m of data.matches) {
    if (m.tournamentId !== tournamentId || m.status !== 'finished') continue
    const state = computeMatch(m.points, m.config, m.firstServer)
    const totals = pointTotals(m.points)
    for (const [id, side, opp] of [
      [m.playerA, 'a', 'b'],
      [m.playerB, 'b', 'a'],
    ] as const) {
      const r = rows.get(id)
      if (!r) continue
      r.played++
      r.gamesFor += state.gamesWon[side]
      r.gamesAgainst += state.gamesWon[opp]
      r.pointsFor += totals[side]
      r.pointsAgainst += totals[opp]
      if (m.winner === id) {
        r.wins++
        r.points += 3
      } else if (m.winner === null) {
        r.draws++
        r.points += 1
      } else r.losses++
    }
  }
  return [...rows.values()].sort(
    (x, y) =>
      y.points - x.points ||
      y.gamesFor - y.gamesAgainst - (x.gamesFor - x.gamesAgainst) ||
      y.pointsFor - y.pointsAgainst - (x.pointsFor - x.pointsAgainst) ||
      y.wins - x.wins,
  )
}

/** Campeón de un torneo terminado, o `undefined` si todavía no terminó. */
export function tournamentChampion(tournamentId: Id, data: AppData): Id | undefined {
  const t = data.tournaments.find((x) => x.id === tournamentId)
  if (!t) return undefined
  const matches = data.matches.filter((m) => m.tournamentId === t.id)
  if (t.format === 'league') {
    if (!matches.length || matches.some((m) => m.status !== 'finished')) return undefined
    return leagueStandings(t.id, data)[0]?.playerId
  }
  return knockoutChampion(t.seeds ?? [], matches)
}

export function knockoutChampion(seeds: (Id | null)[], matches: Match[]): Id | undefined {
  const rounds = bracketRounds(seeds, matches)
  const final = rounds[rounds.length - 1]?.[0]
  return final?.winner ?? undefined
}

export interface BracketSlot {
  round: number
  slot: number
  a: Id | null | undefined
  b: Id | null | undefined
  match?: Match
  /** Ganador de la llave; `undefined` si todavía no se sabe. */
  winner?: Id | null
  isBye: boolean
}

/**
 * Calcula el cuadro de eliminación directa.
 * `null` = lugar libre (BYE); `undefined` = todavía no se sabe quién llega.
 */
export function bracketRounds(seeds: (Id | null)[], matches: Match[]): BracketSlot[][] {
  const rounds: BracketSlot[][] = []
  let entrants: (Id | null | undefined)[] = seeds
  let r = 0
  while (entrants.length >= 2) {
    const round: BracketSlot[] = []
    for (let s = 0; s < entrants.length / 2; s++) {
      const a = entrants[2 * s]
      const b = entrants[2 * s + 1]
      const match = matches.find((m) => m.round === r && m.slot === s)
      let winner: Id | null | undefined
      const isBye = a === null || b === null
      if (a === null && b === null) winner = null
      else if (a === null) winner = b
      else if (b === null) winner = a
      else if (match?.status === 'finished') winner = match.winner
      round.push({ round: r, slot: s, a, b, match, winner, isBye })
    }
    rounds.push(round)
    entrants = round.map((x) => x.winner)
    r++
  }
  return rounds
}

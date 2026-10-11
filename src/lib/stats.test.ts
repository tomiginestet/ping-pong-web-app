import { describe, expect, it } from 'vitest'
import { computeMatch } from './scoring'
import { ACHIEVEMENT_FAMILIES, familyLevel, levelUps } from './achievements'
import { bracketRounds, computeLeaderboard, INITIAL_ELO, leagueStandings, tournamentChampion } from './stats'
import { knockoutSeeds, roundRobin } from './tournament'
import type { AppData, Match, MatchConfig, Side } from './types'

const config: MatchConfig = { pointsToWin: 2, winByTwo: false, bestOf: 1, serveEvery: 1 }
let t = 0
function match(a: string, b: string, winnerSide: Side, extra: Partial<Match> = {}): Match {
  const points: Side[] = [winnerSide, winnerSide]
  const state = computeMatch(points, config, 'a')
  return {
    id: `m${++t}`,
    createdAt: t,
    finishedAt: t,
    playerA: a,
    playerB: b,
    config,
    points,
    firstServer: 'a',
    status: state.finished ? 'finished' : 'live',
    winner: winnerSide === 'a' ? a : b,
    ...extra,
  }
}
const family = (id: string) => ACHIEVEMENT_FAMILIES.find((f) => f.id === id)!
const players = ['p1', 'p2', 'p3', 'p4'].map((id) => ({ id, name: id, emoji: '🏓', color: '#fff', createdAt: 0 }))

describe('computeLeaderboard', () => {
  it('suma y resta el mismo ELO', () => {
    const data: AppData = { version: 1, players, matches: [match('p1', 'p2', 'a')], tournaments: [] }
    const board = computeLeaderboard(data)
    const p1 = board.stats.get('p1')!
    const p2 = board.stats.get('p2')!
    expect(p1.elo).toBe(INITIAL_ELO + 16)
    expect(p2.elo).toBe(INITIAL_ELO - 16)
    expect(p1.wins).toBe(1)
    expect(p2.losses).toBe(1)
    expect(familyLevel(family('wins'), p1)).toBe(0)
  })

  it('cuenta rachas', () => {
    const matches = [match('p1', 'p2', 'a'), match('p1', 'p3', 'a'), match('p4', 'p1', 'b'), match('p1', 'p2', 'b')]
    const p1 = computeLeaderboard({ version: 1, players, matches, tournaments: [] }).stats.get('p1')!
    expect(p1.bestStreak).toBe(3)
    expect(p1.streak).toBe(-1)
    expect(familyLevel(family('streak'), p1)).toBe(0)
  })
})

describe('logros por niveles', () => {
  const to11: MatchConfig = { pointsToWin: 11, winByTwo: true, bestOf: 1, serveEvery: 2 }
  function played(points: Side[], cfg: MatchConfig = to11): Match {
    return { ...match('p1', 'p2', 'a'), config: cfg, points }
  }
  const run = (s: string) => [...s].map((c) => (c === '1' ? 'a' : 'b') as Side)

  it('cuenta juegos en cero y sube de pastelito a zapatero', () => {
    const shutout = played(run('1'.repeat(11)))
    const matches = [shutout, { ...shutout, id: 'z2' }, { ...shutout, id: 'z3' }]
    const p1 = computeLeaderboard({ version: 1, players, matches, tournaments: [] }).stats.get('p1')!
    expect(p1.shutouts).toBe(3)
    expect(familyLevel(family('shutout'), p1)).toBe(1)
    expect(family('shutout').levels[1].name).toBe('Zapatero')
  })

  it('guarda la mayor remontada y el juego más largo', () => {
    // p1 va 1-10 abajo, empata 10-10 y gana 19-17: remonta 9 y se estira 8 puntos.
    const points = run('1' + '2'.repeat(10) + '1'.repeat(9) + '12'.repeat(7) + '11')
    const p1 = computeLeaderboard({ version: 1, players, matches: [played(points)], tournaments: [] }).stats.get('p1')!
    expect(p1.bestComeback).toBe(9)
    expect(p1.longestExtension).toBe(8)
    expect(familyLevel(family('comeback'), p1)).toBe(2)
    expect(familyLevel(family('marathon'), p1)).toBe(2)
  })

  it('cuenta partidos ganados en el juego decisivo', () => {
    const bo3: MatchConfig = { pointsToWin: 2, winByTwo: false, bestOf: 3, serveEvery: 1 }
    const p1 = computeLeaderboard({ version: 1, players, matches: [played(run('11' + '22' + '11'), bo3)], tournaments: [] }).stats.get('p1')!
    expect(p1.clutchWins).toBe(1)
  })

  it('guarda la mayor diferencia de ELO vencida', () => {
    // p2 le gana 6 veces a p3 y llega con más ELO; después p1 le gana a p2.
    const matches = [...Array.from({ length: 6 }, () => match('p2', 'p3', 'a')), match('p1', 'p2', 'a')]
    const p1 = computeLeaderboard({ version: 1, players, matches, tournaments: [] }).stats.get('p1')!
    expect(p1.biggestUpset).toBeGreaterThan(50)
  })

  it('detecta subidas de nivel entre dos momentos', () => {
    const before = computeLeaderboard({ version: 1, players, matches: [match('p1', 'p2', 'a'), match('p1', 'p2', 'a')], tournaments: [] })
    const after = computeLeaderboard({ version: 1, players, matches: [match('p1', 'p2', 'a'), match('p1', 'p2', 'a'), match('p1', 'p2', 'a')], tournaments: [] })
    const ups = levelUps(before.stats.get('p1'), after.stats.get('p1'))
    expect(ups.map((u) => [u.family.id, u.level])).toEqual([['streak', 0]])
  })

  it('cada nivel tiene su ilustración', async () => {
    const { ART } = await import('./medalArt')
    for (const f of ACHIEVEMENT_FAMILIES) for (const l of f.levels) expect(ART[l.name], l.name).toBeTypeOf('function')
  })
})

describe('torneos', () => {
  it('liga: todos juegan contra todos una vez', () => {
    const rounds = roundRobin(['a', 'b', 'c', 'd', 'e'])
    const pairs = rounds.flat().map(([x, y]) => [x, y].sort().join('-'))
    expect(pairs.length).toBe(10)
    expect(new Set(pairs).size).toBe(10)
    // Nadie juega dos veces en la misma jornada.
    for (const r of rounds) expect(new Set(r.flat()).size).toBe(r.length * 2)
  })

  it('liga: tabla y campeón', () => {
    const tour = { id: 't', name: 'T', createdAt: 0, format: 'league' as const, playerIds: ['p1', 'p2', 'p3'], config }
    const matches = [
      match('p1', 'p2', 'a', { tournamentId: 't' }),
      match('p1', 'p3', 'a', { tournamentId: 't' }),
      match('p2', 'p3', 'a', { tournamentId: 't' }),
    ]
    const data: AppData = { version: 1, players, matches, tournaments: [tour] }
    expect(leagueStandings('t', data).map((r) => r.playerId)).toEqual(['p1', 'p2', 'p3'])
    expect(tournamentChampion('t', data)).toBe('p1')
  })

  it('eliminación: BYEs nunca se cruzan entre sí', () => {
    const seeds = knockoutSeeds(['a', 'b', 'c', 'd', 'e'])
    expect(seeds.length).toBe(8)
    for (let i = 0; i < 8; i += 2) expect(seeds[i] !== null || seeds[i + 1] !== null).toBe(true)
  })

  it('eliminación: avanza ganadores y BYEs', () => {
    const seeds = knockoutSeeds(['p1', 'p2', 'p3'])
    // [p1, p3, p2, null]
    const r0 = bracketRounds(seeds, [])
    expect(r0[0][1].winner).toBe('p2')
    expect(r0[1][0].a).toBeUndefined()
    const semi = match('p1', 'p3', 'a', { tournamentId: 't', round: 0, slot: 0 })
    const final = match('p1', 'p2', 'b', { tournamentId: 't', round: 1, slot: 0 })
    const rounds = bracketRounds(seeds, [semi, final])
    expect(rounds[1][0].a).toBe('p1')
    expect(rounds[1][0].b).toBe('p2')
    expect(rounds[1][0].winner).toBe('p2')
  })
})

describe('dobles', () => {
  it('reparte el ELO a ambos integrantes de cada equipo', () => {
    const m = match('p1', 'p3', 'a', { partnerA: 'p2', partnerB: 'p4' })
    const board = computeLeaderboard({ version: 1, players, matches: [m], tournaments: [] })
    for (const id of ['p1', 'p2']) expect(board.stats.get(id)!.elo).toBe(INITIAL_ELO + 16)
    for (const id of ['p3', 'p4']) expect(board.stats.get(id)!.elo).toBe(INITIAL_ELO - 16)
    expect(board.stats.get('p2')!.doublesWins).toBe(1)
    expect(board.stats.get('p4')!.losses).toBe(1)
  })
})

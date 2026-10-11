import { describe, expect, it } from 'vitest'
import { computeMatch } from './scoring'
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
    expect(p1.achievements).toContain('first-win')
  })

  it('cuenta rachas', () => {
    const matches = [match('p1', 'p2', 'a'), match('p1', 'p3', 'a'), match('p4', 'p1', 'b'), match('p1', 'p2', 'b')]
    const p1 = computeLeaderboard({ version: 1, players, matches, tournaments: [] }).stats.get('p1')!
    expect(p1.bestStreak).toBe(3)
    expect(p1.streak).toBe(-1)
    expect(p1.achievements).toContain('streak-3')
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

import type { MatchConfig, Side } from './types'

export interface GameScore {
  a: number
  b: number
  winner?: Side
}

export interface MatchState {
  /** Todos los juegos, el último puede estar en curso. */
  games: GameScore[]
  current: GameScore
  gamesWon: { a: number; b: number }
  finished: boolean
  /** Ganador del partido; `null` si terminó empatado; `undefined` si sigue. */
  winner?: Side | null
  /** Quién saca el próximo punto. */
  server: Side
  /** Lado que está a un punto de ganar el juego. */
  gamePoint?: Side
  /** Lado que está a un punto de ganar el partido. */
  matchPoint?: Side
  /** Cantidad de juegos que hay que ganar para llevarse el partido. */
  gamesNeeded: number
}

export const other = (s: Side): Side => (s === 'a' ? 'b' : 'a')

export function gamesNeeded(config: MatchConfig): number {
  return Math.floor(config.bestOf / 2) + 1
}

export function gameWinner(a: number, b: number, config: MatchConfig): Side | undefined {
  const target = config.pointsToWin
  const margin = config.winByTwo ? 2 : 1
  if (a >= target && a - b >= margin) return 'a'
  if (b >= target && b - a >= margin) return 'b'
  return undefined
}

/** Quién saca, según el marcador del juego y quién sacó primero en ese juego. */
export function serverFor(a: number, b: number, config: MatchConfig, gameFirstServer: Side): Side {
  const total = a + b
  const deuceAt = config.pointsToWin - 1
  let turns: number
  if (config.winByTwo && a >= deuceAt && b >= deuceAt && deuceAt > 0) {
    // En "deuce" se alterna el saque en cada punto.
    const pointsBeforeDeuce = deuceAt * 2
    const turnsBeforeDeuce = Math.ceil(pointsBeforeDeuce / config.serveEvery)
    turns = turnsBeforeDeuce + (total - pointsBeforeDeuce)
  } else {
    turns = Math.floor(total / Math.max(1, config.serveEvery))
  }
  return turns % 2 === 0 ? gameFirstServer : other(gameFirstServer)
}

function wouldWinGame(side: Side, g: GameScore, config: MatchConfig): boolean {
  const a = g.a + (side === 'a' ? 1 : 0)
  const b = g.b + (side === 'b' ? 1 : 0)
  return gameWinner(a, b, config) === side
}

/** Reconstruye el estado del partido a partir de la secuencia de puntos. */
export function computeMatch(points: Side[], config: MatchConfig, firstServer: Side): MatchState {
  const needed = gamesNeeded(config)
  const games: GameScore[] = [{ a: 0, b: 0 }]
  const gamesWon = { a: 0, b: 0 }
  let finished = false
  let winner: Side | null | undefined

  for (const p of points) {
    if (finished) break
    const g = games[games.length - 1]
    g[p]++
    const w = gameWinner(g.a, g.b, config)
    if (w) {
      g.winner = w
      gamesWon[w]++
      const played = gamesWon.a + gamesWon.b
      if (gamesWon[w] >= needed) {
        finished = true
        winner = w
      } else if (played >= config.bestOf) {
        finished = true
        winner = gamesWon.a === gamesWon.b ? null : gamesWon.a > gamesWon.b ? 'a' : 'b'
      } else {
        games.push({ a: 0, b: 0 })
      }
    }
  }

  const current = games[games.length - 1]
  const gameIndex = games.length - 1
  const gameFirstServer = gameIndex % 2 === 0 ? firstServer : other(firstServer)
  const server = serverFor(current.a, current.b, config, gameFirstServer)

  let gamePoint: Side | undefined
  let matchPoint: Side | undefined
  if (!finished) {
    for (const s of ['a', 'b'] as const) {
      if (wouldWinGame(s, current, config)) {
        gamePoint = s
        const played = gamesWon.a + gamesWon.b + 1
        const won = gamesWon[s] + 1
        if (won >= needed || (played >= config.bestOf && won > gamesWon[other(s)])) matchPoint = s
      }
    }
  }

  return { games, current, gamesWon, finished, winner, server, gamePoint, matchPoint, gamesNeeded: needed }
}

/** Puntos totales ganados por cada lado. */
export function pointTotals(points: Side[]): { a: number; b: number } {
  let a = 0
  for (const p of points) if (p === 'a') a++
  return { a, b: points.length - a }
}

export function describeConfig(config: MatchConfig): string {
  const parts = [`a ${config.pointsToWin}`]
  if (config.bestOf > 1) parts.push(`al mejor de ${config.bestOf}`)
  else parts.push('1 juego')
  if (!config.winByTwo) parts.push('sin diferencia de 2')
  return parts.join(' · ')
}

export const DEFAULT_CONFIG: MatchConfig = {
  pointsToWin: 11,
  winByTwo: true,
  bestOf: 3,
  serveEvery: 2,
}

/** Saques recomendados según la cantidad de puntos por juego. */
export function suggestedServeEvery(pointsToWin: number): number {
  if (pointsToWin >= 21) return 5
  if (pointsToWin <= 3) return 1
  return 2
}

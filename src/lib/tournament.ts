import type { Id } from './types'

/** Mezcla un array (Fisher–Yates). */
export function shuffle<T>(arr: T[], random: () => number = Math.random): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/**
 * Fixture de liga "todos contra todos" con el método del círculo.
 * Devuelve una lista de jornadas, cada una con sus cruces.
 */
export function roundRobin(playerIds: Id[], doubleRound = false): [Id, Id][][] {
  const list: (Id | null)[] = [...playerIds]
  if (list.length % 2 === 1) list.push(null)
  const n = list.length
  const rounds: [Id, Id][][] = []
  for (let r = 0; r < n - 1; r++) {
    const round: [Id, Id][] = []
    for (let i = 0; i < n / 2; i++) {
      const x = list[i]
      const y = list[n - 1 - i]
      if (x && y) round.push(r % 2 === 0 ? [x, y] : [y, x])
    }
    rounds.push(round)
    // Rotar todos menos el primero.
    list.splice(1, 0, list.pop()!)
  }
  if (doubleRound) {
    return [...rounds, ...rounds.map((round) => round.map(([x, y]) => [y, x] as [Id, Id]))]
  }
  return rounds
}

/**
 * Posiciones iniciales del cuadro de eliminación. Completa con BYEs (null)
 * hasta la siguiente potencia de 2, sin que dos BYEs se crucen entre sí.
 */
export function knockoutSeeds(playerIds: Id[]): (Id | null)[] {
  let size = 2
  while (size < playerIds.length) size *= 2
  const seeds: (Id | null)[] = new Array(size).fill(null)
  const half = size / 2
  playerIds.forEach((id, i) => {
    if (i < half) seeds[2 * i] = id
    else seeds[2 * (i - half) + 1] = id
  })
  return seeds
}

export function roundName(round: number, totalRounds: number): string {
  const fromEnd = totalRounds - round
  if (fromEnd === 1) return 'Final'
  if (fromEnd === 2) return 'Semifinal'
  if (fromEnd === 3) return 'Cuartos de final'
  if (fromEnd === 4) return 'Octavos de final'
  return `Ronda ${round + 1}`
}

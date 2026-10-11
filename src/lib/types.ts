export type Id = string

/** Lado de la mesa dentro de un partido: jugador A o jugador B. */
export type Side = 'a' | 'b'

export interface Player {
  id: Id
  name: string
  emoji: string
  color: string
  createdAt: number
}

export interface MatchConfig {
  /** Puntos necesarios para ganar un juego (11, 21, 2, 4...). */
  pointsToWin: number
  /** Si hay que ganar por diferencia de 2 puntos. */
  winByTwo: boolean
  /** Cantidad de juegos del partido ("al mejor de N"). */
  bestOf: number
  /** Saques consecutivos de cada jugador antes de rotar. */
  serveEvery: number
}

export type MatchStatus = 'pending' | 'live' | 'finished'

export interface Match {
  id: Id
  createdAt: number
  startedAt?: number
  finishedAt?: number
  playerA: Id
  playerB: Id
  config: MatchConfig
  /** Secuencia completa de puntos: quién ganó cada punto, en orden. */
  points: Side[]
  /** Quién saca primero en el primer juego. */
  firstServer: Side
  status: MatchStatus
  /** Ganador al terminar. `null` = empate (posible con "al mejor de" par). */
  winner?: Id | null
  tournamentId?: Id
  /** Jornada (liga) o ronda (eliminación). Empieza en 0. */
  round?: number
  /** Posición dentro de la ronda (eliminación). */
  slot?: number
}

export type TournamentFormat = 'league' | 'knockout'

export interface Tournament {
  id: Id
  name: string
  createdAt: number
  format: TournamentFormat
  playerIds: Id[]
  config: MatchConfig
  /** Liga: ida y vuelta. */
  doubleRound?: boolean
  /** Eliminación: posiciones iniciales del cuadro (null = libre / BYE). */
  seeds?: (Id | null)[]
}

export interface AppData {
  version: 1
  players: Player[]
  matches: Match[]
  tournaments: Tournament[]
}

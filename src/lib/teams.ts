import type { Id, Match, Player, Side } from './types'

export function isDoubles(m: Match): boolean {
  return !!(m.partnerA && m.partnerB)
}

/** Jugadores de un lado del partido (1 en singles, 2 en dobles). */
export function sidePlayers(m: Match, side: Side): Id[] {
  const main = side === 'a' ? m.playerA : m.playerB
  const partner = side === 'a' ? m.partnerA : m.partnerB
  return partner ? [main, partner] : [main]
}

export function sideOf(m: Match, playerId: Id): Side | undefined {
  if (sidePlayers(m, 'a').includes(playerId)) return 'a'
  if (sidePlayers(m, 'b').includes(playerId)) return 'b'
  return undefined
}

export function involves(m: Match, playerId: Id): boolean {
  return sideOf(m, playerId) !== undefined
}

export function teamName(players: Player[]): string {
  return players.map((p) => p.name).join(' & ')
}

/** "Jugador" que representa a un equipo, para mostrar en pantalla. */
export function teamAsPlayer(team: Player[]): Player {
  if (team.length === 1) return team[0]
  return { id: team[0].id, name: teamName(team), emoji: team.map((p) => p.emoji).join(''), color: team[0].color, createdAt: 0 }
}

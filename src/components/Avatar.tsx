import type { Player } from '../lib/types'

export function Avatar({ player, size = 40 }: { player: Player; size?: number }) {
  return (
    <span
      className="avatar"
      style={{ width: size, height: size, fontSize: size * 0.55, background: player.color + '33', borderColor: player.color }}
      aria-hidden
    >
      {player.emoji}
    </span>
  )
}

/** Avatares superpuestos de un equipo (1 o 2 jugadores). */
export function TeamAvatar({ team, size = 40 }: { team: Player[]; size?: number }) {
  if (team.length === 1) return <Avatar player={team[0]} size={size} />
  const s = Math.round(size * 0.78)
  return (
    <span className="team-avatar" style={{ width: s * 1.6, height: size }}>
      {team.map((p, i) => (
        <Avatar key={p.id + i} player={p} size={s} />
      ))}
    </span>
  )
}

export function PlayerTag({ player, size = 28 }: { player: Player; size?: number }) {
  return (
    <span className="player-tag">
      <Avatar player={player} size={size} />
      <span className="player-tag-name">{player.name}</span>
    </span>
  )
}

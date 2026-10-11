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

export function PlayerTag({ player, size = 28 }: { player: Player; size?: number }) {
  return (
    <span className="player-tag">
      <Avatar player={player} size={size} />
      <span className="player-tag-name">{player.name}</span>
    </span>
  )
}

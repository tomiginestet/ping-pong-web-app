import { Link } from 'react-router-dom'
import type { Id, Player } from '../lib/types'
import { Avatar } from './Avatar'

interface Props {
  players: Player[]
  selected: Id[]
  onToggle: (id: Id) => void
  /** Etiqueta opcional para cada jugador seleccionado (p. ej. "1" / "2"). */
  badge?: (id: Id) => string | undefined
}

export function PlayerPicker({ players, selected, onToggle, badge }: Props) {
  if (!players.length) {
    return (
      <div className="empty">
        Todavía no hay jugadores. <Link to="/jugadores">Creá algunos</Link> para empezar.
      </div>
    )
  }
  return (
    <div className="picker">
      {players.map((p) => {
        const isSel = selected.includes(p.id)
        const b = badge?.(p.id)
        return (
          <button key={p.id} type="button" className={'picker-item' + (isSel ? ' active' : '')} onClick={() => onToggle(p.id)} style={isSel ? { borderColor: p.color } : undefined}>
            <Avatar player={p} size={44} />
            <span className="picker-name">{p.name}</span>
            {b && <span className="picker-badge" style={{ background: p.color }}>{b}</span>}
          </button>
        )
      })}
    </div>
  )
}

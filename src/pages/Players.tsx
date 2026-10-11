import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Avatar } from '../components/Avatar'
import { PlayerForm } from '../components/PlayerForm'
import { useLeaderboard } from '../lib/hooks'
import { levelFor } from '../lib/stats'
import { actions, useData } from '../lib/store'

export function Players() {
  const data = useData()
  const board = useLeaderboard()
  const [adding, setAdding] = useState(data.players.length === 0)
  const players = [...data.players].sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div className="page">
      <div className="section-head">
        <h1>Jugadores</h1>
        {!adding && (
          <button className="btn primary" onClick={() => setAdding(true)}>
            + Nuevo
          </button>
        )}
      </div>

      {adding && (
        <PlayerForm submitLabel="Agregar jugador" onSubmit={(v) => actions.addPlayer(v.name, v.emoji, v.color)} onCancel={data.players.length ? () => setAdding(false) : undefined} />
      )}

      <div className="list">
        {players.map((p) => {
          const s = board.stats.get(p.id)
          const level = levelFor(s?.elo ?? 1000)
          return (
            <Link key={p.id} to={`/jugadores/${p.id}`} className="card player-row">
              <Avatar player={p} size={44} />
              <div className="grow">
                <strong>{p.name}</strong>
                <div className="muted small">
                  {level.emoji} {level.name} · {s?.played ?? 0} partidos · {s?.wins ?? 0} victorias
                </div>
              </div>
              <span className="elo">{s?.elo ?? 1000}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

import { Link } from 'react-router-dom'
import { Avatar } from '../components/Avatar'
import { formatDate, usePlayerMap } from '../lib/hooks'
import { describeConfig } from '../lib/scoring'
import { tournamentChampion } from '../lib/stats'
import { useData } from '../lib/store'

export function Tournaments() {
  const data = useData()
  const players = usePlayerMap()
  const list = [...data.tournaments].sort((a, b) => b.createdAt - a.createdAt)

  return (
    <div className="page">
      <div className="section-head">
        <h1>Torneos</h1>
        <Link to="/torneos/nuevo" className="btn primary">
          + Nuevo
        </Link>
      </div>
      {!list.length && (
        <div className="empty">
          <div className="big-emoji">🎪</div>
          Armá un torneíto entre amigos: liga (todos contra todos) o eliminación directa.
        </div>
      )}
      <div className="list">
        {list.map((t) => {
          const champ = tournamentChampion(t.id, data)
          const champion = champ ? players.get(champ) : undefined
          const ms = data.matches.filter((m) => m.tournamentId === t.id)
          const done = ms.filter((m) => m.status === 'finished').length
          return (
            <Link key={t.id} to={`/torneos/${t.id}`} className="card tournament-card">
              <div className="row-between">
                <strong>{t.name}</strong>
                {champion ? <span className="pill gold">🏆 {champion.name}</span> : <span className="pill live">En curso</span>}
              </div>
              <span className="muted small">
                {t.format === 'league' ? (t.doubleRound ? 'Liga ida y vuelta' : 'Liga') : 'Eliminación directa'} · {describeConfig(t.config)}
              </span>
              <div className="avatar-stack">
                {t.playerIds.map((id) => {
                  const p = players.get(id)
                  return p ? <Avatar key={id} player={p} size={28} /> : null
                })}
              </div>
              <span className="muted small">
                {formatDate(t.createdAt)} · {done} partidos jugados
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

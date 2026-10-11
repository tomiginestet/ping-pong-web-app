import { Link } from 'react-router-dom'
import { TournamentCard } from '../components/TournamentCard'
import { usePlayerMap } from '../lib/hooks'
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
        {list.map((t) => (
          <TournamentCard key={t.id} t={t} data={data} players={players} />
        ))}
      </div>
    </div>
  )
}

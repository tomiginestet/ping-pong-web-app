import { Link } from 'react-router-dom'
import { formatDate } from '../lib/hooks'
import { describeConfig } from '../lib/scoring'
import { tournamentChampion } from '../lib/stats'
import type { AppData, Id, Player, Tournament } from '../lib/types'
import { Avatar } from './Avatar'

export function TournamentCard({ t, data, players }: { t: Tournament; data: AppData; players: Map<Id, Player> }) {
  const champ = tournamentChampion(t.id, data)
  const champion = champ ? players.get(champ) : undefined
  const ms = data.matches.filter((m) => m.tournamentId === t.id)
  const done = ms.filter((m) => m.status === 'finished').length
  // En eliminación los partidos se crean a medida que avanza el cuadro; cada uno elimina a un jugador.
  const total = t.format === 'league' ? ms.length : t.playerIds.length - 1
  const format = t.format === 'league' ? (t.doubleRound ? 'Liga ida y vuelta' : 'Liga') : 'Eliminación directa'

  return (
    <Link to={`/torneos/${t.id}`} className="card tournament-card">
      <div className="row-between">
        <strong className="grow">{t.name}</strong>
        {champion ? <span className="pill gold">🏆 {champion.name}</span> : <span className="pill live">En curso</span>}
      </div>
      <span className="muted small">
        {format} · {describeConfig(t.config)}
      </span>
      <div className="row-between">
        <div className="avatar-stack">
          {t.playerIds.map((id) => {
            const p = players.get(id)
            return p ? <Avatar key={id} player={p} size={26} /> : null
          })}
        </div>
        <span className="muted small">{formatDate(t.createdAt)}</span>
      </div>
      {!champion && total > 0 && (
        <>
          <div className="mini-progress" aria-hidden>
            <div style={{ width: `${(done / total) * 100}%` }} />
          </div>
          <span className="muted small">
            {done} de {total} partidos jugados
          </span>
        </>
      )}
    </Link>
  )
}

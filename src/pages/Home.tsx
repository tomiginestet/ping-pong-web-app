import { Link } from 'react-router-dom'
import { Avatar } from '../components/Avatar'
import { MatchRow } from '../components/MatchRow'
import { TournamentCard } from '../components/TournamentCard'
import { SyncBadge } from './ClubPage'
import { useLeaderboard, usePlayerMap } from '../lib/hooks'
import { levelFor, rankedPlayers, tournamentChampion } from '../lib/stats'
import { actions, useData } from '../lib/store'

export function Home() {
  const data = useData()
  const board = useLeaderboard()
  const players = usePlayerMap()
  const live = data.matches.filter((m) => m.status === 'live').sort((x, y) => (y.startedAt ?? 0) - (x.startedAt ?? 0))
  const recent = data.matches
    .filter((m) => m.status === 'finished')
    .sort((x, y) => (y.finishedAt ?? 0) - (x.finishedAt ?? 0))
    .slice(0, 5)
  const ranked = rankedPlayers(data.players, board).filter((r) => r.stats.played > 0)
  const podium = ranked.slice(0, 3)
  const activeTournaments = data.tournaments.filter((t) => !tournamentChampion(t.id, data))

  return (
    <div className="page">
      <header className="home-header">
        <div className="grow">
          <h1>🏓 Ping Pong Club</h1>
          <p className="muted">Partidos, torneos y quién manda en la mesa.</p>
        </div>
        <div className="header-tools">
          <SyncBadge />
          <Link to="/ajustes" className="tool-btn" aria-label="Ajustes" title="Ajustes y copia de seguridad">
            ⚙️
          </Link>
        </div>
      </header>

      <div className="quick-actions">
        <Link to="/partido/nuevo" className="btn primary big">
          ⚡ Partido rápido
        </Link>
        <Link to="/torneos/nuevo" className="btn big">
          🎪 Nuevo torneo
        </Link>
      </div>

      {data.players.length < 2 && (
        <div className="card onboarding">
          <h3>¡Arranquemos!</h3>
          <p>Primero creá al menos dos jugadores. Después armá un partido o un torneo.</p>
          <Link to="/jugadores" className="btn primary">
            👥 Crear jugadores
          </Link>
        </div>
      )}

      {live.length > 0 && (
        <section>
          <h2>En juego</h2>
          <div className="list">
            {live.map((m) => (
              <div key={m.id} className="live-item">
                <MatchRow match={m} players={players} />
                {!m.tournamentId && (
                  <button className="link-btn danger-text small" onClick={() => confirm('¿Descartar este partido sin terminar?') && actions.deleteMatch(m.id)}>
                    🗑️ Descartar
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTournaments.length > 0 && (
        <section>
          <div className="section-head">
            <h2>Torneos en curso</h2>
            <Link to="/torneos">Ver todos →</Link>
          </div>
          <div className="list">
            {activeTournaments.map((t) => (
              <TournamentCard key={t.id} t={t} data={data} players={players} />
            ))}
          </div>
        </section>
      )}

      {podium.length > 0 && (
        <section>
          <div className="section-head">
            <h2>Podio</h2>
            <Link to="/ranking">Ver ranking →</Link>
          </div>
          <div className="podium">
            {[podium[1], podium[0], podium[2]].map((r, i) =>
              r ? (
                <Link key={r.player.id} to={`/jugadores/${r.player.id}`} className={'podium-spot place-' + [2, 1, 3][i]}>
                  <span className="podium-medal">{['🥈', '🥇', '🥉'][i]}</span>
                  <Avatar player={r.player} size={i === 1 ? 64 : 48} />
                  <span className="podium-name">{r.player.name}</span>
                  <span className="podium-elo">
                    {levelFor(r.stats.elo).emoji} {r.stats.elo}
                  </span>
                  <div className="podium-block" />
                </Link>
              ) : (
                <div key={i} className="podium-spot empty-spot" />
              ),
            )}
          </div>
        </section>
      )}

      {recent.length > 0 && (
        <section>
          <div className="section-head">
            <h2>Últimos partidos</h2>
            <Link to="/historial">Ver todo →</Link>
          </div>
          <div className="list">
            {recent.map((m) => (
              <MatchRow key={m.id} match={m} players={players} eloDelta={board.eloDeltas.get(m.id)} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

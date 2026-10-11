import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Avatar } from '../components/Avatar'
import { MatchRow } from '../components/MatchRow'
import { PlayerForm } from '../components/PlayerForm'
import { Sparkline } from '../components/Sparkline'
import { UNKNOWN_PLAYER, useLeaderboard, usePlayerMap } from '../lib/hooks'
import { ACHIEVEMENTS, headToHead, LEVELS, levelFor, rankedPlayers, winRate, type AchievementId } from '../lib/stats'
import { actions, useData } from '../lib/store'

export function PlayerDetail() {
  const { id } = useParams()
  const data = useData()
  const board = useLeaderboard()
  const players = usePlayerMap()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const player = data.players.find((p) => p.id === id)

  if (!player) {
    return (
      <div className="page">
        <p>Jugador no encontrado.</p>
        <Link to="/jugadores">← Volver</Link>
      </div>
    )
  }

  const s = board.stats.get(player.id)!
  const level = levelFor(s.elo)
  const nextLevel = LEVELS.find((l) => l.min > s.elo)
  const position = rankedPlayers(data.players, board).findIndex((r) => r.player.id === player.id) + 1
  const h2h = headToHead(player.id, data.matches)
  const matches = data.matches
    .filter((m) => m.status === 'finished' && (m.playerA === player.id || m.playerB === player.id))
    .sort((x, y) => (y.finishedAt ?? 0) - (x.finishedAt ?? 0))
  const hasPlayed = data.matches.some((m) => m.playerA === player.id || m.playerB === player.id) || data.tournaments.some((t) => t.playerIds.includes(player.id))

  return (
    <div className="page">
      <Link to="/jugadores" className="back">
        ← Jugadores
      </Link>

      {editing ? (
        <PlayerForm
          initial={player}
          submitLabel="Guardar"
          onSubmit={(v) => {
            actions.updatePlayer(player.id, v)
            setEditing(false)
          }}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <header className="profile" style={{ ['--player-color' as string]: player.color }}>
          <Avatar player={player} size={88} />
          <h1>{player.name}</h1>
          <div className="level-badge">
            {level.emoji} {level.name}
          </div>
          <div className="profile-elo">
            <span className="big-number">{s.elo}</span>
            <span className="muted">ELO · #{position} del ranking</span>
          </div>
          {nextLevel && (
            <div className="progress" title={`Faltan ${nextLevel.min - s.elo} para ${nextLevel.name}`}>
              <div
                className="progress-bar"
                style={{ width: `${Math.max(4, Math.min(100, ((s.elo - Math.max(level.min, 800)) / (nextLevel.min - Math.max(level.min, 800))) * 100))}%` }}
              />
              <span className="progress-label">
                {nextLevel.min - s.elo} para {nextLevel.emoji} {nextLevel.name}
              </span>
            </div>
          )}
          <button className="btn small" onClick={() => setEditing(true)}>
            ✏️ Editar
          </button>
        </header>
      )}

      <div className="stat-grid">
        <Stat label="Partidos" value={s.played} />
        <Stat label="Victorias" value={s.wins} />
        <Stat label="Derrotas" value={s.losses} />
        <Stat label="% victorias" value={`${Math.round(winRate(s) * 100)}%`} />
        <Stat label="Racha" value={s.streak > 0 ? `🔥 ${s.streak}` : s.streak < 0 ? `🥶 ${-s.streak}` : '–'} />
        <Stat label="Mejor racha" value={s.bestStreak} />
        <Stat label="Juegos" value={`${s.gamesWon}-${s.gamesLost}`} />
        <Stat label="Puntos" value={`${s.pointsWon}-${s.pointsLost}`} />
        <Stat label="Torneos" value={`🏆 ${s.tournamentsWon}`} />
      </div>

      {s.eloHistory.length > 1 && (
        <section className="card">
          <h3>Evolución del ELO</h3>
          <Sparkline values={s.eloHistory} color={player.color} />
        </section>
      )}

      <section>
        <h2>
          Logros <span className="muted small">{s.achievements.length}/{Object.keys(ACHIEVEMENTS).length}</span>
        </h2>
        <div className="badges">
          {(Object.keys(ACHIEVEMENTS) as AchievementId[]).map((a) => {
            const info = ACHIEVEMENTS[a]
            const unlocked = s.achievements.includes(a)
            return (
              <div key={a} className={'badge' + (unlocked ? ' unlocked' : '')} title={info.description}>
                <span className="badge-emoji">{unlocked ? info.emoji : '🔒'}</span>
                <span className="badge-name">{info.name}</span>
                <span className="badge-desc">{info.description}</span>
              </div>
            )
          })}
        </div>
      </section>

      {h2h.length > 0 && (
        <section>
          <h2>Cara a cara</h2>
          <div className="list">
            {h2h.map((h) => {
              const opp = players.get(h.opponentId) ?? UNKNOWN_PLAYER
              return (
                <Link key={h.opponentId} to={`/jugadores/${opp.id}`} className="card h2h-row">
                  <Avatar player={opp} size={36} />
                  <span className="grow">vs {opp.name}</span>
                  <span className="h2h-record">
                    <b className="win-text">{h.wins}</b> - <b className="loss-text">{h.losses}</b>
                    {h.draws > 0 && <span className="muted"> ({h.draws} emp.)</span>}
                  </span>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {matches.length > 0 && (
        <section>
          <h2>Partidos</h2>
          <div className="list">
            {matches.slice(0, 30).map((m) => (
              <MatchRow key={m.id} match={m} players={players} eloDelta={board.eloDeltas.get(m.id)} perspective={player.id} />
            ))}
          </div>
        </section>
      )}

      {!hasPlayed && (
        <button
          className="btn danger"
          onClick={() => {
            if (confirm(`¿Borrar a ${player.name}?`) && actions.deletePlayer(player.id)) navigate('/jugadores')
          }}
        >
          🗑️ Borrar jugador
        </button>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="stat">
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  )
}

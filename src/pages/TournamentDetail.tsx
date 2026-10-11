import { ArrowLeftIcon, PingPongIcon, PlayIcon, TrashIcon, TrophyIcon } from '@phosphor-icons/react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Avatar } from '../components/Avatar'
import { MatchRow } from '../components/MatchRow'
import { UNKNOWN_PLAYER, usePlayerMap } from '../lib/hooks'
import { computeMatch, describeConfig } from '../lib/scoring'
import { bracketRounds, leagueStandings, tournamentChampion, type BracketSlot } from '../lib/stats'
import { actions, useData } from '../lib/store'
import { roundName } from '../lib/tournament'
import type { Id, Match, Player, Tournament } from '../lib/types'

export function TournamentDetail() {
  const { id } = useParams()
  const data = useData()
  const players = usePlayerMap()
  const navigate = useNavigate()
  const t = data.tournaments.find((x) => x.id === id)

  if (!t) {
    return (
      <div className="page">
        <p>Torneo no encontrado.</p>
        <Link to="/torneos" className="back">
          <ArrowLeftIcon /> Torneos
        </Link>
      </div>
    )
  }

  const matches = data.matches.filter((m) => m.tournamentId === t.id)
  const champId = tournamentChampion(t.id, data)
  const champion = champId ? players.get(champId) : undefined

  return (
    <div className="page">
      <Link to="/torneos" className="back">
        <ArrowLeftIcon /> Torneos
      </Link>
      <header className="tournament-header">
        <h1>{t.name}</h1>
        <p className="muted">
          {t.format === 'league' ? (t.doubleRound ? 'Liga ida y vuelta' : 'Liga') : 'Eliminación directa'} · {describeConfig(t.config)}
        </p>
      </header>

      {champion && (
        <div className="champion-banner">
          <TrophyIcon className="big-icon gold" weight="duotone" />
          <Avatar player={champion} size={72} />
          <div>
            <div className="muted small">Campeón</div>
            <strong className="champion-name">{champion.name}</strong>
          </div>
        </div>
      )}

      {t.format === 'league' ? <League t={t} matches={matches} players={players} /> : <Knockout t={t} matches={matches} players={players} />}

      <button
        className="btn danger"
        onClick={() => {
          if (confirm(`¿Borrar el torneo "${t.name}" y todos sus partidos?`)) {
            actions.deleteTournament(t.id)
            navigate('/torneos')
          }
        }}
      >
        <TrashIcon /> Borrar torneo
      </button>
    </div>
  )
}

function League({ t, matches, players }: { t: Tournament; matches: Match[]; players: Map<Id, Player> }) {
  const data = useData()
  const rows = leagueStandings(t.id, data)
  const rounds = new Map<number, Match[]>()
  for (const m of [...matches].sort((a, b) => a.createdAt - b.createdAt)) {
    const r = m.round ?? 0
    rounds.set(r, [...(rounds.get(r) ?? []), m])
  }
  const next = matches.filter((m) => m.status !== 'finished').sort((a, b) => (a.status === 'live' ? -1 : b.status === 'live' ? 1 : a.createdAt - b.createdAt))[0]

  return (
    <>
      {next && (
        <Link to={`/partido/${next.id}`} className="btn primary big block">
          {next.status === 'live' ? <PlayIcon weight="fill" /> : <PingPongIcon />}
          {next.status === 'live' ? 'Continuar' : 'Jugar'}: {players.get(next.playerA)?.name} vs {players.get(next.playerB)?.name}
        </Link>
      )}

      <section>
        <h2>Tabla</h2>
        <div className="table-wrap">
          <table className="standings">
            <thead>
              <tr>
                <th>#</th>
                <th className="left">Jugador</th>
                <th title="Partidos jugados">PJ</th>
                <th title="Ganados">G</th>
                <th title="Empatados">E</th>
                <th title="Perdidos">P</th>
                <th title="Diferencia de juegos">DJ</th>
                <th title="Puntos">Pts</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const p = players.get(r.playerId) ?? UNKNOWN_PLAYER
                const dg = r.gamesFor - r.gamesAgainst
                return (
                  <tr key={r.playerId} className={i === 0 && r.played > 0 ? 'leader' : undefined}>
                    <td>{i + 1}</td>
                    <td className="left player-cell">
                      <span className="player-tag">
                        <Avatar player={p} size={24} />
                        <span className="player-tag-name">{p.name}</span>
                      </span>
                    </td>
                    <td>{r.played}</td>
                    <td>{r.wins}</td>
                    <td>{r.draws}</td>
                    <td>{r.losses}</td>
                    <td>{dg > 0 ? `+${dg}` : dg}</td>
                    <td className="pts">
                      <b>{r.points}</b>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className="muted small">Victoria 3 pts · Empate 1 pt. Desempata la diferencia de juegos y luego de puntos.</p>
      </section>

      {[...rounds.entries()].map(([r, ms]) => (
        <section key={r}>
          <h3>Fecha {r + 1}</h3>
          <div className="list">
            {ms.map((m) => (
              <MatchRow key={m.id} match={m} players={players} showDate={false} />
            ))}
          </div>
        </section>
      ))}
    </>
  )
}

function Knockout({ t, matches, players }: { t: Tournament; matches: Match[]; players: Map<Id, Player> }) {
  const rounds = bracketRounds(t.seeds ?? [], matches)
  return (
    <section>
      <h2>Cuadro</h2>
      <div className="bracket">
        {rounds.map((round, r) => (
          <div key={r} className="bracket-round">
            <h4>{roundName(r, rounds.length)}</h4>
            <div className="bracket-slots">
              {round.map((slot) => (
                <BracketCard key={slot.slot} t={t} slot={slot} players={players} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function BracketCard({ t, slot, players }: { t: Tournament; slot: BracketSlot; players: Map<Id, Player> }) {
  const navigate = useNavigate()
  const m = slot.match
  const state = m ? computeMatch(m.points, m.config, m.firstServer) : undefined
  // El partido guarda A/B según cómo se creó; lo mostramos en el orden del cuadro.
  const gamesOf = (id: Id | null | undefined) => {
    if (!m || !state || !id || m.status === 'pending') return ''
    return m.playerA === id ? state.gamesWon.a : m.playerB === id ? state.gamesWon.b : ''
  }
  const line = (id: Id | null | undefined) => {
    if (id === null) return <div className="bk-line bye">— libre —</div>
    if (id === undefined) return <div className="bk-line tbd">Por definir</div>
    const p = players.get(id) ?? UNKNOWN_PLAYER
    return (
      <div className={'bk-line' + (slot.winner === id ? ' winner' : slot.winner ? ' loser' : '')}>
        <Avatar player={p} size={24} />
        <span className="grow">{p.name}</span>
        <b>{gamesOf(id)}</b>
      </div>
    )
  }
  const playable = slot.a && slot.b && !slot.winner
  const play = () => {
    if (!slot.a || !slot.b) return
    const match = actions.ensureKnockoutMatch(t.id, slot.round, slot.slot, slot.a, slot.b)
    navigate(`/partido/${match.id}`)
  }
  return (
    <div className={'bracket-card' + (slot.isBye ? ' is-bye' : '')}>
      {line(slot.a)}
      {line(slot.b)}
      {playable && (
        <button className="btn small primary block" onClick={play}>
          {m?.status === 'live' ? <PlayIcon weight="fill" /> : <PingPongIcon />}
          {m?.status === 'live' ? 'Continuar' : 'Jugar'}
        </button>
      )}
      {m && m.status === 'finished' && (
        <Link to={`/partido/${m.id}`} className="bk-detail muted small">
          {state?.games.map((g) => `${g.a}-${g.b}`).join(' · ')}
        </Link>
      )}
    </div>
  )
}

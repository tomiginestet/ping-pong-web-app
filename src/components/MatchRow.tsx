import { Link } from 'react-router-dom'
import { formatDate, UNKNOWN_PLAYER } from '../lib/hooks'
import { computeMatch } from '../lib/scoring'
import type { Match, Player, Id } from '../lib/types'
import { sidePlayers, sideOf, teamName } from '../lib/teams'
import { TeamAvatar } from './Avatar'

interface Props {
  match: Match
  players: Map<Id, Player>
  eloDelta?: { a: number; b: number }
  showDate?: boolean
  /** Desde la perspectiva de un jugador (para colorear victoria/derrota). */
  perspective?: Id
}

export function MatchRow({ match: m, players, eloDelta, showDate = true, perspective }: Props) {
  const teamOf = (s: 'a' | 'b') => sidePlayers(m, s).map((id) => players.get(id) ?? UNKNOWN_PLAYER)
  const a = teamOf('a')
  const b = teamOf('b')
  const state = computeMatch(m.points, m.config, m.firstServer)
  const finished = m.status === 'finished'
  const live = m.status === 'live'
  const games = state.games.filter((g) => g.winner || g.a + g.b > 0)
  let resultClass = ''
  const mySide = perspective ? sideOf(m, perspective) : undefined
  if (mySide && finished) resultClass = state.winner === mySide ? ' win' : state.winner === null ? ' draw' : ' loss'

  const side = (team: Player[], s: 'a' | 'b') => (
    <div className={'mr-player' + (finished && state.winner === s ? ' winner' : '')}>
      <TeamAvatar team={team} size={30} />
      <span className="mr-name">{teamName(team)}</span>
      {live && state.server === s && (
        <span className="mr-serve" title="Saca" aria-label="Saca">
          🏓
        </span>
      )}
      {eloDelta && <span className={'elo-delta ' + (eloDelta[s] >= 0 ? 'up' : 'down')}>{eloDelta[s] >= 0 ? '+' : ''}{eloDelta[s]}</span>}
      {/* En vivo, lo grande es el tanteo del juego actual; terminado, los juegos ganados. */}
      <span className={'mr-games' + (live ? ' live' : '')}>{m.status === 'pending' ? '' : live ? state.current[s] : state.gamesWon[s]}</span>
    </div>
  )

  return (
    <Link to={`/partido/${m.id}`} className={'match-row' + resultClass + (live ? ' is-live' : '')}>
      <div className="mr-players">
        {side(a, 'a')}
        {side(b, 'b')}
      </div>
      <div className="mr-meta">
        {m.status === 'pending' && <span className="pill">Por jugar</span>}
        {live && <span className="pill live">● En juego</span>}
        {live && (
          <span className="mr-detail">
            Juego {state.games.length}
            {state.gamesNeeded > 1 && ` · Juegos ${state.gamesWon.a}-${state.gamesWon.b}`}
          </span>
        )}
        {finished && games.length > 0 && <span className="mr-detail">{games.map((g) => `${g.a}-${g.b}`).join(', ')}</span>}
        {finished && m.winner === null && <span className="pill">Empate</span>}
        {showDate && <span className="mr-date">{formatDate(m.finishedAt ?? m.startedAt ?? m.createdAt)}</span>}
      </div>
    </Link>
  )
}

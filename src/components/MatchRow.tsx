import { Link } from 'react-router-dom'
import { formatDate, UNKNOWN_PLAYER } from '../lib/hooks'
import { computeMatch } from '../lib/scoring'
import type { Match, Player, Id } from '../lib/types'
import { Avatar } from './Avatar'

interface Props {
  match: Match
  players: Map<Id, Player>
  eloDelta?: { a: number; b: number }
  showDate?: boolean
  /** Desde la perspectiva de un jugador (para colorear victoria/derrota). */
  perspective?: Id
}

export function MatchRow({ match: m, players, eloDelta, showDate = true, perspective }: Props) {
  const a = players.get(m.playerA) ?? UNKNOWN_PLAYER
  const b = players.get(m.playerB) ?? UNKNOWN_PLAYER
  const state = computeMatch(m.points, m.config, m.firstServer)
  const finished = m.status === 'finished'
  const games = state.games.filter((g) => g.winner || g.a + g.b > 0)
  let resultClass = ''
  if (perspective && finished) resultClass = m.winner === perspective ? ' win' : m.winner === null ? ' draw' : ' loss'

  const side = (p: Player, s: 'a' | 'b') => (
    <div className={'mr-player' + (finished && state.winner === s ? ' winner' : '')}>
      <Avatar player={p} size={30} />
      <span className="mr-name">{p.name}</span>
      {eloDelta && <span className={'elo-delta ' + (eloDelta[s] >= 0 ? 'up' : 'down')}>{eloDelta[s] >= 0 ? '+' : ''}{eloDelta[s]}</span>}
      <span className="mr-games">{m.status === 'pending' ? '' : state.gamesWon[s]}</span>
    </div>
  )

  return (
    <Link to={`/partido/${m.id}`} className={'match-row' + resultClass}>
      <div className="mr-players">
        {side(a, 'a')}
        {side(b, 'b')}
      </div>
      <div className="mr-meta">
        {m.status === 'pending' && <span className="pill">Por jugar</span>}
        {m.status === 'live' && <span className="pill live">● En juego</span>}
        {m.status !== 'pending' && games.length > 0 && <span className="mr-detail">{games.map((g) => `${g.a}-${g.b}`).join(', ')}</span>}
        {finished && m.winner === null && <span className="pill">Empate</span>}
        {showDate && <span className="mr-date">{formatDate(m.finishedAt ?? m.startedAt ?? m.createdAt)}</span>}
      </div>
    </Link>
  )
}

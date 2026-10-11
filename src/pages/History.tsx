import { useState } from 'react'
import { MatchRow } from '../components/MatchRow'
import { useLeaderboard, usePlayerMap } from '../lib/hooks'
import { useData } from '../lib/store'
import type { Id } from '../lib/types'

export function History() {
  const data = useData()
  const board = useLeaderboard()
  const players = usePlayerMap()
  const [filter, setFilter] = useState<Id | ''>('')
  const matches = data.matches
    .filter((m) => m.status === 'finished')
    .filter((m) => !filter || m.playerA === filter || m.playerB === filter)
    .sort((x, y) => (y.finishedAt ?? 0) - (x.finishedAt ?? 0))

  return (
    <div className="page">
      <h1>Historial</h1>
      {data.players.length > 0 && (
        <select className="input" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">Todos los jugadores</option>
          {[...data.players]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((p) => (
              <option key={p.id} value={p.id}>
                {p.emoji} {p.name}
              </option>
            ))}
        </select>
      )}
      {!matches.length && <div className="empty">Todavía no hay partidos terminados.</div>}
      <div className="list">
        {matches.map((m) => (
          <MatchRow key={m.id} match={m} players={players} eloDelta={board.eloDeltas.get(m.id)} perspective={filter || undefined} />
        ))}
      </div>
    </div>
  )
}

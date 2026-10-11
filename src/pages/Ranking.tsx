import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Avatar } from '../components/Avatar'
import { useLeaderboard } from '../lib/hooks'
import { levelFor, rankedPlayers, winRate } from '../lib/stats'
import { useData } from '../lib/store'

type SortKey = 'elo' | 'wins' | 'rate' | 'streak' | 'played'

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'elo', label: 'ELO' },
  { key: 'wins', label: 'Victorias' },
  { key: 'rate', label: '% Victorias' },
  { key: 'streak', label: 'Racha' },
  { key: 'played', label: 'Partidos' },
]

export function Ranking() {
  const data = useData()
  const board = useLeaderboard()
  const [sort, setSort] = useState<SortKey>('elo')
  const rows = rankedPlayers(data.players, board)
  const value = (r: (typeof rows)[number]) => {
    const s = r.stats
    switch (sort) {
      case 'elo':
        return s.elo
      case 'wins':
        return s.wins
      case 'rate':
        return winRate(s)
      case 'streak':
        return s.streak
      case 'played':
        return s.played
    }
  }
  const sorted = [...rows].sort((x, y) => Number(y.stats.played > 0) - Number(x.stats.played > 0) || value(y) - value(x) || y.stats.elo - x.stats.elo)

  return (
    <div className="page">
      <h1>Ranking</h1>
      <div className="chips scroll">
        {SORTS.map((s) => (
          <button key={s.key} className={'chip' + (sort === s.key ? ' active' : '')} onClick={() => setSort(s.key)}>
            {s.label}
          </button>
        ))}
      </div>

      {!rows.length && <div className="empty">Todavía no hay jugadores.</div>}

      <div className="ranking">
        {sorted.map((r, i) => {
          const s = r.stats
          const level = levelFor(s.elo)
          return (
            <Link key={r.player.id} to={`/jugadores/${r.player.id}`} className={'rank-row' + (s.played === 0 ? ' inactive' : '')}>
              <span className="rank-pos">{s.played === 0 ? '–' : i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}</span>
              <Avatar player={r.player} size={40} />
              <div className="grow">
                <strong>{r.player.name}</strong>
                <div className="muted small">
                  {level.emoji} {level.name} · {s.wins}G {s.losses}P{s.draws ? ` ${s.draws}E` : ''}
                  {s.streak >= 3 && ' · 🔥' + s.streak}
                </div>
              </div>
              <div className="rank-value">
                <b>
                  {sort === 'elo' && s.elo}
                  {sort === 'wins' && s.wins}
                  {sort === 'rate' && `${Math.round(winRate(s) * 100)}%`}
                  {sort === 'streak' && (s.streak > 0 ? `+${s.streak}` : s.streak)}
                  {sort === 'played' && s.played}
                </b>
                {sort !== 'elo' && <span className="muted small">{s.elo} ELO</span>}
              </div>
            </Link>
          )
        })}
      </div>

      <details className="card help">
        <summary>¿Cómo funciona el ELO?</summary>
        <p>
          Todos arrancan con 1000. Cada partido suma o resta puntos según el resultado y la diferencia de nivel: ganarle a alguien mejor rankeado da más
          puntos que ganarle a alguien que viene abajo. Lo que gana uno lo pierde el otro.
        </p>
        <p>
          Niveles: 🥚 Pelotita · 🐣 Aprendiz (900) · 🏓 Amateur (975) · 🌶️ Picante (1050) · ⚡ Crack (1125) · 🥋 Maestro (1200) · 🐉 Leyenda (1300)
        </p>
      </details>
    </div>
  )
}

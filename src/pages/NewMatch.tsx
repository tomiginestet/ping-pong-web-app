import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ConfigEditor } from '../components/ConfigEditor'
import { PlayerPicker } from '../components/PlayerPicker'
import { DEFAULT_CONFIG } from '../lib/scoring'
import { actions, useData } from '../lib/store'
import type { Id, MatchConfig, Side } from '../lib/types'

const LAST_CONFIG_KEY = 'ping-pong-last-config'

function loadLastConfig(): MatchConfig {
  try {
    const raw = localStorage.getItem(LAST_CONFIG_KEY)
    if (raw) return { ...DEFAULT_CONFIG, ...JSON.parse(raw) }
  } catch {
    // ignorar
  }
  return DEFAULT_CONFIG
}

export function NewMatch() {
  const data = useData()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const players = [...data.players].sort((a, b) => a.name.localeCompare(b.name))
  const [selected, setSelected] = useState<Id[]>(() => [params.get('a'), params.get('b')].filter((x): x is Id => !!x && data.players.some((p) => p.id === x)))
  const [config, setConfig] = useState<MatchConfig>(loadLastConfig)
  const [server, setServer] = useState<Side | 'random'>('random')

  const toggle = (id: Id) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length >= 2 ? [s[1], id] : [...s, id]))

  const [a, b] = selected
  const nameOf = (id?: Id) => data.players.find((p) => p.id === id)?.name ?? '?'

  const start = () => {
    if (!a || !b) return
    try {
      localStorage.setItem(LAST_CONFIG_KEY, JSON.stringify(config))
    } catch {
      // ignorar
    }
    const first: Side = server === 'random' ? (Math.random() < 0.5 ? 'a' : 'b') : server
    const m = actions.createMatch(a, b, config, first)
    navigate(`/partido/${m.id}`)
  }

  return (
    <div className="page">
      <h1>Partido rápido</h1>

      <section>
        <h2>¿Quiénes juegan?</h2>
        <PlayerPicker players={players} selected={selected} onToggle={toggle} badge={(id) => (id === a ? 'Izq' : id === b ? 'Der' : undefined)} />
      </section>

      <section className="card">
        <h2>Reglas</h2>
        <ConfigEditor value={config} onChange={setConfig} />
      </section>

      {a && b && (
        <section className="card">
          <h2>¿Quién saca primero?</h2>
          <div className="chips">
            <button type="button" className={'chip' + (server === 'random' ? ' active' : '')} onClick={() => setServer('random')}>
              🎲 Al azar
            </button>
            <button type="button" className={'chip' + (server === 'a' ? ' active' : '')} onClick={() => setServer('a')}>
              {nameOf(a)}
            </button>
            <button type="button" className={'chip' + (server === 'b' ? ' active' : '')} onClick={() => setServer('b')}>
              {nameOf(b)}
            </button>
          </div>
        </section>
      )}

      <div className="sticky-actions">
        <button className="btn primary big block" disabled={!a || !b} onClick={start}>
          {a && b ? `🏓 ${nameOf(a)} vs ${nameOf(b)}` : 'Elegí 2 jugadores'}
        </button>
      </div>
    </div>
  )
}

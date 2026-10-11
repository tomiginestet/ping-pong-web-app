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

function coinFlip(): Side {
  return Math.random() < 0.5 ? 'a' : 'b'
}

export function NewMatch() {
  const data = useData()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const players = [...data.players].sort((a, b) => a.name.localeCompare(b.name))
  const [selected, setSelected] = useState<Id[]>(() => [params.get('a'), params.get('b')].filter((x): x is Id => !!x && data.players.some((p) => p.id === x)))
  const [config, setConfig] = useState<MatchConfig>(loadLastConfig)
  const [server, setServer] = useState<Side | 'random'>('random')
  const [doubles, setDoubles] = useState(false)
  const needed = doubles ? 4 : 2

  const toggle = (id: Id) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length >= needed ? [...s.slice(1), id] : [...s, id]))

  const ready = selected.length === needed
  const teamA = doubles ? selected.slice(0, 2) : selected.slice(0, 1)
  const teamB = doubles ? selected.slice(2, 4) : selected.slice(1, 2)
  const nameOf = (ids: Id[]) => ids.map((id) => data.players.find((p) => p.id === id)?.name ?? '?').join(' & ')
  const badge = (id: Id) => {
    const i = selected.indexOf(id)
    if (i < 0) return undefined
    if (!doubles) return i === 0 ? 'Izq' : 'Der'
    return i < 2 ? 'Equipo 1' : 'Equipo 2'
  }

  const start = () => {
    if (!ready) return
    try {
      localStorage.setItem(LAST_CONFIG_KEY, JSON.stringify(config))
    } catch {
      // ignorar
    }
    const first: Side = server === 'random' ? coinFlip() : server
    const m = actions.createMatch(teamA, teamB, config, first)
    navigate(`/partido/${m.id}`)
  }

  return (
    <div className="page">
      <h1>Partido rápido</h1>

      <div className="segmented">
        {[false, true].map((d) => (
          <button
            key={String(d)}
            className={doubles === d ? 'active' : ''}
            onClick={() => {
              setDoubles(d)
              setSelected((s) => s.slice(0, d ? 4 : 2))
            }}
          >
            {d ? '👥 Dobles' : '👤 Singles'}
          </button>
        ))}
      </div>

      <section>
        <h2>{doubles ? '¿Quiénes juegan? (los 2 primeros son un equipo)' : '¿Quiénes juegan?'}</h2>
        <PlayerPicker players={players} selected={selected} onToggle={toggle} badge={badge} />
        {doubles && selected.length === 4 && (
          <div className="teams-preview">
            <span>
              <b>{nameOf(teamA)}</b> vs <b>{nameOf(teamB)}</b>
            </span>
            <button
              className="link-btn"
              onClick={() => {
                const s = [...selected].sort(() => Math.random() - 0.5)
                setSelected(s)
              }}
            >
              🎲 Equipos al azar
            </button>
          </div>
        )}
      </section>

      <section className="card">
        <h2>Reglas</h2>
        <ConfigEditor value={config} onChange={setConfig} />
      </section>

      {ready && (
        <section className="card">
          <h2>¿Quién saca primero?</h2>
          <div className="chips">
            <button type="button" className={'chip' + (server === 'random' ? ' active' : '')} onClick={() => setServer('random')}>
              🎲 Al azar
            </button>
            <button type="button" className={'chip' + (server === 'a' ? ' active' : '')} onClick={() => setServer('a')}>
              {nameOf(teamA)}
            </button>
            <button type="button" className={'chip' + (server === 'b' ? ' active' : '')} onClick={() => setServer('b')}>
              {nameOf(teamB)}
            </button>
          </div>
        </section>
      )}

      <div className="sticky-actions">
        <button className="btn primary big block" disabled={!ready} onClick={start}>
          {ready ? `🏓 ${nameOf(teamA)} vs ${nameOf(teamB)}` : `Elegí ${needed} jugadores`}
        </button>
      </div>
    </div>
  )
}

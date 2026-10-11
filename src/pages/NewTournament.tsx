import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ConfigEditor } from '../components/ConfigEditor'
import { PlayerPicker } from '../components/PlayerPicker'
import { DEFAULT_CONFIG } from '../lib/scoring'
import { actions, useData } from '../lib/store'
import { roundRobin } from '../lib/tournament'
import type { Id, MatchConfig, TournamentFormat } from '../lib/types'

const NAMES = ['Copa de la Oficina', 'Torneo del Asado', 'Gran Slam Casero', 'Copa Pelotita', 'Masters del Living', 'Liga de los Viernes']

export function NewTournament() {
  const data = useData()
  const navigate = useNavigate()
  const players = [...data.players].sort((a, b) => a.name.localeCompare(b.name))
  const [name, setName] = useState(() => NAMES[Math.floor(Math.random() * NAMES.length)])
  const [format, setFormat] = useState<TournamentFormat>('league')
  const [doubleRound, setDoubleRound] = useState(false)
  const [selected, setSelected] = useState<Id[]>([])
  const [config, setConfig] = useState<MatchConfig>({ ...DEFAULT_CONFIG, bestOf: 1 })

  const toggle = (id: Id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  const effectiveConfig = format === 'knockout' && config.bestOf % 2 === 0 ? { ...config, bestOf: config.bestOf + 1 } : config
  const matchCount = format === 'league' ? roundRobin(selected, doubleRound).flat().length : Math.max(0, selected.length - 1)
  const valid = name.trim() && selected.length >= 2

  return (
    <div className="page">
      <h1>Nuevo torneo</h1>

      <section className="card">
        <label className="field">
          <span>Nombre</span>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} />
        </label>

        <div className="field">
          <label>Formato</label>
          <div className="format-options">
            <button type="button" className={'format-opt' + (format === 'league' ? ' active' : '')} onClick={() => setFormat('league')}>
              <span className="big-emoji">🔄</span>
              <b>Liga</b>
              <span className="muted small">Todos contra todos. Gana quien más puntos sume.</span>
            </button>
            <button type="button" className={'format-opt' + (format === 'knockout' ? ' active' : '')} onClick={() => setFormat('knockout')}>
              <span className="big-emoji">⚔️</span>
              <b>Eliminación</b>
              <span className="muted small">Cuadro de llaves. El que pierde, afuera.</span>
            </button>
          </div>
        </div>

        {format === 'league' && (
          <div className="field row-between">
            <label htmlFor="double">Ida y vuelta</label>
            <input id="double" type="checkbox" className="switch" checked={doubleRound} onChange={(e) => setDoubleRound(e.target.checked)} />
          </div>
        )}
      </section>

      <section>
        <div className="section-head">
          <h2>
            Jugadores <span className="muted small">({selected.length})</span>
          </h2>
          {players.length > 2 &&
            (selected.length === players.length ? (
              <button className="link-btn" onClick={() => setSelected([])}>
                Ninguno
              </button>
            ) : (
              <button className="link-btn" onClick={() => setSelected(players.map((p) => p.id))}>
                Elegir todos
              </button>
            ))}
        </div>
        <PlayerPicker players={players} selected={selected} onToggle={toggle} badge={(id) => (selected.includes(id) ? '✓' : undefined)} />
      </section>

      <section className="card">
        <h2>Reglas de cada partido</h2>
        <ConfigEditor value={effectiveConfig} onChange={setConfig} oddBestOfOnly={format === 'knockout'} />
      </section>

      <div className="sticky-actions">
        <button
          className="btn primary big block"
          disabled={!valid}
          onClick={() => {
            const t = actions.createTournament(name, format, selected, effectiveConfig, doubleRound)
            navigate(`/torneos/${t.id}`)
          }}
        >
          {valid ? `🎪 Crear torneo · ${matchCount} partidos` : 'Elegí al menos 2 jugadores'}
        </button>
      </div>
    </div>
  )
}

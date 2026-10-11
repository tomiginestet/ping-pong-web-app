import { gamesNeeded, suggestedServeEvery } from '../lib/scoring'
import type { MatchConfig } from '../lib/types'

const POINT_PRESETS = [2, 4, 5, 7, 11, 21]
const BEST_OF_PRESETS = [1, 3, 5, 7, 10]
const SERVE_PRESETS = [1, 2, 5]

interface Props {
  value: MatchConfig
  onChange: (c: MatchConfig) => void
  /** Eliminación directa: no puede haber empates, así que la cantidad de juegos debe ser impar. */
  oddBestOfOnly?: boolean
}

function Stepper({ value, min, max, onChange, step = 1 }: { value: number; min: number; max: number; step?: number; onChange: (n: number) => void }) {
  return (
    <span className="stepper">
      <button type="button" onClick={() => onChange(Math.max(min, value - step))} disabled={value <= min} aria-label="Menos">
        −
      </button>
      <span className="stepper-value">{value}</span>
      <button type="button" onClick={() => onChange(Math.min(max, value + step))} disabled={value >= max} aria-label="Más">
        +
      </button>
    </span>
  )
}

export function ConfigEditor({ value, onChange, oddBestOfOnly }: Props) {
  const set = (patch: Partial<MatchConfig>) => onChange({ ...value, ...patch })
  const bestOfPresets = oddBestOfOnly ? BEST_OF_PRESETS.filter((n) => n % 2 === 1) : BEST_OF_PRESETS
  const needed = gamesNeeded(value)

  return (
    <div className="config">
      <div className="field">
        <label>Cada juego se gana a</label>
        <div className="chips">
          {POINT_PRESETS.map((n) => (
            <button
              key={n}
              type="button"
              className={'chip' + (value.pointsToWin === n ? ' active' : '')}
              onClick={() => set({ pointsToWin: n, serveEvery: suggestedServeEvery(n) })}
            >
              {n}
            </button>
          ))}
          <Stepper value={value.pointsToWin} min={1} max={99} onChange={(n) => set({ pointsToWin: n, serveEvery: suggestedServeEvery(n) })} />
        </div>
      </div>

      <div className="field">
        <label>Al mejor de (juegos)</label>
        <div className="chips">
          {bestOfPresets.map((n) => (
            <button key={n} type="button" className={'chip' + (value.bestOf === n ? ' active' : '')} onClick={() => set({ bestOf: n })}>
              {n}
            </button>
          ))}
          <Stepper value={value.bestOf} min={1} max={99} step={oddBestOfOnly ? 2 : 1} onChange={(n) => set({ bestOf: n })} />
        </div>
        <p className="hint">
          {value.bestOf === 1
            ? 'Un solo juego define el partido.'
            : `Gana quien llegue primero a ${needed} juegos.` + (value.bestOf % 2 === 0 ? ` Si quedan ${value.bestOf / 2}-${value.bestOf / 2}, es empate.` : '')}
        </p>
      </div>

      <div className="field row-between">
        <label htmlFor="win-by-two">Ganar por 2 de diferencia</label>
        <input id="win-by-two" type="checkbox" className="switch" checked={value.winByTwo} onChange={(e) => set({ winByTwo: e.target.checked })} />
      </div>

      <div className="field">
        <label>Saques por turno</label>
        <div className="chips">
          {SERVE_PRESETS.map((n) => (
            <button key={n} type="button" className={'chip' + (value.serveEvery === n ? ' active' : '')} onClick={() => set({ serveEvery: n })}>
              {n}
            </button>
          ))}
          <Stepper value={value.serveEvery} min={1} max={20} onChange={(n) => set({ serveEvery: n })} />
        </div>
      </div>
    </div>
  )
}

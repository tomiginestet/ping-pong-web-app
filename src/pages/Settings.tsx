import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { actions, getData } from '../lib/store'

export function Settings() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState('')

  const exportData = () => {
    const blob = new Blob([JSON.stringify(getData(), null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ping-pong-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importFile = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text())
      if (!confirm('Esto reemplaza todos los datos actuales por los del archivo. ¿Seguir?')) return
      actions.importData(parsed)
      setMessage('✅ Datos importados.')
    } catch (e) {
      setMessage('❌ No se pudo importar: ' + (e instanceof Error ? e.message : 'archivo inválido'))
    }
  }

  return (
    <div className="page">
      <Link to="/ranking" className="back">
        ← Ranking
      </Link>
      <h1>Ajustes</h1>

      <section className="card">
        <h3>Copia de seguridad</h3>
        <p className="muted">
          Los datos se guardan sólo en este navegador. Exportalos para no perderlos o para pasarlos a otro dispositivo.
        </p>
        <div className="row gap wrap">
          <button className="btn primary" onClick={exportData}>
            ⬇️ Exportar
          </button>
          <button className="btn" onClick={() => fileRef.current?.click()}>
            ⬆️ Importar
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) importFile(f)
              e.target.value = ''
            }}
          />
        </div>
        {message && <p>{message}</p>}
      </section>

      <section className="card">
        <h3>Zona peligrosa</h3>
        <button
          className="btn danger"
          onClick={() => {
            if (confirm('¿Borrar TODOS los jugadores, partidos y torneos? No se puede deshacer.')) {
              actions.resetAll()
              setMessage('Datos borrados.')
            }
          }}
        >
          🗑️ Borrar todo
        </button>
      </section>
    </div>
  )
}

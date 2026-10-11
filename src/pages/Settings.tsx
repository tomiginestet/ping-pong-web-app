import { ArrowLeftIcon, CheckCircleIcon, DownloadSimpleIcon, TrashIcon, UploadSimpleIcon, XCircleIcon } from '@phosphor-icons/react'
import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { actions, getData } from '../lib/store'
import { useSyncState } from '../lib/sync'

export function Settings() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<{ kind: 'ok' | 'error' | 'info'; text: string } | null>(null)
  const inClub = !!useSyncState().club

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
      setMessage({ kind: 'ok', text: 'Datos importados.' })
    } catch (e) {
      setMessage({ kind: 'error', text: 'No se pudo importar: ' + (e instanceof Error ? e.message : 'archivo inválido') })
    }
  }

  return (
    <div className="page">
      <Link to="/" className="back">
        <ArrowLeftIcon /> Inicio
      </Link>
      <h1>Ajustes</h1>

      <section className="card">
        <h3>Copia de seguridad</h3>
        <p className="muted">
          Los datos se guardan sólo en este navegador. Exportalos para no perderlos o para pasarlos a otro dispositivo.
        </p>
        <div className="row gap wrap">
          <button className="btn primary" onClick={exportData}>
            <DownloadSimpleIcon /> Exportar
          </button>
          <button className="btn" disabled={inClub} onClick={() => fileRef.current?.click()}>
            <UploadSimpleIcon /> Importar
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
        {inClub && <p className="muted small">Para importar, primero salí del club (en Inicio → Club).</p>}
        {message && (
          <p className={'status-message ' + message.kind}>
            {message.kind === 'ok' && <CheckCircleIcon weight="fill" />}
            {message.kind === 'error' && <XCircleIcon weight="fill" />}
            {message.text}
          </p>
        )}
      </section>

      <section className="card">
        <h3>Zona peligrosa</h3>
        {inClub && <p className="muted small">Mientras estés en un club no se puede borrar todo: afectaría a todos sus miembros.</p>}
        <button
          className="btn danger"
          disabled={inClub}
          onClick={() => {
            if (confirm('¿Borrar TODOS los jugadores, partidos y torneos? No se puede deshacer.')) {
              actions.resetAll()
              setMessage({ kind: 'info', text: 'Datos borrados.' })
            }
          }}
        >
          <TrashIcon /> Borrar todo
        </button>
      </section>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { formatDate } from '../lib/hooks'
import { useData } from '../lib/store'
import { createClub, findClub, inviteLink, joinClub, leaveClub, syncAvailable, syncNow, useSyncState } from '../lib/sync'

const STATUS_TEXT = {
  off: 'Sin sincronizar',
  syncing: 'Sincronizando…',
  ok: 'Sincronizado',
  offline: 'Sin conexión (se sube al volver)',
  error: 'Error al sincronizar',
} as const

export function SyncBadge() {
  const sync = useSyncState()
  if (!syncAvailable) return null
  return (
    <Link to="/club" className={'sync-badge ' + sync.status}>
      <span className="sync-dot" />
      {sync.club ? sync.club.name : 'Sincronizar'}
    </Link>
  )
}

export function ClubPage() {
  const sync = useSyncState()
  const data = useData()
  const navigate = useNavigate()
  const { code: inviteCode } = useParams()
  const [name, setName] = useState('Club de ping pong')
  const [code, setCode] = useState(inviteCode ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [invitedName, setInvitedName] = useState<string | null | undefined>(undefined)
  const hasLocalData = data.players.length + data.matches.length + data.tournaments.length > 0

  useEffect(() => {
    if (!inviteCode || !syncAvailable) return
    let cancelled = false
    findClub(inviteCode)
      .then((n) => !cancelled && setInvitedName(n))
      .catch(() => !cancelled && setInvitedName(null))
    return () => {
      cancelled = true
    }
  }, [inviteCode])

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true)
    setError('')
    try {
      await fn()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  if (!syncAvailable) {
    return (
      <div className="page">
        <h1>Club</h1>
        <div className="empty">La sincronización no está configurada en esta instalación.</div>
      </div>
    )
  }

  if (sync.club) {
    const link = inviteLink(sync.club.code)
    const alreadyInInvited = inviteCode && inviteCode === sync.club.code
    return (
      <div className="page">
        <h1>☁️ {sync.club.name}</h1>
        {inviteCode && !alreadyInInvited && (
          <div className="card warn">
            Este dispositivo ya está en otro club. Para unirte al club del link, primero salí de “{sync.club.name}”.
          </div>
        )}
        <section className="card">
          <div className="row-between">
            <span className={'sync-badge ' + sync.status}>
              <span className="sync-dot" />
              {STATUS_TEXT[sync.status]}
            </span>
            <button className="btn small" disabled={sync.status === 'syncing'} onClick={() => run(syncNow)}>
              🔄 Sincronizar
            </button>
          </div>
          <p className="muted small">
            {sync.lastSync ? `Última sincronización: ${formatDate(sync.lastSync)}` : ''}
            {sync.pending ? ` · ${sync.pending} cambios por subir` : ''}
          </p>
          {sync.error && sync.status !== 'ok' && <p className="error">{sync.error}</p>}
          <p>Todos los que estén en este club ven los mismos jugadores, partidos, torneos y ranking. Los partidos se ven en vivo punto a punto.</p>
        </section>

        <section className="card">
          <h3>Invitar amigos</h3>
          <p className="muted">Compartí este link. Quien lo abra puede ver y cargar partidos del club.</p>
          <div className="invite-box">
            <code>{link}</code>
          </div>
          <div className="row gap wrap">
            <button
              className="btn primary"
              onClick={async () => {
                if (navigator.share) {
                  try {
                    await navigator.share({ title: `Club ${sync.club!.name}`, text: `Sumate a “${sync.club!.name}” en Ping Pong Club 🏓`, url: link })
                    return
                  } catch {
                    // cancelado: copiamos
                  }
                }
                await navigator.clipboard?.writeText(link)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              }}
            >
              📤 Compartir link
            </button>
            <button
              className="btn"
              onClick={async () => {
                await navigator.clipboard?.writeText(link)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              }}
            >
              {copied ? '✅ Copiado' : '📋 Copiar'}
            </button>
          </div>
          <p className="muted small">
            Código: <b className="mono">{sync.club.code}</b>
          </p>
        </section>

        <button
          className="btn danger"
          onClick={() => {
            if (confirm('¿Dejar de sincronizar este dispositivo? Los datos quedan guardados acá, pero ya no se van a actualizar.')) {
              leaveClub()
              navigate('/club')
            }
          }}
        >
          🚪 Salir del club
        </button>
      </div>
    )
  }

  return (
    <div className="page">
      <h1>☁️ Club</h1>
      <p className="muted">
        Armá un club para compartir jugadores, partidos y ranking entre los celulares de todos. No hace falta crear cuentas: se entra con un link.
      </p>

      {inviteCode && (
        <section className="card highlight">
          {invitedName === undefined && <p>Buscando el club…</p>}
          {invitedName === null && <p className="error">El link no corresponde a ningún club. Revisá que esté completo.</p>}
          {invitedName && (
            <>
              <h2>Te invitaron a “{invitedName}”</h2>
              {hasLocalData ? (
                <>
                  <p className="muted">En este dispositivo ya hay datos cargados. ¿Qué hacemos con ellos?</p>
                  <button className="btn primary block" disabled={busy} onClick={() => run(() => joinClub(inviteCode, 'merge').then(() => navigate('/')))}>
                    ➕ Unirme y sumar mis datos al club
                  </button>
                  <button
                    className="btn block"
                    disabled={busy}
                    onClick={() =>
                      confirm('Se borran los datos de este dispositivo y se usan los del club. ¿Seguir?') &&
                      run(() => joinClub(inviteCode, 'replace').then(() => navigate('/')))
                    }
                  >
                    🔁 Unirme y usar sólo los datos del club
                  </button>
                </>
              ) : (
                <button className="btn primary big block" disabled={busy} onClick={() => run(() => joinClub(inviteCode, 'replace').then(() => navigate('/')))}>
                  🏓 Unirme al club
                </button>
              )}
            </>
          )}
        </section>
      )}

      {!inviteCode && (
        <>
          <section className="card">
            <h2>Crear un club</h2>
            <p className="muted small">{hasLocalData ? 'Los datos que ya cargaste en este dispositivo pasan al club.' : 'Después invitás a tus amigos con un link.'}</p>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} placeholder="Nombre del club" />
            <button className="btn primary block mt" disabled={busy || !name.trim()} onClick={() => run(() => createClub(name))}>
              ✨ Crear club
            </button>
          </section>

          <section className="card">
            <h2>Unirme con un código</h2>
            <input className="input" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Código o link de invitación" />
            <button
              className="btn block mt"
              disabled={busy || !code.trim()}
              onClick={() => {
                const match = code.match(/unirse\/([a-z0-9]+)/i)
                navigate(`/unirse/${match ? match[1] : code.trim().toLowerCase()}`)
              }}
            >
              Buscar club
            </button>
          </section>
        </>
      )}

      {busy && <p className="muted center-text">Sincronizando…</p>}
      {error && <p className="error">{error}</p>}
    </div>
  )
}

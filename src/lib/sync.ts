import { createClient, type RealtimeChannel, type SupabaseClient } from '@supabase/supabase-js'
import { useSyncExternalStore } from 'react'
import { entityKey, KINDS, listOf, type EntityChange, type EntityKind, type RemoteEntity } from './diff'
import { applyRemote, EMPTY, getData, onLocalChanges, replaceAllFromRemote } from './store'

/**
 * Sincronización con Supabase.
 *
 * La app sigue funcionando offline con localStorage. Si el dispositivo está unido
 * a un "club", cada cambio local se encola (outbox) y se sube; los cambios de
 * otros dispositivos se bajan al abrir la app, al recibir un aviso en tiempo
 * real, al volver a la pestaña y cada cierto tiempo. Por cada jugador/partido/
 * torneo gana la versión más reciente.
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY as string | undefined
const SYNC_KEY = 'ping-pong-sync-v1'
const PULL_INTERVAL_MS = 30_000
/** Margen al pedir cambios, por transacciones que confirman fuera de orden. */
const PULL_OVERLAP_MS = 15_000

export const syncAvailable = !!(SUPABASE_URL && SUPABASE_KEY)

let client: SupabaseClient | null = null
function getClient(): SupabaseClient | null {
  if (!syncAvailable) return null
  client ??= createClient(SUPABASE_URL!, SUPABASE_KEY!, { auth: { persistSession: false, autoRefreshToken: false } })
  return client
}

export interface Club {
  code: string
  name: string
}

interface OutboxItem {
  kind: EntityKind
  id: string
  v: number
}

interface Persisted {
  club?: Club
  /** Versión conocida de cada entidad (local o remota). */
  versions: Record<string, number>
  /** Cambios locales pendientes de subir. */
  outbox: Record<string, OutboxItem>
  /** Último `updated_at` recibido del servidor. */
  cursor?: string
}

export type SyncStatus = 'off' | 'syncing' | 'ok' | 'offline' | 'error'

export interface SyncState {
  club?: Club
  status: SyncStatus
  pending: number
  lastSync?: number
  error?: string
}

function loadPersisted(): Persisted {
  try {
    const raw = localStorage.getItem(SYNC_KEY)
    if (raw) {
      const p = JSON.parse(raw) as Persisted
      return { versions: p.versions ?? {}, outbox: p.outbox ?? {}, club: p.club, cursor: p.cursor }
    }
  } catch {
    // ignorar
  }
  return { versions: {}, outbox: {} }
}

let persisted = loadPersisted()
let state: SyncState = { club: persisted.club, status: persisted.club ? 'syncing' : 'off', pending: Object.keys(persisted.outbox).length }
const listeners = new Set<() => void>()

function save() {
  try {
    localStorage.setItem(SYNC_KEY, JSON.stringify(persisted))
  } catch {
    // ignorar
  }
}

function setState(patch: Partial<SyncState>) {
  state = { ...state, ...patch, club: persisted.club, pending: Object.keys(persisted.outbox).length }
  listeners.forEach((l) => l())
}

export function useSyncState(): SyncState {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => state,
  )
}

/** Nueva versión, siempre mayor a la anterior conocida para esa entidad. */
function nextVersion(key: string): number {
  return Math.max(Date.now(), (persisted.versions[key] ?? 0) + 1)
}

function enqueue(changes: { kind: EntityKind; id: string }[]) {
  for (const c of changes) {
    const key = entityKey(c.kind, c.id)
    const v = nextVersion(key)
    persisted.versions[key] = v
    persisted.outbox[key] = { kind: c.kind, id: c.id, v }
  }
  save()
  setState({})
}

function allLocalEntities(): { kind: EntityKind; id: string }[] {
  const data = getData()
  return KINDS.flatMap((kind) => listOf(data, kind).map((e) => ({ kind, id: e.id })))
}

// ---------------------------------------------------------------------------
// Subir y bajar

let pushTimer: ReturnType<typeof setTimeout> | undefined
let pushing: Promise<void> | null = null
let pulling: Promise<void> | null = null
let channel: RealtimeChannel | null = null

function schedulePush(delay = 400) {
  if (!persisted.club) return
  clearTimeout(pushTimer)
  pushTimer = setTimeout(() => void push(), delay)
}

function describeError(e: unknown): string {
  if (e && typeof e === 'object' && 'message' in e) return String((e as { message: unknown }).message)
  return String(e)
}

async function push(): Promise<void> {
  const sb = getClient()
  const club = persisted.club
  if (!sb || !club) return
  if (pushing) {
    await pushing
    return schedulePush(0)
  }
  pushing = (async () => {
    const items = Object.values(persisted.outbox)
    if (!items.length) return
    setState({ status: 'syncing' })
    const data = getData()
    try {
      for (let i = 0; i < items.length; i += 200) {
        const chunk = items.slice(i, i + 200)
        const payload = chunk.map((it) => {
          const entity = listOf(data, it.kind).find((e) => e.id === it.id)
          return entity ? { kind: it.kind, id: it.id, v: it.v, deleted: false, data: entity } : { kind: it.kind, id: it.id, v: it.v, deleted: true }
        })
        const { error } = await sb.rpc('push_changes', { p_code: club.code, p_items: payload })
        if (error) throw error
        for (const it of chunk) {
          const key = entityKey(it.kind, it.id)
          // Sólo se saca de la cola si no hubo otro cambio mientras subíamos.
          if (persisted.outbox[key]?.v === it.v) delete persisted.outbox[key]
        }
        save()
      }
      void channel?.send({ type: 'broadcast', event: 'changed', payload: {} })
      setState({ status: 'ok', lastSync: Date.now(), error: undefined })
    } catch (e) {
      setState({ status: navigator.onLine === false ? 'offline' : 'error', error: describeError(e) })
    }
  })()
  try {
    await pushing
  } finally {
    pushing = null
  }
  if (Object.keys(persisted.outbox).length && state.status === 'ok') schedulePush(0)
}

interface PulledRow extends RemoteEntity {
  v: number
  updated_at: string
}

async function pull(full = false): Promise<void> {
  const sb = getClient()
  const club = persisted.club
  if (!sb || !club) return
  if (pulling) return pulling
  pulling = (async () => {
    setState({ status: 'syncing' })
    try {
      const since = !full && persisted.cursor ? new Date(new Date(persisted.cursor).getTime() - PULL_OVERLAP_MS).toISOString() : null
      const { data, error } = await sb.rpc('pull_changes', { p_code: club.code, p_since: since })
      if (error) throw error
      if (persisted.club?.code !== club.code) return
      const rows = (data ?? []) as PulledRow[]
      const toApply: RemoteEntity[] = []
      for (const row of rows) {
        const key = entityKey(row.kind, row.id)
        const known = persisted.versions[key] ?? 0
        if (row.v > known) {
          persisted.versions[key] = row.v
          delete persisted.outbox[key]
          toApply.push(row)
        }
        if (!persisted.cursor || row.updated_at > persisted.cursor) persisted.cursor = row.updated_at
      }
      save()
      applyRemote(toApply)
      setState({ status: 'ok', lastSync: Date.now(), error: undefined })
    } catch (e) {
      setState({ status: navigator.onLine === false ? 'offline' : 'error', error: describeError(e) })
    }
  })()
  try {
    await pulling
  } finally {
    pulling = null
  }
}

/** Baja y sube todo lo pendiente. */
export async function syncNow(): Promise<void> {
  await pull()
  await push()
}

function connectRealtime() {
  const sb = getClient()
  const club = persisted.club
  if (!sb || !club) return
  disconnectRealtime()
  channel = sb
    .channel(`club-${club.code}`, { config: { broadcast: { self: false } } })
    .on('broadcast', { event: 'changed' }, () => void pull())
    .subscribe()
}

function disconnectRealtime() {
  if (channel) void getClient()?.removeChannel(channel)
  channel = null
}

// ---------------------------------------------------------------------------
// Club

export async function createClub(name: string): Promise<Club> {
  const sb = getClient()
  if (!sb) throw new Error('Sincronización no configurada')
  const { data, error } = await sb.rpc('create_club', { p_name: name })
  if (error) throw new Error(describeError(error))
  const club: Club = { code: String(data), name: name.trim() }
  persisted = { club, versions: persisted.versions, outbox: {}, cursor: undefined }
  // Todo lo que ya hay en este dispositivo pasa a ser parte del club.
  enqueue(allLocalEntities())
  connectRealtime()
  await push()
  await pull(true)
  return club
}

/** Busca un club por código. Devuelve su nombre o `null` si no existe. */
export async function findClub(code: string): Promise<string | null> {
  const sb = getClient()
  if (!sb) throw new Error('Sincronización no configurada')
  const { data, error } = await sb.rpc('get_club', { p_code: normalizeCode(code) })
  if (error) throw new Error(describeError(error))
  return (data as string | null) ?? null
}

/**
 * Se une a un club existente.
 * - `replace`: descarta los datos locales y usa los del club.
 * - `merge`: suma los datos locales a los del club.
 */
export async function joinClub(code: string, mode: 'replace' | 'merge'): Promise<Club> {
  const normalized = normalizeCode(code)
  const name = await findClub(normalized)
  if (!name) throw new Error('No existe un club con ese código')
  const club: Club = { code: normalized, name }
  if (mode === 'replace') {
    persisted = { club, versions: {}, outbox: {}, cursor: undefined }
    replaceAllFromRemote(EMPTY)
  } else {
    persisted = { club, versions: {}, outbox: {}, cursor: undefined }
  }
  save()
  setState({})
  // Bajar primero: si hay datos locales más viejos que los del club, gana el club.
  await pull(true)
  if (mode === 'merge') {
    const pendingLocal = allLocalEntities().filter((e) => !(entityKey(e.kind, e.id) in persisted.versions))
    enqueue(pendingLocal)
    await push()
  }
  connectRealtime()
  return club
}

/** Deja de sincronizar. Los datos quedan guardados en este dispositivo. */
export function leaveClub() {
  disconnectRealtime()
  clearTimeout(pushTimer)
  persisted = { versions: {}, outbox: {} }
  save()
  setState({ status: 'off', error: undefined, lastSync: undefined })
}

export function normalizeCode(code: string): string {
  return code.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
}

export function inviteLink(code: string): string {
  const base = window.location.href.split('#')[0]
  return `${base}#/unirse/${code}`
}

// ---------------------------------------------------------------------------
// Arranque

let started = false

export function startSync() {
  if (started) return
  started = true
  onLocalChanges((changes: EntityChange[]) => {
    if (!persisted.club) return
    enqueue(changes)
    schedulePush()
  })
  if (!syncAvailable) return
  // Estos disparadores no hacen nada mientras el dispositivo no esté en un club.
  setInterval(() => {
    if (persisted.club && document.visibilityState === 'visible') void syncNow()
  }, PULL_INTERVAL_MS)
  document.addEventListener('visibilitychange', () => {
    if (persisted.club && document.visibilityState === 'visible') void syncNow()
  })
  window.addEventListener('online', () => persisted.club && void syncNow())
  if (persisted.club) {
    connectRealtime()
    void syncNow()
  }
}

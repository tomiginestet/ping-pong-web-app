import type { AppData, Id } from './types'

export type EntityKind = 'player' | 'match' | 'tournament'

export interface EntityChange {
  kind: EntityKind
  id: Id
  deleted: boolean
}

export interface RemoteEntity {
  kind: EntityKind
  id: Id
  data: unknown
  deleted: boolean
}

const LISTS = { player: 'players', match: 'matches', tournament: 'tournaments' } as const

export const KINDS = Object.keys(LISTS) as EntityKind[]

export function entityKey(kind: EntityKind, id: Id): string {
  return `${kind}:${id}`
}

export function listOf(data: AppData, kind: EntityKind): { id: Id }[] {
  return data[LISTS[kind]]
}

/** Entidades que cambiaron entre dos estados (por referencia, ya que el store es inmutable). */
export function diffData(prev: AppData, next: AppData): EntityChange[] {
  const out: EntityChange[] = []
  for (const kind of KINDS) {
    const before = new Map(listOf(prev, kind).map((e) => [e.id, e]))
    const after = listOf(next, kind)
    for (const e of after) {
      if (before.get(e.id) !== e) out.push({ kind, id: e.id, deleted: false })
      before.delete(e.id)
    }
    for (const id of before.keys()) out.push({ kind, id, deleted: true })
  }
  return out
}

/** Aplica entidades recibidas del servidor sobre los datos locales. */
export function applyEntities(data: AppData, items: RemoteEntity[]): AppData {
  if (!items.length) return data
  const next: AppData = { ...data }
  for (const kind of KINDS) {
    const mine = items.filter((i) => i.kind === kind)
    if (!mine.length) continue
    const map = new Map(listOf(data, kind).map((e) => [e.id, e]))
    for (const item of mine) {
      if (item.deleted || !item.data || typeof item.data !== 'object') map.delete(item.id)
      else map.set(item.id, { ...(item.data as object), id: item.id })
    }
    ;(next as unknown as Record<string, unknown>)[LISTS[kind]] = [...map.values()]
  }
  return next
}

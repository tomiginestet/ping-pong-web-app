import { describe, expect, it } from 'vitest'
import { applyEntities, diffData } from './diff'
import type { AppData, Player } from './types'

const p = (id: string, name = id): Player => ({ id, name, emoji: '🏓', color: '#fff', createdAt: 0 })

describe('diffData', () => {
  it('detecta altas, cambios y bajas por referencia', () => {
    const p1 = p('p1')
    const p2 = p('p2')
    const prev: AppData = { version: 1, players: [p1, p2], matches: [], tournaments: [] }
    const next: AppData = { ...prev, players: [{ ...p1, name: 'X' }, p('p3')] }
    expect(diffData(prev, next)).toEqual([
      { kind: 'player', id: 'p1', deleted: false },
      { kind: 'player', id: 'p3', deleted: false },
      { kind: 'player', id: 'p2', deleted: true },
    ])
    expect(diffData(prev, { ...prev })).toEqual([])
  })
})

describe('applyEntities', () => {
  it('inserta, reemplaza y borra', () => {
    const data: AppData = { version: 1, players: [p('p1'), p('p2')], matches: [], tournaments: [] }
    const out = applyEntities(data, [
      { kind: 'player', id: 'p1', data: p('p1', 'Nuevo'), deleted: false },
      { kind: 'player', id: 'p2', data: null, deleted: true },
      { kind: 'player', id: 'p9', data: p('p9'), deleted: false },
    ])
    expect(out.players.map((x) => x.name)).toEqual(['Nuevo', 'p9'])
  })
})

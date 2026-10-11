import { useMemo } from 'react'
import { computeLeaderboard } from './stats'
import { useData } from './store'
import type { Id, Player } from './types'

export function useLeaderboard() {
  const data = useData()
  return useMemo(() => computeLeaderboard(data), [data])
}

export function usePlayerMap(): Map<Id, Player> {
  const data = useData()
  return useMemo(() => new Map(data.players.map((p) => [p.id, p])), [data.players])
}

/** Jugador "desconocido" para partidos de jugadores borrados o datos inconsistentes. */
export const UNKNOWN_PLAYER: Player = { id: '?', name: '¿?', emoji: '👻', color: '#666', createdAt: 0 }

export function formatDate(ts: number): string {
  const d = new Date(ts)
  const today = new Date()
  const sameDay = d.toDateString() === today.toDateString()
  const time = d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
  if (sameDay) return `Hoy ${time}`
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (d.toDateString() === yesterday.toDateString()) return `Ayer ${time}`
  return d.toLocaleDateString('es', { day: 'numeric', month: 'short', year: d.getFullYear() === today.getFullYear() ? undefined : 'numeric' })
}

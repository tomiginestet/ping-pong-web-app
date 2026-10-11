import { useMemo } from 'react'
import type { AchievementFamily } from '../lib/achievements'
import { medalSvg, TIERS } from '../lib/medalArt'

/** Medalla hexagonal de un nivel de una familia de logros. `locked` la muestra en gris. */
export function Medal({ family, level, locked = false, size = 64 }: { family: AchievementFamily; level: number; locked?: boolean; size?: number }) {
  const l = family.levels[level]
  // El SVG sale de ilustraciones propias (sin datos del usuario), así que es seguro inyectarlo.
  const html = useMemo(
    () => medalSvg(l.name, level, { face: l.face, label: `${l.name}, nivel ${TIERS[level].roman}${locked ? ' (bloqueado)' : ''}` }),
    [l, level, locked],
  )
  return <span className={'medal' + (locked ? ' locked' : '')} style={{ width: size }} dangerouslySetInnerHTML={{ __html: html }} />
}

import { EggCrackIcon, EggIcon, LightningIcon, PepperIcon, PingPongIcon, type Icon, type IconProps } from '@phosphor-icons/react'
import type { LevelIconId } from '../../lib/stats'
import { BeltIcon, DragonIcon } from './custom'

const LEVEL_ICONS: Record<LevelIconId, Icon> = {
  egg: EggIcon,
  hatching: EggCrackIcon,
  paddle: PingPongIcon,
  pepper: PepperIcon,
  lightning: LightningIcon,
  belt: BeltIcon,
  dragon: DragonIcon,
}

export function LevelIcon({ icon, ...props }: IconProps & { icon: LevelIconId }) {
  const I = LEVEL_ICONS[icon]
  return <I weight="duotone" className="inline-icon" {...props} />
}

const PLACE_COLORS = [
  { metal: '#FFC53D', shade: '#B07A00' },
  { metal: '#CBD5E1', shade: '#64748B' },
  { metal: '#E5925A', shade: '#8A4B1E' },
]

/** Medalla de podio (1°, 2° o 3°) con su número. */
export function PlaceMedal({ place, size = '1em' }: { place: 1 | 2 | 3; size?: number | string }) {
  const { metal, shade } = PLACE_COLORS[place - 1]
  return (
    <svg width={size} height={size} viewBox="0 0 256 256" className="place-medal" role="img" aria-label={`Puesto ${place}`}>
      <path d="M64 16h48l32 80h-48ZM192 16h-48l-32 80h48Z" fill="#3B82F6" />
      <path d="M144 16h48l-32 80h-24Z" fill="#2563EB" />
      <circle cx="128" cy="160" r="80" fill={metal} />
      <circle cx="128" cy="160" r="62" fill="none" stroke={shade} strokeWidth="10" opacity="0.55" />
      <text x="128" y="160" dy="0.36em" textAnchor="middle" fontSize="96" fontWeight="900" fontFamily="system-ui, sans-serif" fill={shade}>
        {place}
      </text>
    </svg>
  )
}

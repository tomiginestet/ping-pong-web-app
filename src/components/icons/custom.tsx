/**
 * Íconos hechos a medida para lo que Phosphor no trae (espadas cruzadas, cinturón, dragón).
 * Siguen la grilla de Phosphor (256×256, trazo de 16 con puntas redondeadas) y usan su IconBase,
 * así que aceptan las mismas props (size, weight, color, mirrored) y respetan el IconContext.
 */
/* eslint-disable react/only-export-components -- los íconos se generan con createIcon */
import { forwardRef, type ReactNode } from 'react'
import { IconBase, type Icon, type IconProps, type IconWeight } from '@phosphor-icons/react'

const STROKE: Record<IconWeight, number> = { thin: 8, light: 12, regular: 16, bold: 24, fill: 16, duotone: 16 }

interface Def {
  /** Trazos (líneas y contornos sin relleno). */
  lines: ReactNode
  /** Detalles rellenos (ojos, nariz…). */
  dots?: ReactNode
  /** Silueta para el relleno suave de los pesos duotone y fill. */
  shape?: string
}

function createIcon(name: string, { lines, dots, shape }: Def): Icon {
  const render = (w: IconWeight) => (
    <>
      {shape && (w === 'duotone' || w === 'fill') && <path d={shape} opacity={w === 'fill' ? 0.35 : 0.2} />}
      <g fill="none" stroke="currentColor" strokeWidth={STROKE[w]} strokeLinecap="round" strokeLinejoin="round">
        {lines}
      </g>
      {dots}
    </>
  )
  const weights = new Map<IconWeight, ReactNode>((['thin', 'light', 'regular', 'bold', 'fill', 'duotone'] as const).map((w) => [w, render(w)]))
  const C = forwardRef<SVGSVGElement, IconProps>(({ color, style, ...props }, ref) => (
    // El trazo usa currentColor: pasamos `color` por CSS para que también lo tiña.
    <IconBase ref={ref} {...props} color={color} style={color ? { ...style, color } : style} weights={weights as Map<IconWeight, React.ReactElement>} />
  ))
  C.displayName = name
  return C as Icon
}

const eyes = (y: number, dx = 32, r = 12) => (
  <>
    <circle cx={128 - dx} cy={y} r={r} />
    <circle cx={128 + dx} cy={y} r={r} />
  </>
)

/* ---------- Objetos ---------- */

export const SwordsIcon = createIcon('SwordsIcon', {
  lines: (
    <>
      <path d="M216 40l-8 32L104 176l-24-24L184 48ZM64 136l56 56M92 164l-44 44" />
      <path d="M40 40l8 32 104 104 24-24L72 48ZM192 136l-56 56M164 164l44 44" />
    </>
  ),
})

/** Cinturón de artes marciales (nivel Maestro). */
export const BeltIcon = createIcon('BeltIcon', {
  shape: 'M108 92h40v40h-40Z',
  lines: (
    <>
      <path d="M24 84c28 10 56 14 84 14M148 98c28 0 56-4 84-14M24 120c28 10 56 14 84 14M148 134c28 0 56-4 84-14" />
      <rect x="108" y="88" width="40" height="48" rx="8" />
      <path d="m116 136-28 76 24 8 20-60M140 136l28 76-24 8-20-60" />
    </>
  ),
})

export const DragonIcon = createIcon('DragonIcon', {
  shape: 'M64 96c0-32 32-48 64-48s64 16 64 48v32c0 16-8 24-16 32l-8 40c-2 12-12 20-24 20h-32c-12 0-22-8-24-20l-8-40c-8-8-16-16-16-32Z',
  lines: (
    <>
      <path d="M64 96c0-32 32-48 64-48s64 16 64 48v32c0 16-8 24-16 32l-8 40c-2 12-12 20-24 20h-32c-12 0-22-8-24-20l-8-40c-8-8-16-16-16-32Z" />
      <path d="M84 64C72 44 60 32 44 24c28 0 52 8 64 28M172 64c12-20 24-32 40-40-28 0-52 8-64 28" />
      <path d="m64 108-36-12 16 28-16 24 40-8M192 108l36-12-16 28 16 24-40-8" />
      <path d="m88 100 28 8M168 100l-28 8M96 164c20 8 44 8 64 0" />
    </>
  ),
  dots: (
    <>
      {eyes(124, 28, 10)}
      <circle cx="114" cy="196" r="6" />
      <circle cx="142" cy="196" r="6" />
    </>
  ),
})

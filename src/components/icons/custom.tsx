/**
 * Íconos hechos a medida para lo que Phosphor no trae (animales de los avatares, espadas cruzadas, etc.).
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

/* ---------- Animales ---------- */

const FOX_HEAD = 'M40 40 104 80h48l64-40v88c0 24-8 40-24 56l-64 40-64-40c-16-16-24-32-24-56Z'
export const FoxIcon = createIcon('FoxIcon', {
  shape: FOX_HEAD,
  lines: (
    <>
      <path d={FOX_HEAD} />
      <path d="M44 140c32 0 60 16 84 48 24-32 52-48 84-48" />
    </>
  ),
  dots: (
    <>
      {eyes(124)}
      <circle cx="128" cy="196" r="12" />
    </>
  ),
})

const WOLF_HEAD = 'm64 24 40 48h48l40-48 8 80 24 32-24 8-24 48-48 32-48-32-24-48-24-8 24-32Z'
export const WolfIcon = createIcon('WolfIcon', {
  shape: WOLF_HEAD,
  lines: (
    <>
      <path d={WOLF_HEAD} />
      <path d="m100 148 28 24 28-24M128 172v24" />
    </>
  ),
  dots: (
    <>
      {eyes(120, 28)}
      <circle cx="128" cy="168" r="12" />
    </>
  ),
})

export const TigerIcon = createIcon('TigerIcon', {
  shape: 'M128 56a84 84 0 1 0 0 168 84 84 0 1 0 0-168Z',
  lines: (
    <>
      <circle cx="128" cy="140" r="84" />
      <path d="M53.5 101.2A26 26 0 1 1 84.7 68M171.3 68A26 26 0 1 1 202.5 101.2" />
      <path d="M128 56v28M104 60l4 16M152 60l-4 16M44 132h24M48 160h20M212 132h-24M208 160h-20" />
      <path d="m116 168 12 8 12-8M108 188c8 8 16 8 20 0 4 8 12 8 20 0" />
    </>
  ),
  dots: eyes(132, 36),
})

export const BearIcon = createIcon('BearIcon', {
  shape: 'M128 56a84 84 0 1 0 0 168 84 84 0 1 0 0-168Z',
  lines: (
    <>
      <circle cx="128" cy="140" r="84" />
      <path d="M55 98.5A28 28 0 1 1 91 64.6M165 64.6A28 28 0 1 1 201 98.5" />
      <ellipse cx="128" cy="176" rx="40" ry="30" />
      <path d="M128 168v14" />
    </>
  ),
  dots: (
    <>
      {eyes(128, 36)}
      <ellipse cx="128" cy="162" rx="14" ry="10" />
    </>
  ),
})

export const PandaIcon = createIcon('PandaIcon', {
  shape: 'M128 64a80 80 0 1 0 0 160 80 80 0 1 0 0-160Z',
  lines: (
    <>
      <circle cx="128" cy="144" r="80" />
      <ellipse cx="92" cy="138" rx="18" ry="26" transform="rotate(35 92 138)" />
      <ellipse cx="164" cy="138" rx="18" ry="26" transform="rotate(-35 164 138)" />
      <path d="M112 192c8 8 24 8 32 0" />
    </>
  ),
  dots: (
    <>
      <path d="M57.2 106.7A30 30 0 1 1 95.2 71A80 80 0 0 0 57.2 106.7ZM160.8 71A30 30 0 1 1 198.8 106.7A80 80 0 0 0 160.8 71Z" />
      {eyes(136, 34, 9)}
      <ellipse cx="128" cy="174" rx="12" ry="9" />
    </>
  ),
})

export const KoalaIcon = createIcon('KoalaIcon', {
  shape: 'M128 76a68 72 0 1 0 0 144 68 72 0 1 0 0-144Z',
  lines: (
    <>
      <ellipse cx="128" cy="148" rx="72" ry="72" />
      <path d="M56.5 135.8A44 44 0 1 1 94.4 80.3M161.6 80.3A44 44 0 1 1 199.5 135.8" />
    </>
  ),
  dots: (
    <>
      {eyes(136, 40, 10)}
      <rect x="110" y="132" width="36" height="56" rx="18" />
    </>
  ),
})

export const MonkeyIcon = createIcon('MonkeyIcon', {
  shape: 'M128 52a80 80 0 1 0 0 160 80 80 0 1 0 0-160Z',
  lines: (
    <>
      <circle cx="128" cy="132" r="80" />
      <path d="M53.2 160.3A26 26 0 1 1 50.8 110.9M205.2 110.9A26 26 0 1 1 202.8 160.3" />
      <path d="M128 104c-16-24-60-20-60 12 0 14 8 22 12 30-8 40 24 54 48 54s56-14 48-54c4-8 12-16 12-30 0-32-44-36-60-12Z" />
      <path d="M112 180c8 6 24 6 32 0" />
    </>
  ),
  dots: (
    <>
      {eyes(128, 22, 10)}
      <circle cx="120" cy="160" r="6" />
      <circle cx="136" cy="160" r="6" />
    </>
  ),
})

export const LionIcon = createIcon('LionIcon', {
  shape:
    'M128 40A25 25 0 0 1 174 52.3A25 25 0 0 1 207.7 86A25 25 0 0 1 220 132A25 25 0 0 1 207.7 178A25 25 0 0 1 174 211.7A25 25 0 0 1 128 224A25 25 0 0 1 82 211.7A25 25 0 0 1 48.3 178A25 25 0 0 1 36 132A25 25 0 0 1 48.3 86A25 25 0 0 1 82 52.3A25 25 0 0 1 128 40Z',
  lines: (
    <>
      <path d="M128 40A25 25 0 0 1 174 52.3A25 25 0 0 1 207.7 86A25 25 0 0 1 220 132A25 25 0 0 1 207.7 178A25 25 0 0 1 174 211.7A25 25 0 0 1 128 224A25 25 0 0 1 82 211.7A25 25 0 0 1 48.3 178A25 25 0 0 1 36 132A25 25 0 0 1 48.3 86A25 25 0 0 1 82 52.3A25 25 0 0 1 128 40Z" />
      <circle cx="128" cy="132" r="56" />
      <path d="M128 152v12M112 172c8 6 24 6 32 0" />
    </>
  ),
  dots: (
    <>
      {eyes(120, 22, 10)}
      <path d="M116 142h24l-12 12Z" />
    </>
  ),
})

const FROG_HEAD = 'M40 160c0-36 32-56 88-56s88 20 88 56-40 56-88 56-88-24-88-56Z'
export const FrogIcon = createIcon('FrogIcon', {
  shape: FROG_HEAD,
  lines: (
    <>
      <path d={FROG_HEAD} />
      <path d="M50.3 129.6A32 32 0 1 1 106 106.3M150 106.3A32 32 0 1 1 205.7 129.6" />
      <path d="M80 168c24 20 72 20 96 0" />
    </>
  ),
  dots: (
    <>
      {eyes(96, 48, 12)}
      <circle cx="116" cy="140" r="6" />
      <circle cx="140" cy="140" r="6" />
    </>
  ),
})

export const OctopusIcon = createIcon('OctopusIcon', {
  shape: 'M60 140a68 68 0 0 1 136 0c-20 12-116 12-136 0Z',
  lines: (
    <>
      <path d="M60 140a68 68 0 0 1 136 0" />
      <path d="M60 140c0 40-36 32-36 64M96 152c0 36-24 44-12 68M160 152c0 36 24 44 12 68M196 140c0 40 36 32 36 64" />
      <path d="M60 140c32 16 104 16 136 0" />
    </>
  ),
  dots: eyes(112, 26),
})

const HORSE = 'M136,100a12,12,0,1,1-12-12A12,12,0,0,1,136,100Zm96,29.48A104.29,104.29,0,0,1,130.1,232l-2.17,0a103.32,103.32,0,0,1-69.26-26A8,8,0,1,1,69.34,194a84.71,84.71,0,0,0,20.1,13.37L116,170.84c-22.78-9.83-47.47-5.65-61.4-3.29A31.84,31.84,0,0,1,23.3,154.72l-.3-.43-13.78-22a8,8,0,0,1,2.59-11.05L112,59.53V32a8,8,0,0,1,8-8h8A104,104,0,0,1,232,129.48Zm-16-.22A88,88,0,0,0,128,40V64a8,8,0,0,1-3.81,6.81L27.06,130.59l9.36,15A15.92,15.92,0,0,0,52,151.77c16-2.7,48.77-8.24,78.07,8.18A40.06,40.06,0,0,0,168,120a8,8,0,0,1,16,0,56.07,56.07,0,0,1-51.8,55.83l-27.11,37.28A90.89,90.89,0,0,0,129.78,216,88.29,88.29,0,0,0,216,129.26Z'
/** Unicornio: la cabeza de caballo de Phosphor con un cuerno. */
export const UnicornIcon = createIcon('UnicornIcon', {
  shape: 'M224,129.37c-.72,51.48-42.57,93.59-94.05,94.61a98.08,98.08,0,0,1-37.81-6.66L128,168h0c-26.64-16-57.23-11.3-74.7-8.34A24,24,0,0,1,29.79,150L16,128,120,64V32h8A96,96,0,0,1,224,129.37Z',
  lines: <path d="M92 76 44 28l68 32" />,
  dots: <path d={HORSE} />,
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

export const SharkIcon = createIcon('SharkIcon', {
  shape: 'M64 160c16-56 56-104 120-120-20 40-20 80 0 120Z',
  lines: (
    <>
      <path d="M64 160c16-56 56-104 120-120-20 40-20 80 0 120" />
      <path d="M24 192c16-16 36-16 52 0s36 16 52 0 36-16 52 0 36 16 52 0" />
    </>
  ),
})

export const BeeIcon = createIcon('BeeIcon', {
  shape: 'M128 104c44 0 76 20 76 48s-32 48-76 48-76-20-76-48 32-48 76-48Z',
  lines: (
    <>
      <ellipse cx="128" cy="152" rx="76" ry="48" />
      <path d="M104 106c-8 28-8 64 0 92M144 106c-8 28-8 64 0 92M52 152H28" />
      <path d="M112 104c-16-32-56-44-60-20s28 20 60 20M140 104c16-32 56-44 60-20s-28 20-60 20" />
      <path d="M188 120c8-24 16-36 36-40" />
    </>
  ),
  dots: <circle cx="176" cy="144" r="10" />,
})

const DINO = 'M24 176c32 0 40-48 88-52 36-4 48 8 56-12l16-48c4-16 16-20 28-16s20 16 12 24l-16 12-8 48c-4 36-16 52-40 52H72c-16 0-32 0-48-8Z'
export const DinoIcon = createIcon('DinoIcon', {
  shape: DINO,
  lines: (
    <>
      <path d={DINO} />
      <path d="M88 184v32M120 184v32M152 184v32M176 180v36" />
      <path d="m76 128 8-16 12 12 8-16 12 12" />
    </>
  ),
  dots: <circle cx="210" cy="62" r="9" />,
})

const PENGUIN = 'M128 24c-40 0-56 40-56 80v56c0 36 24 64 56 64s56-28 56-64v-56c0-40-16-80-56-80Z'
export const PenguinIcon = createIcon('PenguinIcon', {
  shape: PENGUIN,
  lines: (
    <>
      <path d={PENGUIN} />
      <path d="M100 96c-16 32-12 100 28 112 40-12 44-80 28-112" />
      <path d="m72 120-28 44M184 120l28 44M104 224l-12 8M152 224l12 8" />
    </>
  ),
  dots: (
    <>
      {eyes(72, 20, 10)}
      <path d="M116 88h24l-12 16Z" />
    </>
  ),
})

export const ChickenIcon = createIcon('ChickenIcon', {
  shape: 'M128 68a72 72 0 1 0 0 144 72 72 0 1 0 0-144Z',
  lines: (
    <>
      <circle cx="128" cy="140" r="72" />
      <path d="M96 72c-8-24 12-36 20-16 0-24 24-24 24 0 8-20 28-8 20 16" />
      <path d="m108 140 20-20 20 20-20 20ZM108 140h40M120 160c-8 24 24 24 16 0" />
    </>
  ),
  dots: eyes(116, 32, 10),
})

export const TacoIcon = createIcon('TacoIcon', {
  shape: 'M24 192a104 104 0 0 1 208 0Z',
  lines: (
    <>
      <path d="M24 192a104 104 0 0 1 208 0Z" />
      <path d="M52 192A14.6 14.6 0 0 1 56.6 166A14.6 14.6 0 0 1 69.8 143.1A14.6 14.6 0 0 1 90 126.2A14.6 14.6 0 0 1 114.8 117.2A14.6 14.6 0 0 1 141.2 117.2A14.6 14.6 0 0 1 166 126.2A14.6 14.6 0 0 1 186.2 143.1A14.6 14.6 0 0 1 199.4 166A14.6 14.6 0 0 1 204 192" />
    </>
  ),
  dots: (
    <>
      <circle cx="104" cy="164" r="10" />
      <circle cx="152" cy="164" r="10" />
      <circle cx="128" cy="144" r="10" />
    </>
  ),
})

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

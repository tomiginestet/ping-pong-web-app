import type { PlayerStats } from './stats'

/** Número de PlayerStats que mide cada familia de logros. */
export type AchievementStat =
  | 'wins'
  | 'bestStreak'
  | 'shutouts'
  | 'bestComeback'
  | 'clutchWins'
  | 'longestExtension'
  | 'played'
  | 'biggestUpset'
  | 'tournamentsWon'
  | 'doublesWins'

export interface AchievementLevel {
  /** Valor mínimo del número para alcanzar el nivel. */
  at: number
  /** Nombre del nivel; también es la clave de su ilustración en medalArt. */
  name: string
  description: string
  /** Color de fondo de la ilustración, si no usa el del material. */
  face?: string
}

export interface AchievementFamily {
  id: string
  name: string
  /** Qué mide, en una frase. */
  measures: string
  stat: AchievementStat
  /** Cómo se lee un valor del número: "3 seguidas", "+200 de ELO"… */
  unit: (n: number) => string
  levels: AchievementLevel[]
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

export const ACHIEVEMENT_FAMILIES: AchievementFamily[] = [
  {
    id: 'wins',
    name: 'Victorias',
    measures: 'Partidos ganados en total',
    stat: 'wins',
    unit: (n) => plural(n, 'victoria', 'victorias'),
    levels: [
      { at: 1, name: 'Primera sangre', description: 'Tu primer triunfo. Dos curitas en cruz, como rodilla de potrero.' },
      { at: 10, name: 'Chau chupete', description: 'Diez ganados: se terminó la etapa de bebé.' },
      { at: 25, name: 'Conde Pelotula', description: 'Ya le tomaste el gusto a la sangre.' },
      { at: 50, name: 'Colectivo sin frenos', description: 'No parás en ninguna parada, aunque te hagan señas.' },
      { at: 100, name: 'Imparable', description: 'Cien victorias. El volcán ya escupe pelotitas.' },
    ],
  },
  {
    id: 'streak',
    name: 'Racha',
    measures: 'Mejor racha de partidos ganados seguidos',
    stat: 'bestStreak',
    unit: (n) => `${n} seguidas`,
    levels: [
      { at: 3, name: 'Se pasó el agua', description: 'Empezás a calentar: la pava ya silba.' },
      { at: 5, name: 'Está que arde', description: 'La racha está en la parrilla y larga humo.' },
      { at: 7, name: 'On fire', description: '"He\'s on fire!", como en el NBA Jam.' },
      { at: 10, name: 'D10S', description: 'Diez seguidas te ponen en el altar.' },
      { at: 15, name: 'Modo Saiyan', description: 'Quince al hilo: pasaste de nivel, como Goku.' },
      { at: 20, name: 'Barrilete cósmico', description: '"¿De qué planeta viniste?" Veinte seguidas no es de este mundo.', face: '#1E2B5C' },
    ],
  },
  {
    id: 'shutout',
    name: 'Pastelito',
    measures: 'Juegos ganados sin que el rival haga un punto (a 5 o más)',
    stat: 'shutouts',
    unit: (n) => plural(n, 'juego en cero', 'juegos en cero'),
    levels: [
      { at: 1, name: 'Pastelito', description: 'El primero en cero sale fácil, como un pastelito del 25 de Mayo.' },
      { at: 3, name: 'Zapatero', description: 'Ya dejaste a tres rivales zapateros, sin un solo punto.' },
      { at: 10, name: 'Rosca', description: 'Diez roscas servidas. El cero ya es tu firma.' },
    ],
  },
  {
    id: 'comeback',
    name: 'Remontada',
    measures: 'La mayor desventaja que diste vuelta en un juego',
    stat: 'bestComeback',
    unit: (n) => `de ${n} abajo`,
    levels: [
      { at: 5, name: 'Adriaaan', description: 'Cobraste de lo lindo y la diste vuelta, como Rocky.' },
      { at: 7, name: 'Volví del más allá', description: 'Estabas enterrado y saliste de la tumba con la paleta.' },
      { at: 9, name: 'Ave Fénix', description: 'De las cenizas: ibas 1 a 10 y ganaste igual.' },
    ],
  },
  {
    id: 'clutch',
    name: 'Sangre fría',
    measures: 'Partidos ganados en el juego decisivo',
    stat: 'clutchWins',
    unit: (n) => plural(n, 'decisivo', 'decisivos'),
    levels: [
      { at: 1, name: 'Deal with it', description: 'El primer juego decisivo, sin transpirar.' },
      { at: 3, name: 'Pulso de cirujano', description: 'Tres finales de bandera y el pulso a 40.' },
      { at: 10, name: 'Mirá que te como', description: 'Diez decisivos ganados. Ya sos el Dibu en los penales.' },
    ],
  },
  {
    id: 'marathon',
    name: 'Maratón',
    measures: 'Cuántos puntos se estiró más allá del objetivo un juego que ganaste',
    stat: 'longestExtension',
    unit: (n) => `+${n} puntos`,
    levels: [
      { at: 4, name: 'Tiene pila', description: 'Un 15 a 13 en un juego a 11, y vos como si nada.' },
      { at: 6, name: 'Mate lavado', description: 'Un 17 a 15. Duró tanto que se lavó el mate.' },
      { at: 8, name: 'Continuará…', description: 'Un 19 a 17: más capítulos que la novela de la tarde.' },
    ],
  },
  {
    id: 'played',
    name: 'Habitué',
    measures: 'Partidos jugados, ganados o perdidos',
    stat: 'played',
    unit: (n) => plural(n, 'partido', 'partidos'),
    levels: [
      { at: 10, name: 'Cliente frecuente', description: 'La tarjetita de sellos, completa.' },
      { at: 25, name: 'Termo stickereado', description: 'Si traés el termo, ya sos de la casa.' },
      { at: 50, name: 'Socio del club', description: 'Carnet número 50, con foto y todo.' },
      { at: 100, name: 'Mate curado', description: 'Como la calabaza: con los años, se cura.' },
      { at: 250, name: 'Paleta de guerra', description: 'Goma rayada, cinta en el borde y curita. Cada marca es un partido.' },
      { at: 500, name: 'Viejo lobo', description: 'Te gana sin moverse de la mesa.' },
    ],
  },
  {
    id: 'giant',
    name: 'Matagigantes',
    measures: 'Diferencia de ELO con el rival más fuerte que venciste',
    stat: 'biggestUpset',
    unit: (n) => `+${n} de ELO`,
    levels: [
      { at: 100, name: 'La gomera', description: 'David contra Goliat, con la gomera de cuando eras pibe.' },
      { at: 200, name: 'Hormiga Atómica', description: 'Chiquita, pero levanta una pelota gigante.' },
      { at: 300, name: 'Batacazo', description: 'Pagabas 50 a 1 y ganaste igual.' },
    ],
  },
  {
    id: 'champion',
    name: 'Campeón',
    measures: 'Torneos ganados',
    stat: 'tournamentsWon',
    unit: (n) => plural(n, 'torneo', 'torneos'),
    levels: [
      { at: 1, name: 'Campeón', description: 'La primera copa, con la pelotita adentro.' },
      { at: 2, name: 'Dale campeón', description: 'El bombo de la hinchada ya tiene tu nombre.' },
      { at: 3, name: 'La tercera', description: 'Tres torneos, tres estrellas. Pura Qatar 2022.' },
      { at: 5, name: 'La Scaloneta', description: 'Cinco títulos y te reciben en el Obelisco.' },
    ],
  },
  {
    id: 'duo',
    name: 'Dupla dinámica',
    measures: 'Partidos de dobles ganados',
    stat: 'doublesWins',
    unit: (n) => `${n} en dobles`,
    levels: [
      { at: 3, name: 'Chocá los cinco', description: 'Tres ganados en dobles y ya festejan cada punto.' },
      { at: 10, name: 'Dúo dinámico', description: 'Diez juntos: son el Batman y Robin del club.' },
      { at: 25, name: 'Fernet con coca', description: 'La dupla definitiva, como en Córdoba.' },
    ],
  },
]

export const TOTAL_ACHIEVEMENT_LEVELS = ACHIEVEMENT_FAMILIES.reduce((sum, f) => sum + f.levels.length, 0)

/** Índice del nivel más alto alcanzado (0 = primer nivel), o -1 si todavía no tiene ninguno. */
export function familyLevel(family: AchievementFamily, stats: PlayerStats): number {
  const value = stats[family.stat]
  let level = -1
  family.levels.forEach((l, i) => {
    if (value >= l.at) level = i
  })
  return level
}

export interface FamilyProgress {
  family: AchievementFamily
  value: number
  level: number
  /** Próximo nivel por alcanzar, si queda alguno. */
  next?: AchievementLevel
  /** Avance hacia el próximo nivel, de 0 a 1 (1 si ya está en el máximo). */
  ratio: number
}

export function achievementProgress(stats: PlayerStats): FamilyProgress[] {
  return ACHIEVEMENT_FAMILIES.map((family) => {
    const value = stats[family.stat]
    const level = familyLevel(family, stats)
    const next = family.levels[level + 1]
    return { family, value, level, next, ratio: next ? Math.min(1, value / next.at) : 1 }
  })
}

/** Cantidad de niveles alcanzados sumando todas las familias. */
export function unlockedLevels(stats: PlayerStats): number {
  return ACHIEVEMENT_FAMILIES.reduce((sum, f) => sum + familyLevel(f, stats) + 1, 0)
}

export interface LevelUp {
  family: AchievementFamily
  /** Nivel nuevo (índice). */
  level: number
}

/** Familias en las que el jugador subió de nivel entre dos momentos del historial. */
export function levelUps(before: PlayerStats | undefined, after: PlayerStats | undefined): LevelUp[] {
  if (!after) return []
  return ACHIEVEMENT_FAMILIES.flatMap((family) => {
    const prev = before ? familyLevel(family, before) : -1
    const level = familyLevel(family, after)
    return level > prev ? [{ family, level }] : []
  })
}

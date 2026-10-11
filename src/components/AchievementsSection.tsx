import { useState } from 'react'
import { achievementProgress, TOTAL_ACHIEVEMENT_LEVELS, unlockedLevels } from '../lib/achievements'
import { TIERS } from '../lib/medalArt'
import type { PlayerStats } from '../lib/stats'
import { Medal } from './Medal'

/** Logros del perfil: una medalla por familia (la del nivel más alto) y, al tocarla, todos sus niveles. */
export function AchievementsSection({ stats }: { stats: PlayerStats }) {
  const progress = achievementProgress(stats)
  const [openId, setOpenId] = useState<string | null>(null)
  const open = progress.find((p) => p.family.id === openId)

  return (
    <section>
      <h2>
        Logros{' '}
        <span className="muted small">
          {unlockedLevels(stats)}/{TOTAL_ACHIEVEMENT_LEVELS} niveles
        </span>
      </h2>
      <div className="medals">
        {progress.map(({ family, value, level, next, ratio }) => (
          <button
            key={family.id}
            type="button"
            className={'medal-tile' + (level >= 0 ? ' unlocked' : '') + (openId === family.id ? ' open' : '')}
            aria-expanded={openId === family.id}
            onClick={() => setOpenId(openId === family.id ? null : family.id)}
          >
            <span className="medal-family">{family.name}</span>
            <Medal family={family} level={Math.max(level, 0)} locked={level < 0} />
            <span className="medal-name">{level >= 0 ? family.levels[level].name : 'Bloqueado'}</span>
            <span className="medal-sub">
              {next
                ? `${value} de ${next.at} para ${TIERS[level + 1].name.toLowerCase()}`
                : `Nivel máximo · ${TIERS[level].name}`}
            </span>
            <span className="medal-bar" aria-hidden="true">
              <i style={{ width: `${Math.round(ratio * 100)}%` }} />
            </span>
          </button>
        ))}
      </div>

      {open && (
        <div className="card medal-ladder">
          <div className="medal-ladder-head">
            <h3>{open.family.name}</h3>
            <p className="muted small">
              {open.family.measures}. Tenés {open.family.unit(open.value)}.
            </p>
          </div>
          <ol>
            {open.family.levels.map((l, i) => {
              const got = i <= open.level
              return (
                <li key={l.name} className={got ? 'got' : ''}>
                  <Medal family={open.family} level={i} locked={!got} size={56} />
                  <div>
                    <span className="medal-at">
                      {TIERS[i].name} · {open.family.unit(l.at)}
                    </span>
                    <b>{l.name}</b>
                    <span className="muted small">{l.description}</span>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      )}
    </section>
  )
}

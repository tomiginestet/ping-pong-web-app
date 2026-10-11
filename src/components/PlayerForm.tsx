import { useState } from 'react'
import { Avatar } from './Avatar'
import { AvatarGlyph } from './icons'
import { AVATAR_ICONS } from './icons/avatars'
import { PLAYER_COLORS, PLAYER_EMOJIS, useData } from '../lib/store'

function firstUnused<T>(options: T[], used: T[]): T {
  return options.find((o) => !used.includes(o)) ?? options[used.length % options.length]
}

export function PlayerForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial?: { name: string; emoji: string; color: string }
  submitLabel: string
  onSubmit: (v: { name: string; emoji: string; color: string }) => void
  onCancel?: () => void
}) {
  const data = useData()
  const [name, setName] = useState(initial?.name ?? '')
  const [emoji, setEmoji] = useState(initial?.emoji ?? firstUnused(PLAYER_EMOJIS, data.players.map((p) => p.emoji)))
  const [color, setColor] = useState(initial?.color ?? firstUnused(PLAYER_COLORS, data.players.map((p) => p.color)))
  const trimmed = name.trim()
  const duplicate = data.players.some((p) => p.name.toLowerCase() === trimmed.toLowerCase() && p.name !== initial?.name)

  return (
    <form
      className="card player-form"
      onSubmit={(e) => {
        e.preventDefault()
        if (!trimmed || duplicate) return
        onSubmit({ name: trimmed, emoji, color })
        if (!initial) {
          // Proponer otro avatar y color para el siguiente jugador.
          setName('')
          setEmoji(firstUnused(PLAYER_EMOJIS, [...data.players.map((p) => p.emoji), emoji]))
          setColor(firstUnused(PLAYER_COLORS, [...data.players.map((p) => p.color), color]))
        }
      }}
    >
      <div className="player-form-top">
        <Avatar player={{ id: '', name, emoji, color, createdAt: 0 }} size={56} />
        <input className="input" placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} maxLength={24} autoFocus={!!initial} />
      </div>
      {duplicate && <p className="error">Ya existe un jugador con ese nombre.</p>}
      <div className="emoji-grid">
        {PLAYER_EMOJIS.map((em) => (
          <button
            key={em}
            type="button"
            className={'emoji-btn' + (em === emoji ? ' active' : '')}
            onClick={() => setEmoji(em)}
            aria-label={AVATAR_ICONS[em]?.label}
            title={AVATAR_ICONS[em]?.label}
          >
            <AvatarGlyph glyph={em} size={24} />
          </button>
        ))}
      </div>
      <div className="color-row">
        {PLAYER_COLORS.map((c) => (
          <button key={c} type="button" aria-label={c} className={'color-dot' + (c === color ? ' active' : '')} style={{ background: c }} onClick={() => setColor(c)} />
        ))}
      </div>
      <div className="row gap">
        <button className="btn primary" type="submit" disabled={!trimmed || duplicate}>
          {submitLabel}
        </button>
        {onCancel && (
          <button className="btn" type="button" onClick={onCancel}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { TeamAvatar } from '../components/Avatar'
import { formatDate, UNKNOWN_PLAYER, usePlayerMap } from '../lib/hooks'
import { computeMatch, describeConfig, other } from '../lib/scoring'
import { ACHIEVEMENTS, computeLeaderboard, levelFor } from '../lib/stats'
import { actions, useData } from '../lib/store'
import { sidePlayers, teamAsPlayer, teamName } from '../lib/teams'
import type { Match, Player, Side } from '../lib/types'

function vibrate(ms = 15) {
  try {
    navigator.vibrate?.(ms)
  } catch {
    // no soportado
  }
}

/** Mantiene la pantalla encendida mientras se juega. */
function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active || !('wakeLock' in navigator)) return
    let lock: WakeLockSentinel | undefined
    let cancelled = false
    const request = () =>
      navigator.wakeLock
        .request('screen')
        .then((l) => {
          if (cancelled) l.release()
          else lock = l
        })
        .catch(() => {})
    request()
    const onVisible = () => document.visibilityState === 'visible' && request()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisible)
      lock?.release().catch(() => {})
    }
  }, [active])
}

export function MatchScreen() {
  const { id } = useParams()
  const data = useData()
  const match = data.matches.find((m) => m.id === id)
  if (!match) {
    return (
      <div className="page">
        <p>Partido no encontrado.</p>
        <Link to="/">← Inicio</Link>
      </div>
    )
  }
  return <Scoreboard key={match.id} match={match} />
}

function Scoreboard({ match }: { match: Match }) {
  const navigate = useNavigate()
  const players = usePlayerMap()
  const teamA = sidePlayers(match, 'a').map((id) => players.get(id) ?? UNKNOWN_PLAYER)
  const teamB = sidePlayers(match, 'b').map((id) => players.get(id) ?? UNKNOWN_PLAYER)
  const pA = teamAsPlayer(teamA)
  const pB = teamAsPlayer(teamB)
  const state = computeMatch(match.points, match.config, match.firstServer)
  const completedGames = state.games.filter((g) => g.winner).length
  const [flipped, setFlipped] = useState(false)
  const [seenGames, setSeenGames] = useState(completedGames)
  const [lastScorer, setLastScorer] = useState<Side | null>(null)

  useWakeLock(match.status === 'live')

  const backTo = match.tournamentId ? `/torneos/${match.tournamentId}` : '/'
  const pending = match.status === 'pending'
  const finished = match.status === 'finished'
  const betweenGames = !finished && completedGames > seenGames
  const locked = pending || finished || betweenGames

  const score = useCallback(
    (side: Side) => {
      if (locked) return
      vibrate()
      setLastScorer(side)
      actions.scorePoint(match.id, side)
    },
    [locked, match.id],
  )

  const undo = useCallback(() => {
    if (!match.points.length) return
    vibrate(30)
    actions.undoPoint(match.id)
    const prev = computeMatch(match.points.slice(0, -1), match.config, match.firstServer)
    setSeenGames((n) => Math.min(n, prev.games.filter((g) => g.winner).length))
    setLastScorer(null)
  }, [match])

  // Teclado: ← / → (o A / L) suman, Backspace deshace.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const left: Side = flipped ? 'b' : 'a'
      if (e.key === 'ArrowLeft' || e.key === 'a') score(left)
      else if (e.key === 'ArrowRight' || e.key === 'l') score(other(left))
      else if (e.key === 'Backspace' || (e.key === 'z' && (e.ctrlKey || e.metaKey))) undo()
      else if (e.key === 'Enter' && betweenGames) setSeenGames(completedGames)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [flipped, score, undo, betweenGames, completedGames])

  const sides: Side[] = flipped ? ['b', 'a'] : ['a', 'b']
  const playerOf = (s: Side) => (s === 'a' ? pA : pB)
  const lastGame = state.games.filter((g) => g.winner).at(-1)

  return (
    <div className="scoreboard">
      <div className="sb-topbar">
        <button className="icon-btn" onClick={() => navigate(backTo)} aria-label="Salir">
          ✕
        </button>
        <div className="sb-info">
          <strong>{finished ? 'Final' : `Juego ${state.games.length}`}</strong>
          <span>{describeConfig(match.config)}</span>
        </div>
        <button className="icon-btn" onClick={() => setFlipped((f) => !f)} aria-label="Cambiar lados" title="Cambiar lados">
          ⇄
        </button>
        <button className="icon-btn" onClick={undo} disabled={!match.points.length} aria-label="Deshacer" title="Deshacer último punto">
          ↶
        </button>
      </div>

      {state.games.length > 1 && (
        <div className="sb-games-strip">
          {state.games
            .filter((g) => g.winner)
            .map((g, i) => (
              <span key={i} className={'game-chip ' + g.winner}>
                {flipped ? `${g.b}-${g.a}` : `${g.a}-${g.b}`}
              </span>
            ))}
        </div>
      )}

      <div className="court">
        {sides.map((s) => {
          const p = playerOf(s)
          const isServer = !finished && !pending && state.server === s
          const tag = state.matchPoint === s ? 'Punto de partido' : state.gamePoint === s ? 'Punto de juego' : null
          return (
            <button
              key={s}
              className={'court-half' + (lastScorer === s ? ' scored' : '')}
              style={{ ['--pc' as string]: p.color }}
              onPointerDown={(e) => {
                if (e.button === 0) score(s)
              }}
              onContextMenu={(e) => e.preventDefault()}
              disabled={locked}
            >
              <div className="ch-player">
                <span className="ch-emoji">{p.emoji}</span>
                <span className="ch-name">{p.name}</span>
              </div>
              <div className="ch-games" aria-label={`${state.gamesWon[s]} juegos`}>
                {Array.from({ length: state.gamesNeeded }, (_, i) => (
                  <span key={i} className={'game-dot' + (i < state.gamesWon[s] ? ' won' : '')} />
                ))}
              </div>
              <div key={state.current[s] + '-' + state.games.length} className="ch-score">
                {state.current[s]}
              </div>
              <div className="ch-tags">
                {isServer && <span className="serve-tag">🏓 Saca</span>}
                {tag && <span className="point-tag">{tag}</span>}
              </div>
            </button>
          )
        })}
      </div>

      {!pending && !finished && match.points.length === 0 && (
        <div className="sb-hint">
          Tocá tu mitad de la pantalla para sumar un punto.
          <button className="link-btn" onClick={() => actions.setFirstServer(match.id, other(match.firstServer))}>
            Cambiar quién saca
          </button>
        </div>
      )}

      {pending && (
        <div className="overlay">
          <div className="overlay-card">
            <div className="vs-row">
              <PlayerBig team={teamA} />
              <span className="vs">VS</span>
              <PlayerBig team={teamB} />
            </div>
            <p className="muted">{describeConfig(match.config)}</p>
            <p>Saca primero:</p>
            <div className="chips center">
              {(['a', 'b'] as const).map((s) => (
                <button key={s} className={'chip' + (match.firstServer === s ? ' active' : '')} onClick={() => actions.setFirstServer(match.id, s)}>
                  {playerOf(s).name}
                </button>
              ))}
            </div>
            <button className="btn primary big block" onClick={() => actions.startMatch(match.id)}>
              🏓 ¡A jugar!
            </button>
            <button className="btn block" onClick={() => navigate(backTo)}>
              Volver
            </button>
          </div>
        </div>
      )}

      {betweenGames && lastGame && (
        <div className="overlay">
          <div className="overlay-card">
            <div className="big-emoji">🎯</div>
            <h2>Juego para {playerOf(lastGame.winner!).name}</h2>
            <p className="game-final">
              {lastGame.a} - {lastGame.b}
            </p>
            <p className="muted">
              Juegos: {pA.name} {state.gamesWon.a} - {state.gamesWon.b} {pB.name}
            </p>
            <button
              className="btn primary big block"
              onClick={() => {
                setFlipped((f) => !f)
                setSeenGames(completedGames)
              }}
            >
              ⇄ Cambiar lados y seguir
            </button>
            <button className="btn block" onClick={() => setSeenGames(completedGames)}>
              Seguir sin cambiar
            </button>
            <button className="link-btn" onClick={undo}>
              ↶ Deshacer último punto
            </button>
          </div>
        </div>
      )}

      {finished && <MatchResult match={match} teamA={teamA} teamB={teamB} onUndo={undo} backTo={backTo} />}
    </div>
  )
}

function PlayerBig({ team }: { team: Player[] }) {
  return (
    <div className="player-big">
      <TeamAvatar team={team} size={64} />
      <strong>{teamName(team)}</strong>
    </div>
  )
}

function MatchResult({ match, teamA, teamB, onUndo, backTo }: { match: Match; teamA: Player[]; teamB: Player[]; onUndo: () => void; backTo: string }) {
  const pA = teamAsPlayer(teamA)
  const pB = teamAsPlayer(teamB)
  const data = useData()
  const navigate = useNavigate()
  const state = computeMatch(match.points, match.config, match.firstServer)
  const winner = state.winner === 'a' ? pA : state.winner === 'b' ? pB : null
  const winnerTeam = state.winner === 'a' ? teamA : teamB

  // ELO y logros: comparamos el historial con y sin este partido.
  const { delta, newAchievements, elo } = useMemo(() => {
    const withMatch = computeLeaderboard(data)
    const without = computeLeaderboard({ ...data, matches: data.matches.filter((m) => m.id !== match.id) })
    const news: { player: Player; ids: string[] }[] = []
    for (const p of [...teamA, ...teamB]) {
      const before = without.stats.get(p.id)?.achievements ?? []
      const after = withMatch.stats.get(p.id)?.achievements ?? []
      const ids = after.filter((x) => !before.includes(x))
      if (ids.length) news.push({ player: p, ids })
    }
    return {
      delta: withMatch.eloDeltas.get(match.id),
      newAchievements: news,
      elo: { a: teamElo(teamA), b: teamElo(teamB) },
    }
    function teamElo(team: Player[]) {
      return Math.round(team.reduce((sum, p) => sum + (withMatch.stats.get(p.id)?.elo ?? 1000), 0) / team.length)
    }
  }, [data, match.id, teamA, teamB])

  const rematch = () => {
    const m = actions.createMatch(sidePlayers(match, 'a'), sidePlayers(match, 'b'), match.config, other(match.firstServer))
    navigate(`/partido/${m.id}`)
  }

  return (
    <div className="overlay result">
      {winner && <Confetti />}
      <div className="overlay-card">
        <div className="big-emoji">{winner ? '🏆' : '🤝'}</div>
        {winner ? (
          <>
            <TeamAvatar team={winnerTeam} size={80} />
            <h2>¡{winnerTeam.length > 1 ? 'Ganaron' : 'Ganó'} {winner.name}!</h2>
          </>
        ) : (
          <h2>¡Empate!</h2>
        )}
        <div className="result-score">
          <div className={'rs-side' + (state.winner === 'a' ? ' w' : '')}>
            <span>{pA.emoji} {pA.name}</span>
            <b>{state.gamesWon.a}</b>
            {delta && <span className={'elo-delta ' + (delta.a >= 0 ? 'up' : 'down')}>{delta.a >= 0 ? '+' : ''}{delta.a} ELO</span>}
            <span className="muted small">{levelFor(elo.a).emoji} {elo.a}</span>
          </div>
          <span className="vs">-</span>
          <div className={'rs-side' + (state.winner === 'b' ? ' w' : '')}>
            <span>{pB.emoji} {pB.name}</span>
            <b>{state.gamesWon.b}</b>
            {delta && <span className={'elo-delta ' + (delta.b >= 0 ? 'up' : 'down')}>{delta.b >= 0 ? '+' : ''}{delta.b} ELO</span>}
            <span className="muted small">{levelFor(elo.b).emoji} {elo.b}</span>
          </div>
        </div>
        <p className="muted">{state.games.map((g) => `${g.a}-${g.b}`).join(' · ')}</p>

        {newAchievements.length > 0 && (
          <div className="new-achievements">
            {newAchievements.map(({ player, ids }) =>
              ids.map((aid) => {
                const info = ACHIEVEMENTS[aid as keyof typeof ACHIEVEMENTS]
                return (
                  <div key={player.id + aid} className="achievement-toast">
                    <span className="badge-emoji">{info.emoji}</span>
                    <span>
                      <b>{player.name}</b> desbloqueó <b>{info.name}</b>
                    </span>
                  </div>
                )
              }),
            )}
          </div>
        )}

        {!match.tournamentId && (
          <button className="btn primary big block" onClick={rematch}>
            🔁 Revancha
          </button>
        )}
        <button className={'btn block' + (match.tournamentId ? ' primary big' : '')} onClick={() => navigate(backTo)}>
          {match.tournamentId ? '🎪 Volver al torneo' : '🏠 Inicio'}
        </button>
        <div className="row gap center">
          <button className="link-btn" onClick={onUndo}>
            ↶ Deshacer último punto
          </button>
          {!match.tournamentId && (
            <button
              className="link-btn danger-text"
              onClick={() => {
                if (confirm('¿Borrar este partido del historial?')) {
                  actions.deleteMatch(match.id)
                  navigate('/historial')
                }
              }}
            >
              🗑️ Borrar
            </button>
          )}
        </div>
        <p className="muted small">{formatDate(match.finishedAt ?? match.createdAt)}</p>
      </div>
    </div>
  )
}

function Confetti() {
  // Distribución pseudoaleatoria determinística (sin Math.random en el render).
  const pieces = Array.from({ length: 40 }, (_, i) => ({
    left: (i * 37) % 100,
    delay: ((i * 13) % 15) / 10,
    duration: 2.5 + ((i * 7) % 20) / 10,
    emoji: ['🎉', '🏓', '✨', '🎊', '⭐'][i % 5],
  }))
  return (
    <div className="confetti" aria-hidden>
      {pieces.map((p, i) => (
        <span key={i} style={{ left: `${p.left}%`, animationDelay: `${p.delay}s`, animationDuration: `${p.duration}s` }}>
          {p.emoji}
        </span>
      ))}
    </div>
  )
}

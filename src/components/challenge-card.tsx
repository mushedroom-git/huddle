import { useEffect, useRef, useState } from 'react'
import { challengeFor, placeLabel } from '@/lib/challenge'
import { useNav } from '@/state/nav'
import { useMe, useStore } from '@/state/store'
import { Icon } from '@/components/ui'

/** The One Day Challenge at a glance: rank, points, and the next thing to do. Home and Me share it. */
export function ChallengeCard() {
  const { state } = useStore()
  const { me } = useMe()
  const nav = useNav()
  const board = challengeFor(state, me.id)
  const share = Math.min(100, (board.earned / board.possible) * 100)
  const earned = useCountUp(board.earned)
  const place = placeLabel(board.rank)

  return (
    <button type="button" onClick={() => nav.open({ type: 'challenge' })} className="challenge-panel block w-full rounded-[26px] p-5 text-left">
      <svg viewBox="0 0 160 100" className="pointer-events-none absolute bottom-0 right-0 -z-10 h-32 w-48" aria-hidden>
        <polygon points="10,100 64,34 118,100" fill="rgba(61,205,88,0.14)" />
        <polygon points="62,100 116,40 170,100" fill="rgba(61,205,88,0.26)" />
        <line x1="116" y1="40" x2="116" y2="16" stroke="#3dcd58" strokeWidth="2" strokeLinecap="round" />
        <path d="M117 16 L131 21 L117 26 Z" fill="#3dcd58" />
      </svg>
      <span className="flex items-center justify-between gap-3">
        <span className="eyebrow text-white/70">One Day Challenge</span>
        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold text-green ring-1 ring-green/50">
          <Icon name="trophy" className="h-3.5 w-3.5" />
          {place}
        </span>
      </span>
      <span className="mt-3 block text-[2.3rem] font-extrabold leading-none tracking-tight">{place} place</span>
      <span className="mt-1.5 block text-sm text-white/70 tabular-nums">
        {earned} of {board.possible} pts
      </span>
      <span className="mt-4 block h-1.5 w-[62%] overflow-hidden rounded-full bg-white/12">
        <span className="grow-x block h-full rounded-full bg-green" style={{ width: `${share}%` }} />
      </span>
      {board.next ? (
        <span className="mt-3 block max-w-[62%] text-xs leading-snug text-white/60">
          Next: {board.next.title} <span className="font-bold text-green">+{board.next.points}</span>
        </span>
      ) : (
        <span className="mt-3 block text-xs font-semibold text-green">Every challenge done.</span>
      )}
    </button>
  )
}

/** Eases a number up to its target, from wherever it was last. */
export function useCountUp(target: number, duration = 900): number {
  const [shown, setShown] = useState(() => (prefersReducedMotion() ? target : 0))
  const current = useRef(shown)

  useEffect(() => {
    if (prefersReducedMotion()) {
      current.current = target
      setShown(target)
      return
    }
    const from = current.current
    const start = performance.now()
    let frame = 0
    const tick = (time: number) => {
      const t = Math.min(1, (time - start) / duration)
      const value = Math.round(from + (target - from) * (1 - Math.pow(1 - t, 3)))
      current.current = value
      setShown(value)
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, duration])

  return shown
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

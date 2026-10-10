import { useRef, useState, type ChangeEvent } from 'react'
import { challengeFor, placeLabel, type ChallengeItem, type ChallengeKey, type PersonStanding } from '@/lib/challenge'
import { presentPerson } from '@/lib/logic'
import { useNav } from '@/state/nav'
import { resizePhoto } from '@/lib/photos'
import { useMe, useStore } from '@/state/store'
import { Avatar, Icon, ScreenHeader } from '@/components/ui'
import type { Moment } from '@/lib/types'

const HINT: Record<ChallengeKey, string> = {
  profile: 'Let the room know what you want.',
  match: 'Someone whose topics line up with yours.',
  department: 'A department you have not met.',
  selfie: 'Once, with the Executive VP.',
  question: 'Put one question on the board.',
  photos: 'Three photos from the day.',
  commitment: 'One action to take back.',
  feedback: 'One rating before you leave.',
}

const GLYPH: Record<ChallengeKey, 'user' | 'people' | 'pin' | 'camera' | 'message' | 'check' | 'star'> = {
  profile: 'user',
  match: 'people',
  department: 'pin',
  selfie: 'camera',
  question: 'message',
  photos: 'camera',
  commitment: 'check',
  feedback: 'star',
}

export function ChallengeSheet() {
  const nav = useNav()
  const { state, dispatch } = useStore()
  const { me } = useMe()
  const board = challengeFor(state, me.id)
  const [pane, setPane] = useState<'do' | 'board'>('do')
  const input = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [consentOpen, setConsentOpen] = useState(false)
  const mine = state.photos
    .filter((photo) => photo.uploaderId === me.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const finishedCount = board.items.filter((item) => item.done >= item.cap).length
  const progress = Math.round((board.earned / board.possible) * 100)

  const openCamera = () => {
    if (state.photoConsent.includes(me.id)) input.current?.click()
    else setConsentOpen(true)
  }

  const onFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !file.type.startsWith('image/')) return
    setBusy(true)
    try {
      const sized = await resizePhoto(file)
      const photo: Moment = {
        id: `m-${crypto.randomUUID()}`,
        uploaderId: me.id,
        caption: 'With the Executive VP',
        createdAt: new Date().toISOString(),
        thumb: sized.thumb,
        full: sized.full,
      }
      dispatch({ type: 'addPhotos', photos: [photo], selfie: true })
    } catch {
      dispatch({ type: 'toast', text: 'That photo could not be read.' })
    } finally {
      setBusy(false)
    }
  }

  const go = (item: ChallengeItem) => {
    if (item.key === 'profile') nav.open({ type: 'setup' })
    else if (item.key === 'match') nav.setTab('people', { filter: 'matches' })
    else if (item.key === 'department') nav.setTab('people', { filter: 'unmet' })
    else if (item.key === 'question') nav.setTab('ask', { ask: 'qa' })
    else if (item.key === 'photos') nav.setTab('day', { day: 'photos' })
    else if (item.key === 'commitment') nav.setTab('ask', { ask: 'wall' })
    else if (item.key === 'feedback') nav.setTab('ask', { ask: 'feedback' })
  }

  return (
    <div className="sheet-in absolute inset-0 z-40 overflow-y-auto bg-cream px-4 pb-16">
      <ScreenHeader title="One Day Challenge" onBack={nav.close} />
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[2.4rem] font-semibold leading-none tabular-nums tracking-tight">{board.earned}</p>
          <p className="mt-1 text-sm text-muted">points</p>
        </div>
        <div className="flex items-center gap-3">
          <Ring done={finishedCount} total={board.items.length} />
          <p className="text-sm leading-tight">
            <span className="block text-lg font-semibold tabular-nums">
              {finishedCount}/{board.items.length}
            </span>
            <span className="text-muted">completed</span>
          </p>
        </div>
      </div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-sand">
        <div className="h-full rounded-full bg-green" style={{ width: `${progress}%` }} />
      </div>
      <div className="mt-4 grid grid-cols-2 rounded-full bg-sand p-1">
        <button type="button" onClick={() => setPane('do')} className={`h-10 rounded-full text-sm font-semibold ${pane === 'do' ? 'bg-paper text-ink shadow-sm' : 'text-muted'}`}>
          Missions
        </button>
        <button type="button" onClick={() => setPane('board')} className={`h-10 rounded-full text-sm font-semibold ${pane === 'board' ? 'bg-paper text-ink shadow-sm' : 'text-muted'}`}>
          Leaderboard
        </button>
      </div>

      {pane === 'do' ? (
        <div className="mt-4 space-y-2">
          {board.items.map((item) => {
            const finished = item.done >= item.cap
            const current = board.next?.key === item.key
            return (
              <div key={item.key} className={`rounded-2xl bg-paper p-3 ${current ? 'ring-2 ring-green' : ''}`}>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => item.key !== 'selfie' && go(item)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-green/15 text-ink">
                      <Icon name={GLYPH[item.key]} className="h-5 w-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-semibold leading-tight">{item.title}</span>
                      <span className="mt-0.5 block text-sm text-muted">{HINT[item.key]}</span>
                    </span>
                  </button>
                  <span className="shrink-0 rounded-full bg-sand px-2.5 py-1 text-sm font-semibold tabular-nums">+{finished ? item.earned : item.points}</span>
                  {item.key === 'selfie' && !finished ? null : (
                    <button type="button" onClick={() => go(item)} aria-label={`Open ${item.title}`} className="grid h-8 w-8 shrink-0 place-items-center text-muted">
                      <Icon name="back" className="h-4 w-4 rotate-180" />
                    </button>
                  )}
                </div>
                {item.key === 'selfie' && !finished ? (
                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={openCamera}
                      className="rounded-full bg-ink px-3 py-1.5 text-sm font-semibold text-cream disabled:opacity-40"
                    >
                      {busy ? 'Adding…' : 'Add photo'}
                    </button>
                  </div>
                ) : null}
                {finished ? (
                  <p className="mt-2 flex items-center gap-1.5 pl-[3.25rem] text-sm font-medium">
                    <Icon name="check" className="h-4 w-4 text-green" />
                    Completed
                  </p>
                ) : null}
                {current && item.cap > 1 ? (
                  <div className="mt-3 pl-[3.25rem]">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-muted">
                        {item.done} of {item.cap}
                      </span>
                      <button type="button" onClick={() => go(item)} className="inline-flex items-center gap-0.5 font-semibold">
                        Continue
                        <Icon name="back" className="h-4 w-4 rotate-180" />
                      </button>
                    </div>
                    <div className="mt-2 flex gap-1">
                      {Array.from({ length: item.cap }, (_, index) => (
                        <span key={index} className={`h-1.5 flex-1 rounded-full ${index < item.done ? 'bg-green' : 'bg-sand'}`} />
                      ))}
                    </div>
                  </div>
                ) : null}
                {item.key === 'selfie' && !finished && mine.length ? (
                  <button
                    type="button"
                    onClick={() => dispatch({ type: 'claimSelfie', photoId: mine[0].id })}
                    className="mt-2 pl-[3.25rem] text-sm font-semibold text-ink underline decoration-green decoration-2 underline-offset-4"
                  >
                    Use a photo I already posted
                  </button>
                ) : null}
              </div>
            )
          })}
        </div>
      ) : (
        <Leaderboard standing={board.standing} viewerId={me.id} />
      )}

      <input ref={input} type="file" accept="image/*" capture="environment" className="hidden" onChange={onFile} />
      {consentOpen ? (
        <div className="fade-in absolute inset-0 z-50 flex items-end bg-navy/40" onClick={() => setConsentOpen(false)}>
          <div className="w-full rounded-t-[28px] bg-cream px-5 pb-8 pt-4" onClick={(event) => event.stopPropagation()}>
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line" />
            <h2 className="text-xl font-semibold tracking-tight">Everyone here can see it</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-muted">The selfie goes on the shared album. You can take it down. Organizers can take the points off.</p>
            <button
              type="button"
              onClick={() => {
                dispatch({ type: 'consentPhotos' })
                setConsentOpen(false)
                input.current?.click()
              }}
              className="mt-5 h-12 w-full rounded-full bg-ink text-[15px] font-semibold text-cream"
            >
              Add the selfie
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function Leaderboard({ standing, viewerId }: { standing: PersonStanding[]; viewerId: string }) {
  const top = standing.slice(0, 5)
  const mine = standing.find((row) => row.id === viewerId)
  const outside = mine && !top.some((row) => row.id === viewerId) ? mine : null
  return (
    <div className="mt-4">
      <p className="text-sm text-muted">Top five, on their own points.</p>
      <ol className="mt-3 space-y-2">
        {top.map((row) => (
          <StandingRow key={row.id} row={row} viewerId={viewerId} yours={row.id === viewerId} labelYou={row.id === viewerId} />
        ))}
      </ol>
      {outside ? (
        <div className="mt-5">
          <p className="text-sm font-semibold">Your place</p>
          <p className="mt-0.5 text-sm text-muted">You are {placeLabel(outside.rank)}.</p>
          <ol className="mt-2">
            <StandingRow row={outside} viewerId={viewerId} yours />
          </ol>
        </div>
      ) : null}
    </div>
  )
}

function StandingRow({ row, viewerId, yours, labelYou = false }: { row: PersonStanding; viewerId: string; yours: boolean; labelYou?: boolean }) {
  const { state } = useStore()
  const view = presentPerson(state, viewerId, row.id)
  if (!view) return null
  return (
    <li className={`flex items-center gap-3 rounded-2xl bg-paper px-3 py-3 ${yours ? 'ring-2 ring-green' : ''}`}>
      <span className="w-7 shrink-0 text-center text-sm font-semibold tabular-nums text-muted">{row.rank}</span>
      <Avatar person={view} size={40} />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-semibold">
          {view.fullName}
          {labelYou ? ' · You' : ''}
        </span>
        <span className="block truncate text-sm text-muted">{view.department}</span>
      </span>
      <span className="shrink-0 text-right">
        <span className="block font-semibold tabular-nums">{row.points}</span>
        <span className="block text-[11px] text-muted">pts</span>
      </span>
    </li>
  )
}

function Ring({ done, total }: { done: number; total: number }) {
  const radius = 26
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - (total ? done / total : 0))
  return (
    <svg viewBox="0 0 64 64" className="h-16 w-16" aria-hidden>
      <circle cx="32" cy="32" r={radius} fill="none" className="stroke-sand" strokeWidth="6" />
      <circle
        cx="32"
        cy="32"
        r={radius}
        fill="none"
        className="stroke-green"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 32 32)"
      />
    </svg>
  )
}

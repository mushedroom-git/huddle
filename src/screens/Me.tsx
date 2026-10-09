import { useEffect, useState } from 'react'
import { challengeFor, placeLabel } from '@/lib/challenge'
import { privacySummary } from '@/lib/logic'
import { useFrame } from '@/state/frame'
import { useNav } from '@/state/nav'
import { useMe, useStore } from '@/state/store'
import { Avatar, Icon, Segmented, Toggle } from '@/components/ui'
import type { Profile } from '@/lib/types'

const SECTIONS = [
  { id: 'about' as const, label: 'About' },
  { id: 'goals' as const, label: 'Goals' },
  { id: 'activity' as const, label: 'Activity' },
]

export function Me() {
  const { state, dispatch } = useStore()
  const { me, profile, view, met } = useMe()
  const nav = useNav()
  const frame = useFrame()
  const [banner, setBanner] = useState(profile.banner)
  const [workshopGoal, setWorkshopGoal] = useState(profile.workshopGoal)
  const [dayGoal, setDayGoal] = useState(profile.dayGoal)
  const [goalsVisible, setGoalsVisible] = useState(profile.goalsVisible)
  const [section, setSection] = useState<(typeof SECTIONS)[number]['id']>('about')

  useEffect(() => {
    setBanner(profile.banner)
    setWorkshopGoal(profile.workshopGoal)
    setDayGoal(profile.dayGoal)
    setGoalsVisible(profile.goalsVisible)
  }, [profile])

  if (!view) return null
  const install = state.installHintDismissed ? null : installHelp()
  const board = challengeFor(state, me.id)
  const progress = board.possible ? board.earned / board.possible : 0
  const interests = [...new Set([...profile.lookingTopics, ...profile.offerTopics])]
  const mine = state.commitments.find((item) => item.participantId === me.id)
  const asked = state.questions.filter((question) => question.authorId === me.id)

  const save = (patch: Partial<Profile> = {}) => {
    dispatch({
      type: 'saveProfile',
      profile: {
        ...profile,
        banner,
        workshopGoal,
        dayGoal,
        goalsVisible,
        ...patch,
      },
      linkedinUrl: me.linkedinUrl,
    })
  }

  return (
    <div className={frame === 'phone' ? 'space-y-3 px-4' : 'mx-auto w-full max-w-3xl space-y-3 px-8 py-2'}>
      <section className="overflow-hidden rounded-[24px] bg-paper">
        <div className="flex items-center gap-4 p-4">
          <Avatar person={view} size={96} />
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-semibold leading-tight tracking-tight">{me.fullName}</h1>
            <p className="mt-0.5 text-sm leading-snug text-muted">{me.jobTitle}</p>
            <span className="mt-2 inline-flex rounded-full bg-sand px-2.5 py-0.5 text-xs font-semibold">{me.department}</span>
          </div>
        </div>
        <div className="px-4 pb-4">
          {banner ? <p className="mb-3 text-sm leading-snug">{banner}</p> : null}
          <button
            type="button"
            onClick={() => save({ discoverable: !profile.discoverable })}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${profile.discoverable ? 'bg-green text-ink' : 'bg-sand text-muted'}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${profile.discoverable ? 'bg-ink' : 'bg-muted'}`} />
            {profile.discoverable ? 'Open to connect' : 'Not discoverable'}
          </button>
        </div>
      </section>

      <button type="button" onClick={() => nav.open({ type: 'challenge' })} className="flex w-full items-center gap-4 rounded-[24px] bg-paper p-4 text-left ring-2 ring-green">
        <Ring progress={progress} />
        <span className="min-w-0">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">One Day Challenge</span>
          <span className="mt-1 block text-2xl font-semibold leading-none tracking-tight">{placeLabel(board.rank)}</span>
          <span className="mt-1 block text-sm text-muted">
            {board.earned} of {board.possible} points
          </span>
        </span>
      </button>

      <Segmented options={SECTIONS} value={section} onChange={setSection} />

      {section === 'about' ? (
        <div className="space-y-3">
          <TopicTiles label="Looking for" icon="target" topics={profile.lookingTopics} empty="Add what you want" onEdit={() => nav.open({ type: 'setup' })} />
          <TopicTiles label="Can offer" icon="offer" topics={profile.offerTopics} empty="Add what you can offer" onEdit={() => nav.open({ type: 'setup' })} />
          <TopicTiles label="Interests" icon="star" topics={interests} empty="Topics you share show up here" onEdit={() => nav.open({ type: 'setup' })} />
        </div>
      ) : null}

      {section === 'goals' ? (
        <section className="rounded-[24px] bg-paper p-4">
          <h2 className="font-semibold">Goals for the day</h2>
          <p className="mt-1 text-sm text-muted">What you want from today. Choose whether other participants can see it.</p>
          <label className="mt-3 block">
            <span className="text-sm text-muted">A line with your photo</span>
            <input
              value={banner}
              maxLength={120}
              onChange={(event) => setBanner(event.target.value)}
              placeholder="A line others see with your photo"
              className="mt-1 w-full rounded-2xl bg-sand px-3 py-2 text-[15px] outline-none"
            />
          </label>
          <label className="mt-3 block">
            <span className="text-sm text-muted">Goal for this workshop</span>
            <input
              value={workshopGoal}
              maxLength={240}
              onChange={(event) => setWorkshopGoal(event.target.value)}
              placeholder="What you hope to leave with"
              className="mt-1 w-full rounded-2xl bg-sand px-3 py-2 text-[15px] outline-none"
            />
          </label>
          <label className="mt-3 block">
            <span className="text-sm text-muted">Goal of the day</span>
            <input
              value={dayGoal}
              maxLength={240}
              onChange={(event) => setDayGoal(event.target.value)}
              placeholder="One thing for today"
              className="mt-1 w-full rounded-2xl bg-sand px-3 py-2 text-[15px] outline-none"
            />
          </label>
          <div className="mt-3">
            <Toggle
              on={goalsVisible}
              label="Visible to other participants"
              onChange={(next) => {
                setGoalsVisible(next)
                save({ goalsVisible: next, workshopGoal, dayGoal, banner })
              }}
            />
          </div>
          <button type="button" onClick={() => save()} className="mt-3 h-12 w-full rounded-full bg-ink text-[15px] font-semibold text-cream">
            Save goals
          </button>
        </section>
      ) : null}

      {section === 'activity' ? (
        <div className="space-y-3">
          <button type="button" onClick={() => nav.setTab('ask', { ask: 'wall' })} className="w-full rounded-[24px] bg-paper p-4 text-left">
            <span className="flex items-center gap-2 font-semibold">
              <Icon name="leaf" className="h-4 w-4" />
              Commitment
            </span>
            <span className="mt-1 block text-sm leading-snug text-muted">{mine?.text ?? 'Publish one action to take back.'}</span>
          </button>
          <button type="button" onClick={() => nav.setTab('ask', { ask: 'qa' })} className="w-full rounded-[24px] bg-paper p-4 text-left">
            <span className="flex items-center gap-2 font-semibold">
              <Icon name="message" className="h-4 w-4" />
              Questions
            </span>
            <span className="mt-1 block text-sm text-muted">{asked.length ? `${asked.length} asked` : 'None yet'}</span>
          </button>
          <button type="button" onClick={() => nav.setTab('people', { filter: 'circuit' })} className="w-full rounded-[24px] bg-paper p-4 text-left">
            <span className="flex items-center gap-2 font-semibold">
              <Icon name="people" className="h-4 w-4" />
              People met
            </span>
            <span className="mt-1 block text-sm text-muted">{met.length}</span>
          </button>
        </div>
      ) : null}

      {me.linkedinUrl ? (
        <a href={me.linkedinUrl} className="flex h-12 items-center justify-center rounded-2xl bg-paper text-sm font-semibold text-navy ring-1 ring-line">
          Find me on Spice+
        </a>
      ) : null}

      <button type="button" onClick={() => nav.open({ type: 'card' })} className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-ink text-sm font-semibold text-cream">
        <Icon name="qr" className="h-4 w-4" />
        My card
      </button>

      <button type="button" onClick={() => nav.open({ type: 'setup', focus: 'privacy' })} className="flex w-full items-center gap-3 rounded-2xl bg-paper p-3 text-left">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-green/15">
          <Icon name="lock" className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm text-muted">Profile visibility</span>
          <span className="block text-sm font-medium leading-snug">{privacySummary(profile)}</span>
        </span>
        <Icon name="back" className="h-4 w-4 shrink-0 rotate-180 text-muted" />
      </button>

      {me.isOrganizer ? (
        <button type="button" onClick={() => nav.open({ type: 'organizer' })} className="flex h-12 w-full items-center justify-center rounded-2xl bg-gold text-sm font-semibold text-gold-ink">
          Run the day
        </button>
      ) : null}

      {install ? (
        <div className="flex items-center gap-3 rounded-2xl bg-paper p-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-green/15">
            <Icon name="share" className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold">Add The Huddle to your home screen</span>
            <span className="mt-0.5 block text-sm text-muted">{install}</span>
          </span>
          <button type="button" onClick={() => dispatch({ type: 'dismissInstall' })} className="shrink-0 text-sm font-semibold underline decoration-green decoration-2 underline-offset-4">
            Done
          </button>
        </div>
      ) : null}

      {state.event.credits.length ? <p className="pb-2 text-center text-xs text-muted">{state.event.credits.join(' · ')}</p> : null}
    </div>
  )
}

function Ring({ progress }: { progress: number }) {
  const radius = 26
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - Math.min(1, Math.max(0, progress)))
  return (
    <svg viewBox="0 0 64 64" className="h-16 w-16 shrink-0" aria-hidden>
      <circle cx="32" cy="32" r={radius} fill="none" stroke="currentColor" className="text-line" strokeWidth="5" />
      <circle
        cx="32"
        cy="32"
        r={radius}
        fill="none"
        stroke="currentColor"
        className="text-green"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 32 32)"
      />
    </svg>
  )
}

function TopicTiles({
  label,
  icon,
  topics,
  empty,
  onEdit,
}: {
  label: string
  icon: 'target' | 'offer' | 'star'
  topics: string[]
  empty: string
  onEdit: () => void
}) {
  return (
    <section className="rounded-[24px] bg-paper p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-semibold">
          <Icon name={icon} className="h-4 w-4" />
          {label}
        </h2>
        <button type="button" onClick={onEdit} className="text-sm font-semibold text-green">
          Edit
        </button>
      </div>
      {topics.length ? (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {topics.map((topic) => (
            <span key={topic} className="grid min-h-24 content-center justify-items-center gap-2 rounded-2xl bg-sand px-2 py-3 text-center">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-green/20 text-green">
                <Icon name={icon} className="h-4 w-4" />
              </span>
              <span className="text-xs font-semibold leading-tight">{topic}</span>
            </span>
          ))}
        </div>
      ) : (
        <button type="button" onClick={onEdit} className="mt-2 text-sm text-muted">
          {empty}
        </button>
      )}
    </section>
  )
}

function installHelp(): string | null {
  if (typeof navigator === 'undefined') return null
  const standalone = window.matchMedia('(display-mode: standalone)').matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
  if (standalone) return null
  const ua = navigator.userAgent
  if (/iphone|ipad/i.test(ua)) return 'On iPhone: Share, then Add to Home Screen.'
  if (/android/i.test(ua)) return 'On Android: browser menu, then Install app.'
  return 'Install it from the browser menu so it opens like an app.'
}

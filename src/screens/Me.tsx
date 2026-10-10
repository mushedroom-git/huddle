import { useEffect, useState } from 'react'
import { privacySummary } from '@/lib/logic'
import { useFrame } from '@/state/frame'
import { useNav } from '@/state/nav'
import { useMe, useStore } from '@/state/store'
import { ChallengeCard } from '@/components/challenge-card'
import { Avatar, Icon, Segmented, Toggle } from '@/components/ui'
import type { Profile } from '@/lib/types'

const SECTIONS = [
  { id: 'about' as const, label: 'About' },
  { id: 'goals' as const, label: 'Goals' },
]

export function Me() {
  const { state, dispatch } = useStore()
  const { me, profile, view, met, connected } = useMe()
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

  const stats = [
    { label: 'People met', value: met.length, onClick: () => nav.setTab('people', { filter: 'all' }) },
    { label: 'Connections', value: connected.length, onClick: () => nav.setTab('people', { filter: 'circuit' }) },
    { label: 'Questions', value: asked.length, onClick: () => nav.setTab('ask', { ask: 'qa' }) },
  ]

  return (
    <div className={frame === 'phone' ? 'stagger space-y-3 px-4 pt-1' : 'stagger mx-auto w-full max-w-3xl space-y-3 px-8 py-2'}>
      <section className="overflow-hidden rounded-[28px] bg-paper">
        <div className="profile-cover h-24" />
        <div className="px-4 pb-4">
          <div className="-mt-12 flex items-end justify-between gap-3">
            <span className="shrink-0 rounded-full bg-[#f5c542] p-[3px] shadow-[0_10px_24px_-8px_rgba(0,0,0,0.35)]">
              <Avatar person={view} size={96} className="align-top ring-[3px] ring-paper" />
            </span>
            <button
              type="button"
              onClick={() => save({ discoverable: !profile.discoverable })}
              aria-pressed={profile.discoverable}
              className={`mb-1 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${profile.discoverable ? 'bg-green text-on' : 'bg-sand text-muted'}`}
            >
              {profile.discoverable ? <span className="live-dot bg-on!" /> : <span className="h-2 w-2 rounded-full bg-muted" />}
              {profile.discoverable ? 'Open to connect' : 'Not discoverable'}
            </button>
          </div>
          <h1 className="mt-3 text-[1.7rem] font-extrabold leading-tight tracking-tight">{me.fullName}</h1>
          <p className="mt-0.5 text-sm text-muted">{me.jobTitle}</p>
          <span className="mt-2 inline-flex rounded-full bg-sand px-2.5 py-0.5 text-xs font-semibold">{me.department}</span>
          {banner ? <p className="mt-3 border-l-2 border-green pl-3 text-sm leading-snug">{banner}</p> : null}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button type="button" onClick={() => nav.open({ type: 'card' })} className="flex h-11 items-center justify-center gap-2 rounded-full bg-ink text-sm font-semibold text-cream">
              <Icon name="qr" className="h-4 w-4" />
              My card
            </button>
            <button type="button" onClick={() => nav.open({ type: 'setup' })} className="flex h-11 items-center justify-center gap-2 rounded-full bg-sand text-sm font-semibold">
              <Icon name="edit" className="h-4 w-4" />
              Edit profile
            </button>
          </div>
        </div>
      </section>

      <ChallengeCard />

      <div className="grid grid-cols-3 gap-2">
        {stats.map((stat) => (
          <button key={stat.label} type="button" onClick={stat.onClick} className="rounded-[20px] bg-paper px-2 py-3 text-center">
            <span className="block text-2xl font-extrabold leading-none tabular-nums">{stat.value}</span>
            <span className="mt-1.5 block truncate text-xs font-medium text-muted">{stat.label}</span>
          </button>
        ))}
      </div>

      <Segmented options={SECTIONS} value={section} onChange={setSection} />

      {section === 'about' ? (
        <div className="space-y-3">
          <TopicChips label="Looking for" icon="target" tone="green" topics={profile.lookingTopics} empty="Add what you want from today" onEdit={() => nav.open({ type: 'setup' })} />
          <TopicChips label="Can offer" icon="offer" tone="gold" topics={profile.offerTopics} empty="Add what you can help with" onEdit={() => nav.open({ type: 'setup' })} />
          <button type="button" onClick={() => nav.setTab('ask', { ask: 'wall' })} className="block w-full rounded-[24px] bg-paper p-4 text-left">
            <span className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 font-bold">
                <Icon name="leaf" className="h-4 w-4 text-green" />
                My commitment
              </span>
              <Icon name="chevron" className="h-4 w-4 text-muted" />
            </span>
            <span className={`mt-2 block leading-snug ${mine ? 'text-[15px] font-semibold' : 'text-sm text-muted'}`}>{mine ? `“${mine.text}”` : 'Add one action to take back to your team.'}</span>
          </button>
        </div>
      ) : null}

      {section === 'goals' ? (
        <section className="rounded-[24px] bg-paper p-4">
          <h2 className="font-bold">Goals for the day</h2>
          <p className="mt-1 text-sm text-muted">What you want from today. Choose whether other participants can see it.</p>
          <GoalField label="A line with your photo" value={banner} max={120} onChange={setBanner} placeholder="A line others see with your photo" />
          <GoalField label="Goal for this workshop" value={workshopGoal} max={240} onChange={setWorkshopGoal} placeholder="What you hope to leave with" />
          <GoalField label="Goal of the day" value={dayGoal} max={240} onChange={setDayGoal} placeholder="One thing for today" />
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
          <button type="button" onClick={() => save()} className="mt-3 h-12 w-full rounded-full bg-green text-[15px] font-bold text-on">
            Save goals
          </button>
        </section>
      ) : null}

      <section className="overflow-hidden rounded-[24px] bg-paper">
        <p className="eyebrow px-4 pb-1 pt-4 text-muted">Settings</p>
        <SettingRow icon="lock" title="Profile visibility" detail={privacySummary(profile)} onClick={() => nav.open({ type: 'setup', focus: 'privacy' })} />
        {me.linkedinUrl ? (
          <a href={me.linkedinUrl} className="flex w-full items-center gap-3 border-t border-line px-4 py-3 text-left">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-green/15 text-green">
              <Icon name="user" className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold">Find me on Spice+</span>
              <span className="block truncate text-xs text-muted">Your directory profile</span>
            </span>
            <Icon name="share" className="h-4 w-4 shrink-0 text-muted" />
          </a>
        ) : null}
        {me.isOrganizer ? <SettingRow icon="clipboard" title="Run the day" detail="Announcements, agenda, and the room" gold onClick={() => nav.open({ type: 'organizer' })} /> : null}
        {install ? (
          <div className="flex items-center gap-3 border-t border-line px-4 py-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-green/15 text-green">
              <Icon name="download" className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold">Add to your home screen</span>
              <span className="block text-xs leading-snug text-muted">{install}</span>
            </span>
            <button type="button" onClick={() => dispatch({ type: 'dismissInstall' })} className="shrink-0 rounded-full bg-sand px-3 py-1.5 text-xs font-semibold">
              Done
            </button>
          </div>
        ) : null}
      </section>

      {state.event.credits.length ? <p className="pb-2 text-center text-xs text-muted">{state.event.credits.join(' · ')}</p> : null}
    </div>
  )
}

function SettingRow({ icon, title, detail, gold = false, onClick }: { icon: 'lock' | 'clipboard'; title: string; detail: string; gold?: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex w-full items-center gap-3 border-t border-line px-4 py-3 text-left first-of-type:border-t-0">
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${gold ? 'bg-gold text-gold-ink' : 'bg-green/15 text-green'}`}>
        <Icon name={icon} className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{title}</span>
        <span className="block text-xs leading-snug text-muted">{detail}</span>
      </span>
      <Icon name="chevron" className="h-4 w-4 shrink-0 text-muted" />
    </button>
  )
}

function GoalField({ label, value, max, onChange, placeholder }: { label: string; value: string; max: number; onChange: (value: string) => void; placeholder: string }) {
  return (
    <label className="mt-3 block">
      <span className="text-sm font-semibold">{label}</span>
      <input
        value={value}
        maxLength={max}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-2xl bg-sand/60 px-3.5 py-2.5 text-[15px] outline-none ring-green/40 placeholder:text-muted/70 focus:ring-2"
      />
    </label>
  )
}

function TopicChips({
  label,
  icon,
  tone,
  topics,
  empty,
  onEdit,
}: {
  label: string
  icon: 'target' | 'offer'
  tone: 'green' | 'gold'
  topics: string[]
  empty: string
  onEdit: () => void
}) {
  return (
    <section className="rounded-[24px] bg-paper p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-bold">
          <Icon name={icon} className={`h-4 w-4 ${tone === 'green' ? 'text-green' : 'text-gold-ink dark:text-gold'}`} />
          {label}
        </h2>
        <button type="button" onClick={onEdit} className="text-sm font-semibold text-green">
          Edit
        </button>
      </div>
      {topics.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {topics.map((topic) => (
            <span key={topic} className={`rounded-full px-3 py-1.5 text-sm font-semibold ${tone === 'green' ? 'bg-green/15 text-green' : 'bg-gold text-gold-ink'}`}>
              {topic}
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

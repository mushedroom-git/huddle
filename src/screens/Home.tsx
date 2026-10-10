import { useState } from 'react'
import { agendaPhases, clockMinutes, firstName, matchPercent, presentPerson, spotlight, toMinutes } from '@/lib/logic'
import type { AgendaItem, Suggestion } from '@/lib/types'
import { ChallengeCard, useCountUp } from '@/components/challenge-card'
import { RoundTable } from '@/components/round-table'
import { useFrame } from '@/state/frame'
import { useNav } from '@/state/nav'
import { useMe, useStore } from '@/state/store'
import { Avatar, Icon, ThemeButton } from '@/components/ui'

export function Home() {
  const { state, dispatch } = useStore()
  const { matches } = useMe()
  const nav = useNav()
  const frame = useFrame()
  const minutes = clockMinutes(state.event)
  const phases = agendaPhases(state.event.agenda, minutes)
  const { now, next } = spotlight(state.event.agenda, phases)
  const seen = new Set(state.dismissals.filter((item) => item.userId === state.currentUserId).map((item) => item.announcementId))
  const note = state.announcements.find((item) => item.active && !seen.has(item.id))

  const wide = frame !== 'phone'

  return (
    <div className={wide ? 'grid grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)] items-start gap-8 px-8 py-6' : 'px-4 pt-4'}>
      <div className="stagger space-y-4">
        <ProfileBanner minutes={minutes} />

        {note ? (
          <div className="flex items-start gap-3 rounded-[22px] bg-paper p-3.5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-warm text-white">
              <Icon name={/bus/i.test(note.text) ? 'bus' : 'bell'} className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="eyebrow text-warm dark:text-[#f0a080]">Announcement</span>
              <span className="mt-0.5 block font-bold leading-snug">{note.text}</span>
              {/bus/i.test(note.text) ? (
                <span className="mt-0.5 block text-xs leading-snug text-muted">
                  {state.event.logistics.find((item) => item.icon === 'bus')?.body.split('.')[0]}.
                </span>
              ) : null}
            </span>
            <button type="button" aria-label="Dismiss announcement" onClick={() => dispatch({ type: 'dismissAnnouncement', id: note.id })} className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-sand">
              <Icon name="close" className="h-4 w-4" />
            </button>
          </div>
        ) : null}

        <LiveNow now={now} next={next} minutes={minutes} dateLabel={state.event.dateLabel} />
        <NextConversation matches={matches} />
        {wide ? null : <ChallengeCard />}
      </div>

      {wide ? (
        <div className="stagger space-y-4">
          <div className="grid h-80 place-items-center overflow-hidden rounded-[28px] bg-paper">
            <RoundTable className="h-full w-full" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Connections', value: state.connections.length, icon: 'people' as const, onClick: () => nav.open({ type: 'graph' }) },
              { label: 'Questions', value: state.questions.filter((question) => !question.isHidden).length, icon: 'message' as const, onClick: () => nav.setTab('ask') },
              { label: 'Commitments', value: state.commitments.length, icon: 'leaf' as const, onClick: () => nav.setTab('ask', { ask: 'wall' }) },
            ].map((stat) => (
              <button key={stat.label} type="button" onClick={stat.onClick} className="rounded-[22px] bg-paper p-4 text-left">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-green/15 text-green">
                  <Icon name={stat.icon} className="h-4 w-4" />
                </span>
                <span className="mt-3 block text-3xl font-extrabold leading-none tabular-nums">
                  <CountUp value={stat.value} />
                </span>
                <span className="mt-1 block text-xs font-medium text-muted">{stat.label}</span>
              </button>
            ))}
          </div>
          <ChallengeCard />
        </div>
      ) : null}
    </div>
  )
}

function NextConversation({ matches }: { matches: Suggestion[] }) {
  const { state, dispatch } = useStore()
  const { me } = useMe()
  const nav = useNav()
  const people = matches
    .slice(0, 5)
    .map((match) => ({ match, person: presentPerson(state, me.id, match.personId) }))
    .filter((row): row is { match: Suggestion; person: NonNullable<typeof row.person> } => Boolean(row.person))
  const [lead, ...rest] = people

  if (!lead) {
    return (
      <section className="hero-panel rounded-[30px] p-5">
        <p className="eyebrow text-green">Your next conversation</p>
        <p className="mt-3 text-[1.45rem] font-bold leading-tight tracking-tight">Tell us what you want from the day.</p>
        <p className="mt-1 text-sm text-white/65">We will line up the people worth talking to.</p>
        <button type="button" onClick={() => nav.open({ type: 'setup' })} className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-green font-semibold text-on">
          Set up my profile
          <Icon name="chevron" className="h-4 w-4" />
        </button>
      </section>
    )
  }

  const { match, person } = lead
  const open = () => nav.open({ type: 'person', id: match.personId })

  return (
    <section className="hero-panel rounded-[30px] p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="eyebrow text-green">Your next conversation</p>
        <button type="button" onClick={() => nav.setTab('people', { filter: 'matches' })} className="inline-flex items-center gap-0.5 text-xs font-semibold text-white/60">
          See all
          <Icon name="chevron" className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <button type="button" onClick={open} className="shrink-0 rounded-[1.25rem] p-[3px] ring-1 ring-white/15" style={{ background: 'linear-gradient(140deg, rgba(61,205,88,0.9), rgba(61,205,88,0.1) 60%)' }}>
          <Avatar person={person} size={88} tile />
        </button>
        <button type="button" onClick={open} className="min-w-0 flex-1 text-left">
          <span className="block text-[1.4rem] font-bold leading-tight tracking-tight">{person.fullName}</span>
          <span className="mt-0.5 line-clamp-2 text-sm leading-snug text-white/65">{person.jobTitle}</span>
          <span className="mt-2 inline-flex rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-white/85">{person.department}</span>
        </button>
        {match.gap ? null : <MatchRing value={matchPercent(match.score)} />}
      </div>

      <p className="mt-4 flex gap-2.5 rounded-2xl bg-white/[0.07] p-3 text-[15px] leading-snug text-white/90 ring-1 ring-white/10">
        <Icon name={match.gap ? 'people' : 'target'} className="mt-0.5 h-4 w-4 shrink-0 text-green" />
        {match.reason}
      </p>

      <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
        <button
          type="button"
          onClick={() => dispatch({ type: 'markMet', id: match.personId })}
          className="flex h-12 items-center justify-center gap-2 rounded-full bg-green font-bold text-on shadow-[0_10px_28px_-8px_rgba(61,205,88,0.7)]"
        >
          <Icon name="hello" className="h-5 w-5" />
          Say hello to {firstName(person.fullName)}
        </button>
        <button type="button" onClick={open} className="h-12 rounded-full bg-white/10 px-5 font-semibold text-white ring-1 ring-white/15">
          Profile
        </button>
      </div>

      {rest.length ? (
        <div className="mt-5 border-t border-white/10 pt-4">
          <p className="text-xs font-semibold text-white/55">Also worth meeting</p>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {rest.map(({ match: other, person: them }) => (
              <button key={other.personId} type="button" onClick={() => nav.open({ type: 'person', id: other.personId })} className="min-w-0 text-center">
                <Avatar person={them} size={54} className="mx-auto align-top ring-2 ring-white/15" />
                <span className="mt-1.5 block truncate text-xs font-semibold text-white">{firstName(them.fullName)}</span>
                <span className="block truncate text-[11px] font-semibold text-green tabular-nums">{other.gap ? 'New team' : `${matchPercent(other.score)}%`}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  )
}

function MatchRing({ value }: { value: number }) {
  const shown = useCountUp(value)
  return (
    <span className="relative grid h-[66px] w-[66px] shrink-0 place-items-center self-start">
      <svg viewBox="0 0 36 36" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden>
        <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="3" />
        <circle
          className="ring-in"
          cx="18"
          cy="18"
          r="15.5"
          fill="none"
          stroke="#3dcd58"
          strokeWidth="3"
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray="100"
          strokeDashoffset={100 - value}
        />
      </svg>
      <span className="text-center leading-none">
        <span className="block text-base font-extrabold tabular-nums">{shown}%</span>
        <span className="mt-0.5 block text-[9px] font-semibold uppercase tracking-wider text-white/55">match</span>
      </span>
    </span>
  )
}

function ProfileBanner({ minutes }: { minutes: number }) {
  const { me, view } = useMe()
  const nav = useNav()
  const frame = useFrame()
  if (!view) return null
  const tagline = view.canOffer ? `Bringing ${lowerFirst(view.canOffer)}` : view.lookingFor ? `Here for ${lowerFirst(view.lookingFor)}` : null
  const contacts = [view.email, view.linkedinUrl?.replace(/^https?:\/\/(www\.)?/, '')].filter((line): line is string => Boolean(line))

  return (
    <div className="relative">
      <button type="button" onClick={() => nav.setTab('me')} aria-label="Open your full profile" className="block w-full overflow-hidden rounded-[28px] bg-paper text-left">
        <span className="profile-cover block h-[7.5rem] px-4 pt-3.5">
          <span className="flex items-start justify-end gap-3">
            {contacts.length ? (
              <span className="min-w-0 text-right text-[10px] leading-snug text-white/80">
                {contacts.map((line) => (
                  <span key={line} className="block truncate">
                    {line}
                  </span>
                ))}
              </span>
            ) : null}
          </span>
          <span className="mt-2.5 block pl-[7.25rem]">
            <span className="block text-[11px] font-medium text-white/80">Hello, I’m a</span>
            <span className="block truncate text-[15px] font-extrabold leading-tight text-white">{view.jobTitle}</span>
            {tagline ? <span className="mt-0.5 block truncate text-[11px] text-white/85">{tagline}</span> : null}
          </span>
        </span>
        <span className="relative flex items-center gap-3 px-4 pb-3.5 pt-2.5">
          <span className="-mt-14 shrink-0 rounded-full bg-[#f5c542] p-[3px] shadow-[0_10px_24px_-8px_rgba(0,0,0,0.35)]">
            <Avatar person={view} size={92} className="align-top ring-[3px] ring-paper" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-medium text-muted">{greeting(minutes)},</span>
            <span className="block truncate text-[1.35rem] font-extrabold leading-tight tracking-tight">{me.fullName}</span>
            <span className="block truncate text-xs text-muted">{view.department}</span>
          </span>
          <span className="inline-flex shrink-0 items-center gap-0.5 self-end rounded-full bg-sand px-2.5 py-1.5 text-xs font-semibold">
            Profile
            <Icon name="chevron" className="h-3.5 w-3.5" />
          </span>
        </span>
      </button>
      {frame === 'phone' ? (
        <span className="absolute left-3 top-3">
          <ThemeButton className="bg-white/20 text-white ring-1 ring-white/30 backdrop-blur-md" />
        </span>
      ) : null}
    </div>
  )
}

function LiveNow({ now, next, minutes, dateLabel }: { now: AgendaItem | null; next: AgendaItem | null; minutes: number; dateLabel: string }) {
  const { state } = useStore()
  const { me } = useMe()
  const nav = useNav()
  const [open, setOpen] = useState(true)
  const focus = now ?? next
  const start = now ? toMinutes(now.time) : 0
  const end = now ? Math.max(toMinutes(now.end), start + 1) : 0
  const progress = now ? Math.min(100, Math.max(0, ((minutes - start) / (end - start)) * 100)) : 0
  const left = now ? Math.max(0, end - minutes) : 0
  const speakers = (focus?.speakerIds ?? [])
    .map((id) => presentPerson(state, me.id, id))
    .filter((person): person is NonNullable<typeof person> => Boolean(person))
  const upNext = now ? next : null

  return (
    <section>
      <div className="mb-2 flex items-end justify-between gap-3 px-1">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">Agenda</h2>
          <p className="text-xs font-medium text-muted">{dateLabel} · Times at the venue</p>
        </div>
        <button type="button" onClick={() => nav.setTab('day', { day: 'agenda' })} className="inline-flex items-center gap-0.5 pb-0.5 text-sm font-semibold text-green">
          See all
          <Icon name="chevron" className="h-4 w-4" />
        </button>
      </div>

      <div className="overflow-hidden rounded-[26px] bg-paper">
        {focus ? (
          <>
            <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} className="block w-full p-4 text-left">
              <span className="flex items-center gap-2">
                {now ? <span className="live-dot" /> : null}
                <span className={`eyebrow ${now ? 'text-green' : 'text-muted'}`}>{now ? 'Live now' : 'Coming up'}</span>
                {now ? <span className="ml-auto text-xs font-semibold text-muted tabular-nums">{left} min left</span> : null}
                <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full bg-sand transition-transform duration-300 ${now ? '' : 'ml-auto'} ${open ? 'rotate-180' : ''}`}>
                  <Icon name="down" className="h-4 w-4" />
                </span>
              </span>
              <span className="mt-2 block text-lg font-bold leading-tight tracking-tight">{focus.title}</span>
              <span className="mt-1 flex items-center gap-1.5 text-sm text-muted tabular-nums">
                <Icon name="pin" className="h-3.5 w-3.5 shrink-0" />
                {focus.room ? `${focus.room} · ` : ''}
                {focus.time} – {focus.end}
              </span>
              {now ? (
                <span className="mt-3 block h-1.5 overflow-hidden rounded-full bg-sand">
                  <span className="grow-x block h-full rounded-full bg-green" style={{ width: `${progress}%` }} />
                </span>
              ) : null}
            </button>
            {open ? (
              <div className="rise border-t border-line bg-sand/35 px-4 py-3.5">
                {focus.detail ? <p className="text-sm leading-snug text-muted">{focus.detail}</p> : null}
                <div className="mt-3 flex items-center gap-2">
                  {speakers.length ? (
                    <span className="mr-auto flex items-center gap-2">
                      <span className="flex -space-x-2">
                        {speakers.slice(0, 3).map((person) => (
                          <Avatar key={person.id} person={person} size={28} className="align-top ring-2 ring-paper" />
                        ))}
                      </span>
                      <span className="text-xs font-medium text-muted">{speakers.length === 1 ? firstName(speakers[0].fullName) : `${speakers.length} speakers`}</span>
                    </span>
                  ) : (
                    <span className="mr-auto" />
                  )}
                  <button type="button" onClick={() => nav.setTab('day', { day: 'logistics' })} className="inline-flex items-center gap-1.5 rounded-full bg-paper px-3 py-1.5 text-xs font-semibold">
                    <Icon name="pin" className="h-3.5 w-3.5 text-green" />
                    Venue info
                  </button>
                </div>
              </div>
            ) : null}
          </>
        ) : (
          <p className="p-4 text-lg font-bold tracking-tight">That’s a wrap for today.</p>
        )}
        {upNext ? (
          <button type="button" onClick={() => nav.setTab('day', { day: 'agenda' })} className="flex w-full items-center gap-3 border-t border-line px-4 py-3 text-left">
            <span className="rounded-lg bg-gold px-2 py-1 text-xs font-bold text-gold-ink tabular-nums">{upNext.time}</span>
            <span className="min-w-0 flex-1">
              <span className="block text-[11px] font-semibold text-muted">Up next</span>
              <span className="block truncate font-semibold leading-tight">{upNext.title}</span>
            </span>
            <Icon name="chevron" className="h-4 w-4 shrink-0 text-muted" />
          </button>
        ) : null}
      </div>
    </section>
  )
}

function CountUp({ value }: { value: number }) {
  return <>{useCountUp(value)}</>
}

function lowerFirst(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1)
}

function greeting(minutes: number): string {
  if (minutes < 12 * 60) return 'Good morning'
  if (minutes < 17 * 60) return 'Good afternoon'
  return 'Good evening'
}

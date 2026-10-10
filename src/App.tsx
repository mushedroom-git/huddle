import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { presentPerson } from '@/lib/logic'
import { FrameProvider, useFrame } from '@/state/frame'
import { NavProvider, useNav, type AskPane, type DayPane, type NavValue, type Overlay, type PeopleFilter, type Tab } from '@/state/nav'
import { Ask } from '@/screens/Ask'
import { Day } from '@/screens/Day'
import { Home } from '@/screens/Home'
import { Landing } from '@/screens/Landing'
import { Me } from '@/screens/Me'
import { ChallengeSheet } from '@/screens/Challenge'
import { Organizer } from '@/screens/Organizer'
import { Group } from '@/screens/Group'
import { People } from '@/screens/People'
import { CardSheet, CommitmentSheet, GraphSheet, PersonSheet, ScanSheet, SetupSheet } from '@/screens/Sheets'
import { useMe, useStore } from '@/state/store'
import { Avatar, Icon, ThemeButton } from '@/components/ui'
import { DEMO_LENSES } from '@/lib/types'

export default function App() {
  const { state } = useStore()

  if (!state.entered) return <Landing />
  if (!state.participants.length) return <EmptyRoom />
  return <Entered />
}

function EmptyRoom() {
  const { dispatch } = useStore()
  return (
    <div className="grid min-h-dvh place-items-center bg-cream px-6 text-center">
      <div>
        <p className="text-2xl font-semibold">The room is empty.</p>
        <button type="button" onClick={() => dispatch({ type: 'reset' })} className="mt-4 rounded-full bg-ink px-5 py-3 font-semibold text-cream">
          Restore the demo
        </button>
      </div>
    </div>
  )
}

function Entered() {
  const [tab, setTabState] = useState<Tab>('home')
  const [dayPane, setDayPane] = useState<DayPane>('agenda')
  const [askPane, setAskPane] = useState<AskPane>('qa')
  const [peopleFilter, setPeopleFilter] = useState<PeopleFilter>('circuit')
  const [dept, setDept] = useState<string | null>(null)
  const [overlay, setOverlay] = useState<Overlay | null>(null)

  const nav = useMemo<NavValue>(
    () => ({
      tab,
      dayPane,
      askPane,
      peopleFilter,
      dept,
      overlay,
      setTab: (next, opts) => {
        setTabState(next)
        if (opts?.filter) setPeopleFilter(opts.filter)
        if (opts && 'dept' in opts) setDept(opts.dept ?? null)
        else if (opts?.filter) setDept(null)
        if (opts?.day) setDayPane(opts.day)
        if (opts?.ask) setAskPane(opts.ask)
        setOverlay(null)
      },
      open: (next) => setOverlay(next),
      close: () => setOverlay(null),
    }),
    [tab, dayPane, askPane, peopleFilter, dept, overlay],
  )

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOverlay(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <FrameProvider>
      <NavProvider value={nav}>
        <Shell />
      </NavProvider>
    </FrameProvider>
  )
}

const TABS: { id: Tab; label: string; icon: 'home' | 'people' | 'groups' | 'calendar' | 'message' }[] = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'people', label: 'People', icon: 'people' },
  { id: 'group', label: 'Group', icon: 'groups' },
  { id: 'day', label: 'Day', icon: 'calendar' },
  { id: 'ask', label: 'Participate', icon: 'message' },
]

function Shell() {
  const frame = useFrame()
  if (frame === 'phone') return <Phone />
  return <Wide />
}

function Phone() {
  const { state, dispatch } = useStore()
  const { tab } = useNav()

  return (
    <div className="room relative mx-auto h-dvh w-full max-w-[440px] overflow-hidden text-ink">
      <div className="h-full overflow-y-auto pb-32">
        {/* Home opens on the profile banner, which carries the theme toggle, so it needs no app header. */}
        {tab === 'home' ? (
          <div style={{ paddingTop: 'env(safe-area-inset-top)' }} />
        ) : (
        <header className="sticky top-0 z-30 bg-cream/75 backdrop-blur-md" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
          <div className="flex h-14 items-center justify-between px-4">
            <button type="button" onClick={() => dispatch({ type: 'leave' })} className="flex items-center gap-2 text-left">
              <img src="/logo.png" alt="" className="h-9 w-9 rounded-[10px] object-cover" />
              <span className="text-base font-bold tracking-tight">The Huddle</span>
            </button>
            <span className="ml-auto flex items-center gap-2">
              <ThemeButton />
              <PersonButton />
            </span>
          </div>
        </header>
        )}
        <Screens />
      </div>
      <TabBar className="absolute inset-x-0 bottom-0 z-20" />
      <Overlays where="phone" />
      {state.toast ? (
        <div key={state.toast} className="absolute bottom-28 left-4 right-4 z-[60] rise rounded-2xl bg-ink px-4 py-3 text-sm font-medium text-cream shadow-lg">{state.toast}</div>
      ) : null}
    </div>
  )
}

function Wide() {
  const { state } = useStore()
  return (
    <div className="room flex h-dvh overflow-hidden text-ink">
      <Rail />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex min-h-14 shrink-0 items-center justify-between gap-4 px-6" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
          <p className="truncate text-[15px] font-semibold tracking-tight">
            The Huddle
            <span className="font-medium text-muted"> · {state.event.title}</span>
          </p>
          <span className="ml-auto flex items-center gap-2">
            <ThemeButton />
            <PersonButton />
          </span>
        </header>
        <Workspace />
      </div>
    </div>
  )
}

function Workspace() {
  const frame = useFrame()
  const { state } = useStore()
  const { profile } = useMe()
  const nav = useNav()
  const { tab, overlay } = nav
  const peopleSplit = frame !== 'phone' && tab === 'people' && overlay?.type === 'person'

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div className={`min-h-0 flex-1 ${peopleSplit ? 'grid h-full grid-cols-[minmax(320px,440px)_minmax(0,1fr)] grid-rows-[minmax(0,1fr)]' : 'h-full'}`}>
        <div className={`min-h-0 ${peopleSplit ? 'overflow-y-auto border-r border-line' : 'h-full overflow-y-auto'}`}>
          <Screens />
        </div>
        {peopleSplit ? (
          <div className="relative min-h-0 bg-cream">
            {profile.completedAt && overlay?.type === 'person' ? <PersonSheet id={overlay.id} /> : null}
          </div>
        ) : null}
      </div>
      <Overlays where="wide" />
      {state.toast ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-4 z-[60] flex justify-center px-4">
          <div key={state.toast} className="w-full max-w-md rise rounded-2xl bg-ink px-4 py-3 text-sm font-medium text-cream shadow-lg">{state.toast}</div>
        </div>
      ) : null}
    </div>
  )
}

function Screens() {
  const { tab } = useNav()
  return (
    <>
      <div key={tab} className="rise">
        {tab === 'home' ? <Home /> : null}
        {tab === 'people' ? <People /> : null}
        {tab === 'group' ? <Group /> : null}
        {tab === 'day' ? <Day /> : null}
        {tab === 'ask' ? <Ask /> : null}
        {tab === 'me' ? <Me /> : null}
      </div>
    </>
  )
}

function Rail() {
  const { dispatch } = useStore()
  const { view } = useMe()
  const nav = useNav()
  const { tab } = nav
  return (
    <nav className="flex w-[4.75rem] shrink-0 flex-col items-center bg-[#021C37] px-1 py-3 text-white/60" style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}>
      <button type="button" onClick={() => dispatch({ type: 'leave' })} aria-label="Leave the room" className="mb-2 grid h-11 w-11 place-items-center">
        <img src="/logo.png" alt="" className="h-9 w-9 rounded-[10px] object-cover" />
      </button>
      <div className="flex w-full flex-1 flex-col">
        {TABS.map((item) => {
          const active = tab === item.id
          return (
            <button key={item.id} type="button" onClick={() => nav.setTab(item.id)} className={`flex flex-col items-center gap-1 rounded-2xl py-2 text-[10px] font-semibold transition-colors ${active ? 'bg-white/[0.08] text-green' : 'text-white/60'}`}>
              <Icon name={item.icon} className="h-5 w-5" />
              {item.label}
            </button>
          )
        })}
      </div>
      <button type="button" onClick={() => nav.setTab('me')} className={`mt-auto flex flex-col items-center gap-1 rounded-2xl py-2 text-[10px] font-semibold transition-colors ${tab === 'me' ? 'bg-white/[0.08] text-green' : 'text-white/60'}`}>
        <span className="grid h-8 w-8 place-items-center">{view ? <Avatar person={view} size={26} /> : null}</span>
        Me
      </button>
    </nav>
  )
}

function TabBar({ className = '' }: { className?: string }) {
  const { view } = useMe()
  const nav = useNav()
  const frame = useFrame()
  const { tab, overlay } = nav
  const quiet = frame === 'phone' && overlay
  const items = [...TABS.map((item) => item.id), 'me' as const]
  const index = items.indexOf(tab)
  return (
    <nav className={`px-3 ${className}`} style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
      <div className="relative grid h-[4.25rem] grid-cols-6 rounded-[26px] bg-[#021C37]/95 text-white/55 shadow-[0_18px_40px_-12px_rgba(2,28,55,0.55)] ring-1 ring-white/10 backdrop-blur-xl">
        {index >= 0 && !quiet ? (
          <span
            aria-hidden
            className="absolute inset-y-1.5 left-0 w-1/6 px-1 transition-transform duration-300 ease-[cubic-bezier(0.2,0.7,0.2,1)]"
            style={{ transform: `translateX(${index * 100}%)` }}
          >
            <span className="block h-full rounded-[20px] bg-white/[0.09] ring-1 ring-white/10" />
          </span>
        ) : null}
        {TABS.map((item) => {
          const active = tab === item.id && !quiet
          return (
            <button key={item.id} type="button" onClick={() => nav.setTab(item.id)} className={`relative flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold leading-none transition-colors ${active ? 'text-green' : 'text-white/55'}`}>
              <span className="grid h-8 w-8 place-items-center">
                <Icon name={item.icon} className="h-[22px] w-[22px]" />
              </span>
              {item.label}
            </button>
          )
        })}
        <button type="button" onClick={() => nav.setTab('me')} className={`relative flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold leading-none transition-colors ${tab === 'me' && !quiet ? 'text-green' : 'text-white/55'}`}>
          <span className="grid h-8 w-8 place-items-center">{view ? <Avatar person={view} size={26} className={tab === 'me' && !quiet ? 'ring-2 ring-green' : ''} /> : null}</span>
          Me
        </button>
      </div>
    </nav>
  )
}

function PersonButton() {
  const { me, view } = useMe()
  const nav = useNav()
  return (
    <button type="button" onClick={() => nav.open({ type: 'switch' })} aria-label={`Switch person. Now ${me.fullName}.`} className="grid h-9 w-9 place-items-center">
      {view ? <Avatar person={view} size={36} /> : null}
    </button>
  )
}

function Overlays({ where }: { where: 'phone' | 'wide' }) {
  const { profile } = useMe()
  const nav = useNav()
  const { overlay, tab } = nav
  const wide = where === 'wide'
  const personInPane = wide && tab === 'people' && overlay?.type === 'person'

  const host = (node: ReactNode, kind: 'fill' | 'drawer' | 'dialog', size: 'md' | 'lg' = 'md') => {
    if (!wide) return node
    if (kind === 'fill') return <div className="absolute inset-0 z-40">{node}</div>
    if (kind === 'drawer') {
      return (
        <div className="absolute inset-0 z-40 bg-navy/40">
          <div className="absolute inset-y-0 right-0 w-[min(100%,440px)] bg-cream shadow-2xl">{node}</div>
        </div>
      )
    }
    return (
      <div className="absolute inset-0 z-40 flex justify-center bg-navy/40 p-3 md:p-8">
        <div className={`relative w-full self-stretch overflow-hidden rounded-[28px] bg-cream shadow-2xl ${size === 'lg' ? 'max-w-3xl' : 'max-w-md'}`}>{node}</div>
      </div>
    )
  }

  return (
    <>
      {!profile.completedAt ? host(<SetupSheet required />, 'fill') : null}
      {profile.completedAt && overlay?.type === 'person' && !personInPane ? host(<PersonSheet id={overlay.id} />, 'drawer') : null}
      {profile.completedAt && overlay?.type === 'card' ? host(<CardSheet />, 'drawer') : null}
      {profile.completedAt && overlay?.type === 'scan' ? host(<ScanSheet />, 'dialog', 'md') : null}
      {profile.completedAt && overlay?.type === 'setup' ? host(<SetupSheet focus={overlay.focus} />, 'drawer') : null}
      {profile.completedAt && overlay?.type === 'organizer' ? host(<Organizer />, 'dialog', 'lg') : null}
      {profile.completedAt && overlay?.type === 'graph' ? host(<GraphSheet />, 'fill') : null}
      {profile.completedAt && overlay?.type === 'challenge' ? host(<ChallengeSheet />, 'dialog', 'lg') : null}
      {profile.completedAt && overlay?.type === 'commitment' ? host(<CommitmentSheet />, 'drawer') : null}
      {overlay?.type === 'switch' ? (
        wide ? (
          <>
            <button type="button" aria-label="Close" className="absolute inset-0 z-40" onClick={() => nav.close()} />
            <SwitchSheet menu onClose={() => nav.close()} />
          </>
        ) : (
          <SwitchSheet onClose={() => nav.close()} />
        )
      ) : null}
    </>
  )
}

function SwitchSheet({ onClose, menu = false }: { onClose: () => void; menu?: boolean }) {
  const { state, dispatch } = useStore()
  const featured = DEMO_LENSES.map((id) => state.participants.find((person) => person.id === id)).filter((person): person is NonNullable<typeof person> => Boolean(person))
  const extras = state.participants.filter((person) => !person.isSample)
  const list = (
    <>
      <div className="space-y-1">
          {featured.map((person) => {
            const view = presentPerson(state, person.id, person.id)
            const active = person.id === state.currentUserId
            return (
              <button
                key={person.id}
                type="button"
                onClick={() => {
                  dispatch({ type: 'switch', id: person.id })
                  onClose()
                }}
                className={`flex w-full items-center gap-3 rounded-2xl px-2 py-2 text-left ${active ? 'bg-paper' : ''}`}
              >
                {view ? <Avatar person={view} size={40} /> : null}
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">{person.fullName}</span>
                  <span className="block text-sm text-muted">
                    {person.department}
                    {person.isOrganizer ? ' · Organizer' : ''}
                  </span>
                </span>
                {active ? (
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold">
                    <span className="h-1.5 w-1.5 rounded-full bg-green" />
                    Now
                  </span>
                ) : null}
              </button>
            )
          })}
          {extras.map((person) => (
            <button
              key={person.id}
              type="button"
              onClick={() => {
                dispatch({ type: 'switch', id: person.id })
                onClose()
              }}
              className="flex w-full items-center justify-between rounded-2xl px-2 py-3 text-left"
            >
              <span>{person.fullName}</span>
              <span className="text-sm text-muted">{person.department}</span>
            </button>
          ))}
      </div>
      <button type="button" onClick={() => dispatch({ type: 'reset' })} className="mt-4 w-full py-2 text-sm text-muted">
        Reset demo
      </button>
    </>
  )
  if (menu) {
    return (
      <div className="absolute right-4 top-2 z-50 max-h-[min(70dvh,32rem)] w-[22rem] overflow-y-auto rounded-3xl bg-cream p-3 shadow-xl ring-1 ring-line" onClick={(event) => event.stopPropagation()}>
        {list}
      </div>
    )
  }
  return (
    <div className="fade-in absolute inset-0 z-50 flex items-end bg-navy/40" onClick={onClose}>
      <div className="max-h-[80%] w-full overflow-y-auto rounded-t-[28px] bg-cream px-4 pb-8 pt-3" onClick={(event) => event.stopPropagation()}>
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-line" />
        {list}
      </div>
    </div>
  )
}

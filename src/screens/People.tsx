import { useEffect, useState } from 'react'
import { NetworkGraph } from '@/components/graph'
import { firstName, matchesQuery, matchPercent, presentPerson } from '@/lib/logic'
import { useFrame } from '@/state/frame'
import { useNav, type PeopleFilter } from '@/state/nav'
import { useMe, useStore } from '@/state/store'
import { Avatar, Icon, Segmented } from '@/components/ui'

const TABS = [
  { id: 'circuit' as const, label: 'My Circuit' },
  { id: 'all' as const, label: 'Everyone' },
  { id: 'matches' as const, label: 'Suggested' },
]

type Chip = 'any' | 'met' | 'unmet' | 'connected'
type CircuitView = 'network' | 'list'

export function People() {
  const { state, dispatch } = useStore()
  const { me, matches, met, connected } = useMe()
  const nav = useNav()
  const frame = useFrame()
  const [search, setSearch] = useState('')
  const [chip, setChip] = useState<Chip>('any')
  const [circuitView, setCircuitView] = useState<CircuitView>('network')
  const filterKey = `${nav.peopleFilter}:${nav.dept ?? ''}`
  const tab: (typeof TABS)[number]['id'] = nav.peopleFilter === 'matches' ? 'matches' : nav.peopleFilter === 'all' ? 'all' : 'circuit'
  const activeChip: Chip = nav.peopleFilter === 'unmet' && chip === 'any' ? 'unmet' : chip

  useEffect(() => {
    setSearch('')
  }, [filterKey])

  const matchById = new Map(matches.map((item) => [item.personId, item]))
  const metSet = new Set(met)
  const connectedSet = new Set(connected)
  let people = state.participants.filter((person) => person.id !== me.id)
  if (tab === 'matches') people = people.filter((person) => matchById.has(person.id))
  if (tab === 'circuit' && activeChip === 'met') people = people.filter((person) => metSet.has(person.id))
  if (tab === 'circuit' && activeChip === 'unmet') people = people.filter((person) => !metSet.has(person.id))
  if (tab === 'circuit' && activeChip === 'connected') people = people.filter((person) => connectedSet.has(person.id))
  if (nav.dept) people = people.filter((person) => person.department === nav.dept)
  if (search.trim()) people = people.filter((person) => matchesQuery(state, me.id, person.id, search))
  people.sort((a, b) => {
    if (tab === 'matches') return matches.findIndex((item) => item.personId === a.id) - matches.findIndex((item) => item.personId === b.id)
    return a.fullName.localeCompare(b.fullName)
  })

  const others = state.participants.filter((person) => person.id !== me.id)
  const metCount = others.filter((person) => metSet.has(person.id)).length
  const unmetCount = others.length - metCount
  const connectedCount = others.filter((person) => connectedSet.has(person.id)).length
  const recentIds = state.connections
    .filter((link) => link.participantA === me.id || link.participantB === me.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((link) => (link.participantA === me.id ? link.participantB : link.participantA))
    .filter((id, index, all) => all.indexOf(id) === index)
    .slice(0, 8)
  const showRoster = tab !== 'circuit' || circuitView === 'list' || search.trim().length > 0 || activeChip !== 'any'
  const board = frame !== 'phone' && nav.overlay?.type !== 'person'

  return (
    <div className={board ? 'grid grid-cols-[minmax(320px,440px)_minmax(0,1fr)] items-start gap-6 px-6 py-2' : 'px-4'}>
    <div>
      <div className="pb-1">
        <h1 className="text-[2rem] font-extrabold leading-tight tracking-tight">People</h1>
        <p className="mt-0.5 text-sm text-muted">Meet, connect, and grow together.</p>
      </div>
      <div
        className="sticky z-20 -mx-4 bg-cream/95 px-4 pb-3 backdrop-blur-md"
        style={{ top: frame === 'phone' ? 'calc(3.5rem + env(safe-area-inset-top))' : 0 }}
      >
        <label className="mt-3 flex items-center gap-2 rounded-full bg-paper px-4 py-3 ring-1 ring-line">
          <Icon name="search" className="h-4 w-4 text-muted" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, role, or company"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted/70"
            aria-label="Search by name, role, or company"
          />
        </label>
        <div className="mt-3 flex gap-2">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => nav.setTab('people', { filter: item.id, dept: null })}
              className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${tab === item.id ? 'bg-ink text-cream' : 'bg-paper text-ink'}`}
            >
              {item.label}
            </button>
          ))}
        </div>
        {tab === 'circuit' ? (
          <div className="mt-3">
            <Segmented
              options={[
                { id: 'network', label: 'Network' },
                { id: 'list', label: 'List' },
              ]}
              value={circuitView}
              onChange={setCircuitView}
            />
          </div>
        ) : null}
        {nav.dept ? (
          <button type="button" onClick={() => nav.setTab('people', { dept: null })} className="mt-2 rounded-full bg-gold px-3 py-1 text-sm font-medium text-gold-ink">
            {nav.dept} ×
          </button>
        ) : null}
      </div>

      {!board && tab === 'circuit' && circuitView === 'network' && !search.trim() ? (
        <div className="mb-4 overflow-hidden rounded-[24px] bg-paper ring-1 ring-line">
          <NetworkGraph mode="personal" tone="light" className="h-72 w-full" onPick={(id) => id !== me.id && nav.open({ type: 'person', id })} />
        </div>
      ) : null}

      {tab === 'circuit' ? (
        <div className="mb-4 flex gap-2 overflow-x-auto">
          <Chip on={activeChip === 'met'} label={`Met (${metCount})`} onClick={() => setChip(activeChip === 'met' ? 'any' : 'met')} />
          <Chip on={activeChip === 'unmet'} label={`Not yet (${unmetCount})`} onClick={() => setChip(activeChip === 'unmet' ? 'any' : 'unmet')} />
          <Chip on={activeChip === 'connected'} label={`Connection (${connectedCount})`} onClick={() => setChip(activeChip === 'connected' ? 'any' : 'connected')} />
        </div>
      ) : null}

      {tab === 'circuit' && recentIds.length ? (
        <section className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">Recent connections</h2>
            <span className="text-sm text-muted">{recentIds.length}</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {recentIds.map((id) => {
              const person = presentPerson(state, me.id, id)
              if (!person) return null
              return (
                <button key={id} type="button" onClick={() => nav.open({ type: 'person', id })} className="w-16 shrink-0 text-center">
                  <Avatar person={person} size={52} className="mx-auto align-top" />
                  <span className="mt-1 block truncate text-xs font-semibold">{firstName(person.fullName)}</span>
                </button>
              )
            })}
          </div>
        </section>
      ) : null}

      {showRoster ? (
        <div className="stagger mt-1 space-y-2">
          {people.map((person) => {
            const view = presentPerson(state, me.id, person.id)
            if (!view) return null
            const match = matchById.get(person.id)
            const percent = match ? matchPercent(match.score) : 0
            const selected = nav.overlay?.type === 'person' && nav.overlay.id === person.id
            return (
              <div key={person.id} className={`flex items-center gap-3 rounded-2xl bg-paper p-3 ${selected ? 'ring-2 ring-green' : ''}`}>
                <button type="button" onClick={() => nav.open({ type: 'person', id: person.id })} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                  <Avatar person={view} size={48} />
                  <span className="min-w-0">
                    <span className="flex items-center gap-2">
                      <span className="truncate font-semibold leading-tight">{view.fullName}</span>
                      {tab === 'matches' && percent ? <span className="shrink-0 rounded-full bg-sand px-2 py-0.5 text-[11px] font-semibold">{percent}% match</span> : null}
                    </span>
                    <span className="mt-0.5 block truncate text-sm text-muted">{view.jobTitle}</span>
                    <span className="block truncate text-xs text-muted">{view.department}</span>
                    {tab === 'matches' && match ? <span className="mt-0.5 block text-sm leading-snug">{match.reason}</span> : null}
                  </span>
                </button>
                <Hello met={view.isMet} connected={view.isConnected} onHello={() => dispatch({ type: 'markMet', id: person.id })} />
              </div>
            )
          })}
          {!people.length ? <p className="py-8 text-center text-sm text-muted">{emptyCopy(tab, search, activeChip)}</p> : null}
        </div>
      ) : null}
    </div>
    {board ? (
      <div className="sticky top-4 overflow-hidden rounded-[28px] bg-paper ring-1 ring-line">
        <div className="flex items-center justify-between px-4 pt-4">
          <h2 className="font-semibold">Your circuit</h2>
          <span className="text-sm text-muted">{others.length} people</span>
        </div>
        <NetworkGraph mode="personal" tone="light" className="h-[min(68vh,640px)] w-full" onPick={(id) => id !== me.id && nav.open({ type: 'person', id })} />
      </div>
    ) : null}
    </div>
  )
}

function Chip({ on, label, onClick }: { on: boolean; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold ${on ? 'bg-green text-ink' : 'bg-paper text-ink'}`}>
      {label}
    </button>
  )
}

function Hello({ met, connected, onHello }: { met: boolean; connected: boolean; onHello: () => void }) {
  if (connected) {
    return (
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-ink px-2.5 py-1.5 text-sm font-semibold text-cream">
        <span className="h-1.5 w-1.5 rounded-full bg-green" />
        Connected
      </span>
    )
  }
  if (met) {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1.5 text-sm font-semibold text-muted ring-1 ring-line">
        <Icon name="check" className="h-4 w-4" />
        Said hello
      </span>
    )
  }
  return (
    <button type="button" onClick={onHello} className="inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1.5 text-sm font-semibold ring-1 ring-green">
      <Icon name="hello" className="h-4 w-4" />
      Say hello
    </button>
  )
}

function emptyCopy(filter: PeopleFilter | 'circuit', search: string, chip: Chip): string {
  if (search.trim()) return 'No one matches that.'
  if (filter === 'matches') return 'Add what you want from the day, and suggestions show up here.'
  if (chip === 'unmet') return 'You have said hello to everyone here.'
  if (chip === 'met') return 'No one in this circle yet.'
  if (chip === 'connected') return 'No connections yet.'
  return 'No one here.'
}

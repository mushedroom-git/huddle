import { useEffect, useState } from 'react'
import { NetworkGraph } from '@/components/graph'
import { matchesQuery, matchPercent, presentPerson } from '@/lib/logic'
import { useFrame } from '@/state/frame'
import { useNav } from '@/state/nav'
import { useMe, useStore } from '@/state/store'
import { Avatar, Icon, Segmented } from '@/components/ui'

type Filter = 'connected' | 'matches' | 'all'

export function People() {
  const { state, dispatch } = useStore()
  const { me, matches, connected } = useMe()
  const nav = useNav()
  const frame = useFrame()
  const [search, setSearch] = useState('')
  const filterKey = `${nav.peopleFilter}:${nav.dept ?? ''}`
  const filter: Filter = nav.peopleFilter === 'matches' ? 'matches' : nav.peopleFilter === 'circuit' ? 'connected' : 'all'

  useEffect(() => {
    setSearch('')
  }, [filterKey])

  const matchById = new Map(matches.map((item) => [item.personId, item]))
  const connectedSet = new Set(connected)
  const others = state.participants.filter((person) => person.id !== me.id)
  const connectedCount = others.filter((person) => connectedSet.has(person.id)).length
  let people = others
  if (filter === 'connected') people = people.filter((person) => connectedSet.has(person.id))
  if (filter === 'matches') people = people.filter((person) => matchById.has(person.id))
  if (nav.dept) people = people.filter((person) => person.department === nav.dept)
  if (search.trim()) people = people.filter((person) => matchesQuery(state, me.id, person.id, search))
  people.sort((a, b) => {
    if (filter === 'matches') return matches.findIndex((item) => item.personId === a.id) - matches.findIndex((item) => item.personId === b.id)
    return a.fullName.localeCompare(b.fullName)
  })

  const board = frame !== 'phone' && nav.overlay?.type !== 'person'
  const filters: { id: Filter; label: string }[] = [
    { id: 'connected', label: `Connected ${connectedCount}` },
    { id: 'matches', label: `Suggested ${matches.length}` },
    { id: 'all', label: `Everyone ${others.length}` },
  ]

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
        {nav.dept ? (
          <button type="button" onClick={() => nav.setTab('people', { dept: null })} className="mt-2 rounded-full bg-gold px-3 py-1 text-sm font-medium text-gold-ink">
            {nav.dept} ×
          </button>
        ) : null}
      </div>

      {!board && !search.trim() ? (
        <div className="mb-4 overflow-hidden rounded-[24px] bg-paper">
          <div className="flex items-center justify-between px-4 pt-3.5">
            <h2 className="font-bold">Your circuit</h2>
            <span className="text-xs font-medium text-muted">Tap a face to open</span>
          </div>
          <NetworkGraph mode="personal" tone="light" className="h-72 w-full" onPick={(id) => id !== me.id && nav.open({ type: 'person', id })} />
        </div>
      ) : null}

      <div className="mb-3">
        <Segmented options={filters} value={filter} onChange={(id) => nav.setTab('people', { filter: id === 'connected' ? 'circuit' : id, dept: null })} />
      </div>

      <div key={filter} className="stagger space-y-2">
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
                  <span className="block truncate font-semibold leading-tight">{view.fullName}</span>
                  <span className="mt-0.5 block truncate text-sm text-muted">{view.jobTitle}</span>
                  <span className="flex items-center gap-2 text-xs text-muted">
                    <span className="truncate">{view.department}</span>
                    {filter === 'matches' && percent ? <span className="shrink-0 rounded-full bg-green/15 px-2 py-0.5 text-[11px] font-bold text-green tabular-nums">{percent}% match</span> : null}
                  </span>
                  {filter === 'matches' && match ? <span className="mt-0.5 block text-sm leading-snug">{match.reason}</span> : null}
                </span>
              </button>
              <Hello met={view.isMet} connected={view.isConnected} onHello={() => dispatch({ type: 'markMet', id: person.id })} />
            </div>
          )
        })}
        {!people.length ? <p className="py-8 text-center text-sm text-muted">{emptyCopy(filter, search)}</p> : null}
      </div>
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

function emptyCopy(filter: Filter, search: string): string {
  if (search.trim()) return 'No one matches that.'
  if (filter === 'matches') return 'Add what you want from the day, and suggestions show up here.'
  if (filter === 'connected') return 'No connections yet. Say hello to someone, or scan their card.'
  return 'No one here.'
}

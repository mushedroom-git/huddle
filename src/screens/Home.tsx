import { challengeFor, placeLabel } from '@/lib/challenge'
import { agendaPhases, clockMinutes, firstName, presentPerson, spotlight } from '@/lib/logic'
import { RoundTable } from '@/components/round-table'
import { useFrame } from '@/state/frame'
import { useNav } from '@/state/nav'
import { useMe, useStore } from '@/state/store'
import { Avatar, Icon } from '@/components/ui'

export function Home() {
  const { state, dispatch } = useStore()
  const { me, matches, view } = useMe()
  const nav = useNav()
  const frame = useFrame()
  const minutes = clockMinutes(state.event)
  const phases = agendaPhases(state.event.agenda, minutes)
  const { now, next } = spotlight(state.event.agenda, phases)
  const seen = new Set(state.dismissals.filter((item) => item.userId === state.currentUserId).map((item) => item.announcementId))
  const note = state.announcements.find((item) => item.active && !seen.has(item.id))
  const board = challengeFor(state, me.id)
  const people = matches.slice(0, 6)
  const faces = people
    .map((match) => presentPerson(state, me.id, match.personId))
    .filter((person): person is NonNullable<typeof person> => Boolean(person))
    .slice(0, 2)

  const wide = frame !== 'phone'

  return (
    <div className={wide ? 'grid grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)] items-start gap-8 px-8 py-6' : 'space-y-4 px-4 pt-2'}>
      <div className="space-y-4">
      <div>
        <p className="text-sm text-muted">{greeting(minutes)},</p>
        <button type="button" onClick={() => nav.setTab('me')} className="text-[1.7rem] font-semibold tracking-tight">
          {view ? firstName(me.fullName) : 'there'} <span aria-hidden>👋</span>
        </button>
        <p className="mt-1 text-sm text-muted">Ready for a day of new perspectives?</p>
      </div>

      <button type="button" onClick={() => nav.open({ type: 'challenge' })} className="w-full rounded-[24px] bg-paper p-4 text-left ring-2 ring-green">
        <span className="flex items-start justify-between gap-3">
          <span className="flex items-center gap-2 text-sm font-semibold">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-green/15 text-green">
              <Icon name="star" className="h-4 w-4" filled />
            </span>
            One Day Challenge
          </span>
          <span className="flex -space-x-2">
            {faces.map((person) => (
              <Avatar key={person.id} person={person} size={32} className="ring-2 ring-paper" />
            ))}
          </span>
        </span>
        <span className="mt-3 block text-[2rem] font-semibold leading-none tracking-tight">{placeLabel(board.rank)}</span>
        <span className="mt-3 flex items-center gap-3">
          <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-sand">
            <span className="block h-full rounded-full bg-green" style={{ width: `${Math.min(100, (board.earned / board.possible) * 100)}%` }} />
          </span>
          <span className="shrink-0 text-sm font-semibold text-green">
            {board.earned} / {board.possible}
          </span>
        </span>
      </button>

      {note ? (
        <div className="flex items-start gap-3 rounded-2xl bg-paper p-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-warm/10 text-warm">
            <Icon name="bus" className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="inline-flex rounded-full bg-warm px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">Live</span>
            <span className="mt-1 block font-semibold leading-snug">{note.text}</span>
            {/bus/i.test(note.text) ? (
              <span className="mt-0.5 block text-xs leading-snug text-muted">
                {state.event.logistics.find((item) => item.icon === 'bus')?.body.split('.')[0]}.
              </span>
            ) : null}
          </span>
          <button type="button" aria-label="Dismiss announcement" onClick={() => dispatch({ type: 'dismissAnnouncement', id: note.id })} className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-sand">
            <Icon name="close" className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Today’s agenda</h2>
          <button type="button" onClick={() => nav.setTab('day', { day: 'agenda' })} className="text-sm font-semibold text-green">
            See all
          </button>
        </div>
        <div className="space-y-2">
          {[now, next].filter((item): item is NonNullable<typeof item> => Boolean(item)).map((item) => {
            const live = item.id === now?.id
            return (
              <button key={item.id} type="button" onClick={() => nav.setTab('day', { day: 'agenda' })} className="flex w-full items-center gap-3 rounded-2xl bg-paper p-3 text-left">
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${live ? 'bg-green/15 text-green' : 'bg-gold text-gold-ink'}`}>
                  <Icon name={agendaIcon(item.kind)} className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${live ? 'bg-green text-ink' : 'bg-gold text-gold-ink'}`}>
                      {live ? 'Now' : 'Next'}
                    </span>
                    <span className="text-xs text-muted">{item.time} – {item.end}</span>
                  </span>
                  <span className="mt-1 block font-semibold leading-tight">{item.title}</span>
                  {item.detail ? <span className="mt-0.5 block truncate text-xs text-muted">{item.detail}</span> : null}
                </span>
              </button>
            )
          })}
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button type="button" onClick={() => nav.setTab('day', { day: 'logistics' })} className="rounded-2xl bg-paper p-3 text-left">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-green/15 text-green">
              <Icon name="pin" className="h-5 w-5" />
            </span>
            <span className="mt-2 block text-sm font-semibold">Venue & logistics</span>
            <span className="mt-0.5 block text-xs text-muted">Everything you need to know</span>
          </button>
          <button type="button" onClick={() => nav.setTab('day', { day: 'agenda' })} className="rounded-2xl bg-paper p-3 text-left">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-green/15 text-green">
              <Icon name="calendar" className="h-5 w-5" />
            </span>
            <span className="mt-2 block text-sm font-semibold">Full agenda</span>
            <span className="mt-0.5 block text-xs text-muted">The complete schedule</span>
          </button>
        </div>
      </section>

      </div>
      <div className="space-y-4">
      {wide ? (
        <>
          <div className="grid h-80 place-items-center overflow-hidden rounded-[28px] bg-paper">
            <RoundTable className="h-full w-full" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Connections', value: state.connections.length, icon: 'people' as const, onClick: () => nav.open({ type: 'graph' }) },
              { label: 'Questions', value: state.questions.filter((question) => !question.isHidden).length, icon: 'message' as const, onClick: () => nav.setTab('ask') },
              { label: 'Commitments', value: state.commitments.length, icon: 'leaf' as const, onClick: () => nav.setTab('ask', { ask: 'wall' }) },
            ].map((stat) => (
              <button key={stat.label} type="button" onClick={stat.onClick} className="rounded-2xl bg-paper p-3 text-left">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-green/15 text-green">
                  <Icon name={stat.icon} className="h-4 w-4" />
                </span>
                <span className="mt-2 block text-2xl font-semibold leading-none">{stat.value}</span>
                <span className="mt-1 block text-xs text-muted">{stat.label}</span>
              </button>
            ))}
          </div>
        </>
      ) : null}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">People you might want to meet</h2>
          <button type="button" onClick={() => nav.setTab('people', { filter: 'matches' })} className="text-sm font-semibold text-green">
            See all
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {people.map((match) => {
            const person = presentPerson(state, me.id, match.personId)
            if (!person) return null
            return (
              <button key={match.personId} type="button" onClick={() => nav.open({ type: 'person', id: match.personId })} className="w-16 shrink-0 text-center">
                <Avatar person={person} size={56} className="mx-auto ring-2 ring-green" />
                <span className="mt-1 block truncate text-xs font-semibold">{firstName(person.fullName)}</span>
              </button>
            )
          })}
        </div>
        {!people.length ? <p className="text-sm text-muted">Tell us what you want from the day, and suggestions will show up here.</p> : null}
      </section>
      </div>
    </div>
  )
}

function agendaIcon(kind: string): 'people' | 'food' | 'message' | 'clipboard' {
  if (kind === 'break') return 'people'
  if (kind === 'food') return 'food'
  if (kind === 'qa') return 'message'
  return 'clipboard'
}

function greeting(minutes: number): string {
  if (minutes < 12 * 60) return 'Good morning'
  if (minutes < 17 * 60) return 'Good afternoon'
  return 'Good evening'
}

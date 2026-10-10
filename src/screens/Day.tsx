import { useEffect } from 'react'
import { agendaPhases, clockMinutes, presentPerson } from '@/lib/logic'
import { useFrame } from '@/state/frame'
import { useNav, type DayPane } from '@/state/nav'
import { useMe, useStore } from '@/state/store'
import { Avatar, Icon, Segmented } from '@/components/ui'
import { PhotoWall } from './Moments'
import type { LogisticsIcon } from '@/lib/types'

const PANES: { id: Extract<DayPane, 'logistics' | 'agenda'>; label: string }[] = [
  { id: 'logistics', label: 'Getting here' },
  { id: 'agenda', label: 'Full agenda' },
]

export function Day() {
  const { state, dispatch } = useStore()
  const nav = useNav()
  const frame = useFrame()
  const { me } = useMe()
  const phases = agendaPhases(state.event.agenda, clockMinutes(state.event))
  const venue = state.event.logistics.find((item) => item.title === 'Venue')
  const maps = venue ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.body)}` : null
  const agenda = state.event.agenda

  useEffect(() => {
    if (nav.dayPane === 'wall') nav.setTab('ask', { ask: 'wall' })
    else if (nav.dayPane === 'feedback') nav.setTab('ask', { ask: 'feedback' })
  }, [nav])

  const menu: (typeof PANES)[number]['id'] = nav.dayPane === 'logistics' ? 'logistics' : 'agenda'

  return (
    <div className={frame === 'phone' ? 'px-4 pb-4' : 'mx-auto w-full max-w-5xl px-8 pb-8'}>
      <div className="pb-3">
        <h1 className="text-[2rem] font-extrabold leading-tight tracking-tight">Today</h1>
        <p className="mt-0.5 text-sm text-muted">{dayLine(state.event.title, state.event.dateLabel)}</p>
        {state.event.draft ? <p className="mt-1 text-xs text-muted">Draft · organizers can still edit this.</p> : null}
      </div>
      <div
        className="sticky z-20 -mx-4 bg-cream/95 px-4 pb-3 backdrop-blur-md md:-mx-8 md:px-8"
        style={{ top: frame === 'phone' ? 'calc(3.5rem + env(safe-area-inset-top))' : 0 }}
      >
        <Segmented options={PANES} value={menu} onChange={(day) => nav.setTab('day', { day })} />
      </div>

      {nav.dayPane === 'photos' ? (
        <div className="mt-2">
          <button type="button" onClick={() => nav.setTab('day', { day: 'agenda' })} className="mb-3 text-sm font-semibold">
            Back to the agenda
          </button>
          <PhotoWall />
        </div>
      ) : null}

      {menu === 'agenda' && nav.dayPane !== 'photos' ? (
        <div className="mt-1">
          <div className="premium-card mb-4 rounded-[24px] px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-green">One-day programme</p>
            <p className="mt-1 text-sm text-muted">Everything for {shortDate(state.event.dateLabel)}, from arrival to close.</p>
          </div>
          {agenda.length ? (
            <ol className="stagger">
              {agenda.map((item, index) => {
                const phase = phases.get(item.id)
                const live = phase === 'now'
                const past = phase === 'past'
                const last = index === agenda.length - 1
                const speakers = (item.speakerIds ?? [])
                  .map((id) => presentPerson(state, me.id, id))
                  .filter((person): person is NonNullable<typeof person> => Boolean(person))
                return (
                  <li key={item.id} className="grid grid-cols-[3.1rem_1.1rem_minmax(0,1fr)] gap-2">
                    <div className="pt-3 text-right text-[11px] leading-tight tabular-nums text-muted">
                      <p>{item.time}</p>
                      <p>{item.end}</p>
                    </div>
                    <div className="relative">
                      <span className={`absolute left-1/2 w-px -translate-x-1/2 bg-line ${index === 0 ? 'top-5' : 'top-0'} ${last ? 'h-5' : 'bottom-0'}`} />
                      {live ? (
                        <span className="absolute left-1/2 top-[1.1rem] grid -translate-x-1/2 place-items-center">
                          <span className="live-dot h-3! w-3! ring-4 ring-green/20" />
                        </span>
                      ) : (
                        <span className={`absolute left-1/2 top-[1.15rem] h-2.5 w-2.5 -translate-x-1/2 rounded-full ${past ? 'bg-line' : 'bg-cream ring-2 ring-line'}`} />
                      )}
                    </div>
                    <article className={`mb-3 rounded-[20px] bg-paper p-3.5 transition-opacity md:p-4 ${live ? 'ring-2 ring-green' : ''} ${past ? 'opacity-60' : ''}`}>
                      <div className="flex items-start justify-between gap-2">
                        <span className="min-w-0">
                          <span className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold leading-tight">{item.title}</h3>
                            {live ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-green/15 px-2 py-0.5 text-[10px] font-bold uppercase text-green">
                                <span className="live-dot h-1.5! w-1.5!" />
                                Live
                              </span>
                            ) : null}
                            {phase === 'next' ? <span className="rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold uppercase text-gold-ink">Up next</span> : null}
                          </span>
                          {item.detail ? <p className="mt-1 text-sm leading-snug text-muted">{item.detail}</p> : null}
                          {item.room ? <p className="mt-1 text-xs font-medium text-muted">{item.room}</p> : null}
                        </span>
                        {speakers.length ? (
                          <span className="flex shrink-0 -space-x-2">
                            {speakers.slice(0, 3).map((person) => (
                              <Avatar key={person.id} person={person} size={28} className="ring-2 ring-paper" />
                            ))}
                          </span>
                        ) : null}
                      </div>
                      {item.kind === 'break' ? (
                        <button type="button" onClick={() => nav.setTab('people', { filter: 'matches' })} className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-green px-3 py-1.5 text-sm font-semibold text-ink">
                          <Icon name="people" className="h-4 w-4" />
                          Find matches
                        </button>
                      ) : null}
                      {item.kind === 'qa' ? (
                        <button type="button" onClick={() => nav.setTab('ask', { ask: 'qa' })} className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-green px-3 py-1.5 text-sm font-semibold text-ink">
                          <Icon name="message" className="h-4 w-4" />
                          Ask a question
                        </button>
                      ) : null}
                      {/commitment/i.test(item.title) ? (
                        <button type="button" onClick={() => nav.setTab('ask', { ask: 'wall' })} className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-green px-3 py-1.5 text-sm font-semibold text-ink">
                          <Icon name="leaf" className="h-4 w-4" />
                          Open commitments
                        </button>
                      ) : null}
                      {/feedback/i.test(item.title) ? (
                        <button type="button" onClick={() => nav.setTab('ask', { ask: 'feedback' })} className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-green px-3 py-1.5 text-sm font-semibold text-ink">
                          <Icon name="star" className="h-4 w-4" />
                          Rate the day
                        </button>
                      ) : null}
                    </article>
                  </li>
                )
              })}
            </ol>
          ) : (
            <p className="rounded-2xl bg-paper px-4 py-8 text-center text-sm text-muted">Nothing on the programme yet.</p>
          )}
        </div>
      ) : null}

      {menu === 'logistics' && nav.dayPane !== 'photos' ? (
        <div className="mt-2 space-y-4">
          <article className="relative overflow-hidden rounded-[24px] bg-navy">
            <img src="/scenes/room.jpg" alt="" className="h-48 w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4 text-cream">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">Venue</p>
              <h2 className="mt-1 text-lg font-semibold">{venue?.body ?? state.event.title}</h2>
              {maps ? (
                <a href={maps} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-green">
                  <Icon name="pin" className="h-4 w-4" />
                  Directions
                </a>
              ) : null}
            </div>
          </article>
          <div className="grid grid-cols-4 gap-2 rounded-[24px] bg-paper p-2">
            {state.event.logistics
              .filter((item) => ['Directions', 'Transport', 'Wi-Fi', 'Dress code'].includes(item.title) || ['pin', 'bus', 'wifi', 'shirt'].includes(item.icon))
              .slice(0, 4)
              .map((item) => (
                <a
                  key={item.id}
                  href={item.title === 'Venue' && maps ? maps : `#log-${item.id}`}
                  className="grid place-items-center gap-1 rounded-2xl px-1 py-2 text-center text-green"
                >
                  <Icon name={item.icon as LogisticsIcon} className="h-5 w-5" />
                  <span className="text-[11px] font-semibold leading-tight text-ink">{item.title === 'Venue' ? 'Directions' : item.title}</span>
                </a>
              ))}
          </div>
          <div className="space-y-3">
            {state.event.logistics.map((item) => (
              <article key={item.id} id={`log-${item.id}`} className="flex gap-3 rounded-[24px] bg-paper p-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-green/15 text-green">
                  <Icon name={item.icon as LogisticsIcon} className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold">{item.title}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-muted">{item.body}</span>
                  {item.title === 'Venue' && maps ? (
                    <a href={maps} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 rounded-full bg-sand px-3 py-1.5 text-sm font-semibold">
                      Open in Maps
                      <Icon name="back" className="h-3.5 w-3.5 rotate-180 text-muted" />
                    </a>
                  ) : null}
                  {item.extra ? (
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(item.extra).then(
                          () => dispatch({ type: 'toast', text: 'Password copied' }),
                          () => dispatch({ type: 'toast', text: item.extra }),
                        )
                      }}
                      className="mt-2 rounded-full bg-sand px-3 py-1.5 text-sm font-semibold"
                    >
                      {item.extra}
                    </button>
                  ) : null}
                </span>
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function dayLine(title: string, dateLabel: string): string {
  const name = title.replace(/^GSC\s+/i, '')
  const match = dateLabel.match(/(\d{1,2})\s+([A-Za-z]+)/)
  const date = match ? `${match[1]} ${match[2].slice(0, 3)}` : dateLabel
  return `${name} · ${date}`
}

function shortDate(dateLabel: string): string {
  const match = dateLabel.match(/(\d{1,2})\s+([A-Za-z]+)/)
  return match ? `${match[1]} ${match[2].slice(0, 3)}` : dateLabel
}

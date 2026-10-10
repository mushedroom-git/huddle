import { RoundTable } from '@/components/round-table'
import { Icon, ThemeButton } from '@/components/ui'
import { useStore } from '@/state/store'
import type { EventConfig } from '@/lib/types'

export function Landing() {
  const { state, dispatch } = useStore()
  const event = state.event
  const leaders = state.participants.length

  return (
    <div className="room flex min-h-dvh flex-col px-5 py-6 text-ink sm:px-8 md:h-dvh md:overflow-hidden md:px-10 md:py-8 lg:px-12">
      <header className="flex items-start justify-between gap-4">
        <Brand title={event.title} />
        <div className="flex items-center gap-4 text-sm text-muted">
          <span className="hidden items-center gap-4 sm:flex">
            <Meta icon="calendar" label={longDate(event.dateLabel)} />
            <Meta icon="pin" label={place(event)} />
          </span>
          <ThemeButton />
        </div>
      </header>

      <div className="grid min-h-0 flex-1 items-center gap-6 py-8 md:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] md:gap-4 md:py-4">
        <div className="max-w-xl">
          <h1 className="text-[3.1rem] font-semibold leading-[0.95] tracking-tight sm:text-7xl md:text-5xl lg:text-6xl xl:text-[4.6rem]">
            A more meaningful
            <span className="mt-1 block">
              <span className="underline decoration-green decoration-[0.11em] underline-offset-[0.12em] [text-decoration-skip-ink:all]">way to meet.</span>
            </span>
          </h1>
          <p className="mt-6 max-w-sm text-lg leading-snug text-muted sm:text-xl">
            Fifty leaders. One room. New perspectives waiting to be discovered.
          </p>
          <button
            type="button"
            onClick={() => dispatch({ type: 'enter' })}
            className="mt-8 inline-flex h-12 items-center gap-3 rounded-full bg-[#102033] px-6 text-base font-semibold text-white transition active:scale-[0.98]"
          >
            Come in
            <Icon name="chevron" className="h-4 w-4" />
          </button>
          <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
            <Meta icon="calendar" label={shortDate(event.dateLabel)} />
            <span className="hidden text-line sm:inline" aria-hidden>
              |
            </span>
            <Meta icon="user" label="Leadership workshop" />
            <span className="hidden text-line sm:inline" aria-hidden>
              |
            </span>
            <Meta icon="people" label={`${leaders} leaders`} />
          </div>
        </div>
        <RoundTable className="mx-auto w-full max-w-[640px]" />
      </div>
    </div>
  )
}

export function Brand({ title, compact = false, onClick }: { title: string; compact?: boolean; onClick?: () => void }) {
  const className = 'flex items-center gap-3 text-left'
  const mark = (
    <>
      <img src="/logo.png" alt="" className={`${compact ? 'h-10 w-10' : 'h-12 w-12'} rounded-xl object-cover`} />
      <div>
        <p className={`${compact ? 'text-sm' : 'text-[15px]'} font-semibold tracking-tight`}>The Huddle</p>
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">People · Ideas · Actions</p>
        {compact ? null : <p className="text-xs text-muted sm:text-sm">{title}</p>}
      </div>
    </>
  )
  if (!onClick) return <div className={className}>{mark}</div>
  return (
    <button type="button" onClick={onClick} className={className}>
      {mark}
    </button>
  )
}

function Meta({ icon, label }: { icon: 'calendar' | 'pin' | 'user' | 'people'; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon name={icon} className="h-4 w-4" />
      {label}
    </span>
  )
}

function longDate(dateLabel: string) {
  const match = dateLabel.match(/(\d{1,2})\s+([A-Za-z]+)/)
  return match ? `${match[1]} ${match[2]}` : dateLabel
}

function shortDate(dateLabel: string) {
  const match = dateLabel.match(/(\d{1,2})\s+([A-Za-z]+)/)
  return match ? `${match[1]} ${match[2].slice(0, 3)}` : dateLabel
}

function place(event: EventConfig) {
  const venue = event.logistics.find((item) => item.icon === 'pin')
  if (!venue) return 'The room'
  return venue.body.split(',')[0].replace(/\.$/, '')
}

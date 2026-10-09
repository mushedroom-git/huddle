import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'
import { firstName } from '@/lib/logic'
import { useNav } from '@/state/nav'
import { useStore } from '@/state/store'
import { useTheme } from '@/state/theme'
import type { PersonView } from '@/lib/types'

type IconName =
  | 'home'
  | 'people'
  | 'groups'
  | 'calendar'
  | 'message'
  | 'pin'
  | 'bus'
  | 'wifi'
  | 'food'
  | 'shirt'
  | 'bell'
  | 'qr'
  | 'camera'
  | 'back'
  | 'check'
  | 'search'
  | 'close'
  | 'star'
  | 'share'
  | 'up'
  | 'down'
  | 'sun'
  | 'moon'
  | 'user'
  | 'edit'
  | 'lock'
  | 'hello'
  | 'leaf'
  | 'target'
  | 'offer'
  | 'clipboard'
  | 'mail'
  | 'send'
  | 'plus'
  | 'chevron'
  | 'download'

export function Icon({ name, className = 'h-6 w-6', filled = false }: { name: IconName; className?: string; filled?: boolean }) {
  const common = {
    className,
    viewBox: '0 0 24 24',
    fill: filled ? 'currentColor' : 'none',
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }
  switch (name) {
    case 'home':
      return (
        <svg {...common}>
          <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z" />
        </svg>
      )
    case 'people':
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3" />
          <path d="M3.5 19c.6-3 2.8-4.5 5.5-4.5S14 16 14.5 19" />
          <circle cx="17" cy="9" r="2.2" />
          <path d="M16 14.6c2.2.3 3.8 1.6 4.4 4.4" />
        </svg>
      )
    case 'groups':
      return (
        <svg {...common}>
          <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
          <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
          <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
          <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
        </svg>
      )
    case 'calendar':
      return (
        <svg {...common}>
          <rect x="4" y="5" width="16" height="15" rx="2" />
          <path d="M8 3.5V7M16 3.5V7M4 10h16" />
        </svg>
      )
    case 'message':
      return (
        <svg {...common}>
          <path d="M6 17.5 4 20V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2z" />
        </svg>
      )
    case 'pin':
      return (
        <svg {...common}>
          <path d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10z" />
          <circle cx="12" cy="11" r="2" />
        </svg>
      )
    case 'bus':
      return (
        <svg {...common}>
          <rect x="5" y="4" width="14" height="12" rx="2" />
          <path d="M5 12h14M8 20v-2M16 20v-2M8 16h.01M16 16h.01" />
        </svg>
      )
    case 'wifi':
      return (
        <svg {...common}>
          <path d="M5 10a10 10 0 0 1 14 0" />
          <path d="M8 13a6 6 0 0 1 8 0" />
          <path d="M12 17h.01" />
        </svg>
      )
    case 'food':
      return (
        <svg {...common}>
          <path d="M6 8h8.5v6.2a3.2 3.2 0 0 1-3.2 3.2H9.2A3.2 3.2 0 0 1 6 14.2z" />
          <path d="M14.5 9.4h1.7a2.2 2.2 0 0 1 0 4.4h-1.7" />
          <path d="M10.2 3.4c.9 1-.7 1.6.4 2.7" />
        </svg>
      )
    case 'shirt':
      return (
        <svg {...common}>
          <path d="M8 6 4 8l2 3 2-1v10h8V10l2 1 2-3-4-2-2 2h-4z" />
        </svg>
      )
    case 'bell':
      return (
        <svg {...common}>
          <path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2H4.5z" />
          <path d="M10 19a2 2 0 0 0 4 0" />
        </svg>
      )
    case 'qr':
      return (
        <svg {...common}>
          <path d="M5 5h5v5H5zM14 5h5v5h-5zM5 14h5v5H5zM14 14h2M18 14v2M14 18h5M18 18v2" />
        </svg>
      )
    case 'camera':
      return (
        <svg {...common}>
          <path d="M4 8.5h3.2L8.6 6h6.8l1.4 2.5H20a1 1 0 0 1 1 1V18a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5a1 1 0 0 1 1-1z" />
          <circle cx="12" cy="13.2" r="3.1" />
        </svg>
      )
    case 'back':
      return (
        <svg {...common}>
          <path d="M15 5 8 12l7 7" />
        </svg>
      )
    case 'check':
      return (
        <svg {...common}>
          <path d="m5 12 5 5L20 7" />
        </svg>
      )
    case 'search':
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="6" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      )
    case 'close':
      return (
        <svg {...common}>
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      )
    case 'star':
      return (
        <svg {...common}>
          <path d="m12 3 2.6 5.4 6 .9-4.3 4.2 1 5.9L12 16.8 6.7 19.4l1-5.9L3.4 9.3l6-.9z" />
        </svg>
      )
    case 'share':
      return (
        <svg {...common}>
          <path d="M12 4v11M8 8l4-4 4 4M6 13v6h12v-6" />
        </svg>
      )
    case 'up':
      return (
        <svg {...common}>
          <path d="m6 14 6-6 6 6" />
        </svg>
      )
    case 'down':
      return (
        <svg {...common}>
          <path d="m6 10 6 6 6-6" />
        </svg>
      )
    case 'sun':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3.4" />
          <path d="M12 2.8v2.2M12 19v2.2M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M2.8 12h2.2M19 12h2.2M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6" />
        </svg>
      )
    case 'moon':
      return (
        <svg {...common}>
          <path d="M20 14.2A7.4 7.4 0 0 1 9.6 4 6.8 6.8 0 1 0 20 14.2z" />
        </svg>
      )
    case 'user':
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3" />
          <path d="M6 19c.8-3 3-4.5 6-4.5s5.2 1.5 6 4.5" />
        </svg>
      )
    case 'edit':
      return (
        <svg {...common}>
          <path d="M4 20h4l10-10-4-4L4 16z" />
          <path d="m13 7 4 4" />
        </svg>
      )
    case 'lock':
      return (
        <svg {...common}>
          <rect x="6" y="11" width="12" height="9" rx="2" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </svg>
      )
    case 'hello':
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3" />
          <path d="M3.8 19c.6-2.8 2.6-4.2 5.2-4.2s4.6 1.4 5.2 4.2" />
          <path d="M18 8.5v5M15.5 11h5" />
        </svg>
      )
    case 'leaf':
      return (
        <svg {...common}>
          <path d="M5 19C5 11 11 5 19 5c0 8-6 14-14 14z" />
          <path d="M8 16c2-3 5-6 8-8" />
        </svg>
      )
    case 'target':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="7" />
          <circle cx="12" cy="12" r="3" />
          <path d="M12 3v2.2M12 18.8V21M3 12h2.2M18.8 12H21" />
        </svg>
      )
    case 'offer':
      return (
        <svg {...common}>
          <path d="M8.5 12.2V8.4a1.25 1.25 0 0 1 2.5 0v4" />
          <path d="M11 11.2V6.4a1.25 1.25 0 0 1 2.5 0V12" />
          <path d="M13.5 11.4V8.6a1.25 1.25 0 0 1 2.5 0v5.2" />
          <path d="M8.5 13.2 6.6 11.6a1.3 1.3 0 0 0-1.8 1.8L8 16.6" />
          <path d="M8.2 14.2c0 3 1.8 5.3 4.6 5.3 2.4 0 4.2-1.6 4.2-4.2v-1.5" />
        </svg>
      )
    case 'clipboard':
      return (
        <svg {...common}>
          <rect x="6" y="5" width="12" height="15" rx="2" />
          <path d="M9 5.2h6v2.2H9z" />
          <path d="M9 12h6M9 15.5h4" />
        </svg>
      )
    case 'mail':
      return (
        <svg {...common}>
          <rect x="4" y="6" width="16" height="12" rx="2" />
          <path d="m4 8 8 6 8-6" />
        </svg>
      )
    case 'send':
      return (
        <svg {...common}>
          <path d="M4 11.5 20 4l-6.2 16-2.4-6.6z" />
          <path d="m11.4 13.4 3.2-3.2" />
        </svg>
      )
    case 'plus':
      return (
        <svg {...common}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      )
    case 'chevron':
      return (
        <svg {...common}>
          <path d="m9 6 6 6-6 6" />
        </svg>
      )
    case 'download':
      return (
        <svg {...common}>
          <path d="M12 4v10" />
          <path d="m8 10 4 4 4-4" />
          <path d="M5 19h14" />
        </svg>
      )
  }
}

export function ThemeButton() {
  const { dark, setDark } = useTheme()
  return (
    <button
      type="button"
      onClick={() => setDark(!dark)}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="grid h-9 w-9 place-items-center rounded-full bg-paper text-ink shadow-[0_8px_18px_rgba(16,32,51,0.08)]"
    >
      <Icon name={dark ? 'sun' : 'moon'} className="h-5 w-5" />
    </button>
  )
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { id: T; label: string }[]
  value: T
  onChange: (id: T) => void
}) {
  return (
    <div className="grid rounded-full bg-sand p-1" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      {options.map((option) => {
        const on = option.id === value
        return (
          <button key={option.id} type="button" onClick={() => onChange(option.id)} className={`h-9 rounded-full px-2 text-sm font-semibold ${on ? 'bg-paper text-ink shadow-sm' : 'text-muted'}`}>
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

export function RoomDoors() {
  const { state } = useStore()
  const nav = useNav()
  const shot = state.photos[0]
  return (
    <div className="grid grid-cols-2 gap-3">
      <button type="button" onClick={() => nav.setTab('day', { day: 'photos' })} className="relative h-[7.25rem] overflow-hidden rounded-[22px] text-left">
        <img src={shot?.thumb || '/scenes/moments.jpg'} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
        <span className="absolute inset-x-3 bottom-3 text-white">
          <span className="block font-semibold">Photos</span>
          <span className="block text-sm text-white/80">{state.photos.length ? `${state.photos.length} from the room` : 'Add one from today'}</span>
        </span>
      </button>
      <button type="button" onClick={() => nav.setTab('ask', { ask: 'wall' })} className="relative h-[7.25rem] overflow-hidden rounded-[22px] text-left">
        <img src="/scenes/commitments.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
        <span className="absolute inset-x-3 bottom-3 text-white">
          <span className="block font-semibold">Commitments</span>
          <span className="block text-sm leading-snug text-white/80">One action to take back</span>
        </span>
      </button>
    </div>
  )
}

export function Avatar({
  person,
  size = 44,
  className = '',
  tile = false,
}: {
  person: Pick<PersonView, 'initials' | 'color' | 'fullName'> & { photoUrl?: string | null }
  size?: number
  className?: string
  tile?: boolean
}) {
  return (
    <span
      className={`relative inline-grid shrink-0 place-items-center overflow-hidden font-semibold text-white ${tile ? 'rounded-[1.1rem]' : 'rounded-full'} ${className}`}
      style={{ width: size, height: size, background: person.color, fontSize: size < 36 ? 11 : size < 64 ? 15 : 28 }}
      aria-hidden
    >
      {person.photoUrl ? (
        <img src={person.photoUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <>
          <span className="absolute inset-0 bg-gradient-to-br from-white/25 to-transparent" />
          <span className="relative">{person.initials}</span>
        </>
      )}
      <span className="sr-only">{person.fullName}</span>
    </span>
  )
}

export function Card({
  children,
  className = '',
  onClick,
}: {
  children: ReactNode
  className?: string
  onClick?: () => void
}) {
  const cls = `rounded-3xl bg-paper shadow-[0_10px_30px_rgba(2,28,55,0.05)] ${className}`
  if (!onClick) return <div className={cls}>{children}</div>
  return (
    <button type="button" onClick={onClick} className={`${cls} w-full text-left transition active:scale-[0.99]`}>
      {children}
    </button>
  )
}

export function ScreenHeader({ title, onBack, action }: { title: string; onBack?: () => void; action?: ReactNode }) {
  return (
    <div className="sticky top-0 z-10 -mx-4 mb-4 flex items-center gap-2 bg-cream/90 px-4 py-3 backdrop-blur-md">
      {onBack ? (
        <button type="button" onClick={onBack} className="grid h-10 w-10 place-items-center rounded-full bg-paper" aria-label="Back">
          <Icon name="back" className="h-5 w-5" />
        </button>
      ) : null}
      <h1 className="flex-1 text-lg font-semibold tracking-tight">{title}</h1>
      {action}
    </div>
  )
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return <p className="mb-2 text-sm font-medium text-muted">{children}</p>
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-2xl border border-line bg-paper px-4 py-3 text-ink outline-none ring-green/40 placeholder:text-muted/70 focus:ring-2 ${props.className ?? ''}`}
    />
  )
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full resize-none rounded-2xl border border-line bg-paper px-4 py-3 text-ink outline-none ring-green/40 placeholder:text-muted/70 focus:ring-2 ${props.className ?? ''}`}
    />
  )
}

export function PrimaryButton({ children, className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className={`flex h-12 w-full items-center justify-center rounded-full bg-ink px-5 text-[15px] font-semibold text-cream transition active:scale-[0.99] disabled:opacity-40 ${className}`}
    >
      {children}
    </button>
  )
}

export function GhostButton({ children, className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className={`flex h-12 w-full items-center justify-center rounded-full bg-sand px-5 text-[15px] font-semibold text-ink transition active:scale-[0.99] ${className}`}
    >
      {children}
    </button>
  )
}

export function Toggle({ on, label, hint, onChange }: { on: boolean; label: string; hint?: string; onChange: (next: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!on)} className="flex w-full items-center justify-between gap-4 rounded-3xl bg-paper px-4 py-4 text-left">
      <span>
        <span className="block text-[15px] font-medium">{label}</span>
        {hint ? <span className="mt-0.5 block text-sm text-muted">{hint}</span> : null}
      </span>
      <span className={`relative h-7 w-12 shrink-0 rounded-full transition ${on ? 'bg-green' : 'bg-line'}`} aria-hidden>
        <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${on ? 'left-5' : 'left-0.5'}`} />
      </span>
    </button>
  )
}

export function personLine(view: PersonView): string {
  return `${firstName(view.fullName)} · ${view.department}`
}

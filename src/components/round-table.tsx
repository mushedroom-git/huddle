import { avatarColor, initials } from '@/lib/logic'
import { useStore } from '@/state/store'

// Angles match the chairs in public/scenes/table.png.
// 0° is the right side, and degrees increase clockwise, the same way the photo is measured.
const SEATS = [
  { id: 'priya', angle: 231.5, outer: 0.866, tilt: -6 },
  { id: 'wei', angle: 310.3, outer: 0.911, tilt: 5 },
  { id: 'alex', angle: 357.3, outer: 0.986, tilt: 4 },
  { id: 'lena', angle: 41.7, outer: 0.969, tilt: -4 },
  { id: 'omar', angle: 87.8, outer: 0.923, tilt: 2 },
  { id: 'noah', angle: 134, outer: 0.923, tilt: -5 },
  { id: 'maria', angle: 179.2, outer: 0.922, tilt: 6 },
]

const TABLE_SCALE = 0.82
const PORTRAIT = 18

function seatRadius(outer: number) {
  const chair = TABLE_SCALE * outer * 50
  const half = PORTRAIT / 2
  return Math.min(chair + half * 0.42, 48 - half)
}

function polar(angle: number, radius: number) {
  const rad = (angle * Math.PI) / 180
  return {
    left: `${50 + Math.cos(rad) * radius}%`,
    top: `${50 + Math.sin(rad) * radius}%`,
  }
}

export function RoundTable({ contain = false, className = '' }: { contain?: boolean; className?: string }) {
  const { state } = useStore()
  const byId = new Map(state.participants.map((person) => [person.id, person]))
  const ring = SEATS.reduce((sum, seat) => sum + seatRadius(seat.outer), 0) / SEATS.length

  return (
    <div className={`${contain ? 'flex h-full w-full items-center justify-end' : 'grid min-h-0 place-items-center'} ${className}`}>
      <div className={`relative aspect-square ${contain ? 'h-full max-h-full w-auto max-w-full' : 'w-[92%] max-w-[720px]'}`}>
        <svg className="pointer-events-none absolute inset-0 h-full w-full text-[#b7cfc0]" viewBox="0 0 100 100" aria-hidden>
          <circle cx="50" cy="50" r={ring} fill="none" stroke="currentColor" strokeWidth="0.35" strokeDasharray="1.1 1.6" />
        </svg>
        {SEATS.map((seat, index) => {
          const next = SEATS[(index + 1) % SEATS.length]
          const mid = midAngle(seat.angle, next.angle)
          return <span key={`${seat.id}-dot`} className="absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-green" style={polar(mid, ring - 1.5)} />
        })}
        <img
          src="/scenes/table.png?v=2"
          alt=""
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none"
          style={{ width: `${TABLE_SCALE * 100}%` }}
        />
        {SEATS.map((seat) => {
          const person = byId.get(seat.id)
          if (!person) return null
          const radius = seatRadius(seat.outer)
          return (
            <div
              key={seat.id}
              className="absolute z-10 w-[18%] max-w-[156px]"
              style={{ ...polar(seat.angle, radius), transform: `translate(-50%, -50%) rotate(${seat.tilt}deg)` }}
            >
              <div className="rounded-[1.15rem] bg-white p-1 shadow-[0_10px_24px_rgba(16,32,51,0.16)]">
                {person.photoUrl ? (
                  <img src={person.photoUrl} alt="" className="aspect-square w-full rounded-[0.9rem] object-cover object-[center_18%]" />
                ) : (
                  <span
                    className="grid aspect-square w-full place-items-center rounded-[0.9rem] text-sm font-semibold text-white"
                    style={{ background: avatarColor(person.id) }}
                  >
                    {initials(person.fullName)}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function midAngle(a: number, b: number) {
  const start = a
  let end = b
  if (end < start) end += 360
  return (start + end) / 2 % 360
}

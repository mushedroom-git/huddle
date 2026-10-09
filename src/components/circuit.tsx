import { Avatar } from '@/components/ui'
import type { PersonView } from '@/lib/types'

const RING = 18

export function MyCircuit({
  people,
  metIds,
  onOpen,
}: {
  people: PersonView[]
  metIds: string[]
  onOpen: (id: string) => void
}) {
  const met = new Set(metIds)
  const lit = people.filter((person) => met.has(person.id))
  const waiting = people.filter((person) => !met.has(person.id))
  const ring = [...lit, ...waiting].slice(0, RING)
  const size = 292
  const radius = 112

  return (
    <section className="overflow-hidden rounded-[24px] bg-[#10261c] p-4 text-[#f6f1e8]">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-lg font-semibold tracking-tight">My Circuit</h2>
        <p className="text-sm text-white/70">
          {lit.length} met
        </p>
      </div>
      <div className="relative mx-auto mt-2" style={{ width: size, height: size }}>
        {ring.map((person, index) => {
          const angle = (index / ring.length) * Math.PI * 2 - Math.PI / 2
          const x = size / 2 + radius * Math.cos(angle)
          const y = size / 2 + radius * Math.sin(angle)
          const hello = met.has(person.id)
          return (
            <button
              key={person.id}
              type="button"
              onClick={() => onOpen(person.id)}
              aria-label={`${person.fullName}${hello ? ', met' : ''}`}
              className="absolute"
              style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}
            >
              <span className={`block rounded-full ${hello ? 'ring-2 ring-[#3DCD58] ring-offset-2 ring-offset-[#10261c]' : 'opacity-45'}`}>
                <Avatar person={person} size={36} />
              </span>
            </button>
          )
        })}
        <div className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[#3DCD58] text-sm font-semibold text-[#10261c]">
          You
        </div>
      </div>
    </section>
  )
}

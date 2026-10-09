import { layoutGraph, presentPerson } from '@/lib/logic'
import { useStore } from '@/state/store'

export function NetworkGraph({
  mode,
  tone,
  onPick,
  className = '',
}: {
  mode: 'room' | 'personal'
  tone: 'dark' | 'light'
  onPick?: (id: string) => void
  className?: string
}) {
  const { state } = useStore()
  const viewerId = mode === 'personal' ? state.currentUserId : null
  const { nodes, links, wedges, byId } = layoutGraph(state, viewerId, mode)
  const dark = tone === 'dark'
  const line = 'rgba(61,205,88,0.4)'

  return (
    <svg viewBox="0 0 360 360" className={className} role="img" aria-label={mode === 'room' ? 'The room, connecting' : 'Your network'}>
      {mode === 'personal'
        ? wedges.map((wedge) => (
            <text
              key={wedge.department}
              x={wedge.labelX}
              y={wedge.labelY}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={wedge.quiet ? '#3DCD58' : dark ? '#93a197' : '#546274'}
              fontSize="8"
              fontFamily="ui-sans-serif, system-ui, sans-serif"
            >
              {wedge.department === 'Manufacturing' ? 'Mfg' : wedge.department === 'Sustainability' ? 'Sustain' : wedge.department === 'Procurement' ? 'Procure' : wedge.department}
            </text>
          ))
        : null}
      {links.map((link, index) => {
        const a = byId.get(link.a)
        const b = byId.get(link.b)
        if (!a || !b) return null
        return (
          <line
            key={`${link.a}-${link.b}`}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke={line}
            strokeWidth={dark ? 1.2 : 1}
            pathLength={1}
            className={dark ? 'draw-line' : undefined}
            style={dark ? { animationDelay: `${Math.min(index, 24) * 0.035}s` } : undefined}
          />
        )
      })}
      {nodes.map((node) => {
        const person = presentPerson(state, state.currentUserId, node.id)
        const face = node.kind === 'me' || node.kind === 'connected' || node.kind === 'suggested'
        const radius = face ? (node.kind === 'me' ? 16 : 11) : node.r
        const fill = node.kind === 'me' ? '#3DCD58' : person?.color ?? '#3DCD58'
        const suggested = node.kind === 'suggested'
        return (
          <g key={node.id} onClick={() => onPick?.(node.id)} style={{ cursor: onPick ? 'pointer' : 'default' }}>
            <circle cx={node.x} cy={node.y} r={radius + (onPick ? 6 : 0)} fill="transparent" />
            {face ? (
              <>
                <clipPath id={`face-${mode}-${node.id}`}>
                  <circle cx={node.x} cy={node.y} r={radius} />
                </clipPath>
                <circle cx={node.x} cy={node.y} r={radius} fill={fill} />
                {person?.photoUrl ? (
                  <image
                    href={person.photoUrl}
                    x={node.x - radius}
                    y={node.y - radius}
                    width={radius * 2}
                    height={radius * 2}
                    clipPath={`url(#face-${mode}-${node.id})`}
                    preserveAspectRatio="xMidYMid slice"
                  />
                ) : (
                  <text x={node.x} y={node.y} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize="8" fontFamily="ui-sans-serif, system-ui, sans-serif">
                    {person?.initials ?? ''}
                  </text>
                )}
                <circle cx={node.x} cy={node.y} r={radius} fill="none" stroke={node.kind === 'me' ? '#3DCD58' : suggested ? '#3DCD58' : '#ffffff'} strokeWidth={node.kind === 'me' ? 2.5 : 1.5} />
                {node.kind === 'me' ? (
                  <text x={node.x} y={node.y + radius + 10} textAnchor="middle" fill="#0e1c30" fontSize="8" fontWeight="700" fontFamily="ui-sans-serif, system-ui, sans-serif">
                    You
                  </text>
                ) : null}
              </>
            ) : (
              <circle
                cx={node.x}
                cy={node.y}
                r={node.r}
                fill={suggested ? 'transparent' : fill}
                stroke={suggested ? '#3DCD58' : 'transparent'}
                strokeWidth={suggested ? 1.6 : 0}
                strokeDasharray={suggested ? '3 2' : undefined}
              />
            )}
          </g>
        )
      })}
    </svg>
  )
}

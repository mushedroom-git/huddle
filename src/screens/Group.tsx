import { useState } from 'react'
import { presentPerson } from '@/lib/logic'
import type { Participant, PersonView, WorkshopGroup } from '@/lib/types'
import { useFrame } from '@/state/frame'
import { useNav } from '@/state/nav'
import { useStore } from '@/state/store'
import { Avatar, Icon } from '@/components/ui'

export function Group() {
  const { state, dispatch } = useStore()
  const nav = useNav()
  const frame = useFrame()
  const wide = frame !== 'phone'
  const groups = state.groups
  const mine = groups.find((group) => group.memberIds.includes(state.currentUserId))
  const [picked, setPicked] = useState<string | null>(wide ? (mine?.id ?? groups[0]?.id ?? null) : null)
  const active = groups.find((group) => group.id === (wide ? (picked ?? mine?.id ?? groups[0]?.id) : picked)) ?? null
  const challengerCount = new Set(groups.flatMap((group) => group.challengerIds)).size

  const membersOf = (group: WorkshopGroup) =>
    group.memberIds
      .map((id) => presentPerson(state, state.currentUserId, id))
      .filter((person): person is PersonView => Boolean(person))

  return (
    <div className={wide ? 'mx-auto grid w-full max-w-5xl grid-cols-[minmax(260px,380px)_minmax(0,1fr)] items-start gap-6 px-8 pb-10' : 'px-4 pb-4'}>
      {wide || !active ? (
        <div>
          <h1 className="text-[1.7rem] font-semibold tracking-tight">Group</h1>
          <p className="mt-0.5 text-sm text-muted">
            {state.participants.length} participants · {groups.length} groups
          </p>
          {challengerCount > 0 ? (
            <p className="text-sm text-muted">
              {challengerCount} challengers rotate across groups
            </p>
          ) : null}
          <ul className="mt-4 flex flex-col gap-3">
            {groups.map((group) => {
              const members = membersOf(group)
              const faces = members.slice(0, 4)
              const extra = members.length - faces.length
              const selected = active?.id === group.id
              return (
                <li key={group.id}>
                  <button
                    type="button"
                    onClick={() => setPicked(group.id)}
                    className={`flex w-full items-center gap-3 rounded-[22px] bg-[#021C37] p-4 text-left text-white ${selected && wide ? 'ring-2 ring-green' : ''}`}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-green">{group.code}</span>
                      <span className="mt-0.5 block text-[1.05rem] font-semibold leading-tight">{group.title}</span>
                      <span className="mt-1 block text-sm text-white/70">
                        {members.length} participant{members.length === 1 ? '' : 's'}
                        {group.id === mine?.id ? ' · Your group' : ''}
                      </span>
                      <span className="mt-2 flex items-center">
                        {faces.map((person, index) => (
                          <span key={person.id} className={index === 0 ? '' : '-ml-2'} style={{ zIndex: faces.length - index }}>
                            <Avatar person={person} size={26} className="ring-2 ring-[#021C37]" />
                          </span>
                        ))}
                        {extra > 0 ? <span className="ml-2 text-xs font-semibold text-white/80">+{extra}</span> : null}
                      </span>
                    </span>
                    <Icon name="chevron" className="h-5 w-5 shrink-0 text-green" />
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}
      {active ? (
        <Detail
          group={active}
          members={membersOf(active)}
          showBack={!wide}
          onBack={() => setPicked(null)}
          onOpen={(id) => nav.open({ type: 'person', id })}
          onDownload={() => {
            downloadPack(active, membersOf(active))
            dispatch({ type: 'toast', text: 'Session pack downloaded' })
          }}
          teamsHref={teamsRoom(state.participants, active.memberIds)}
        />
      ) : null}
    </div>
  )
}

function Detail({
  group,
  members,
  showBack,
  onBack,
  onOpen,
  onDownload,
  teamsHref,
}: {
  group: WorkshopGroup
  members: PersonView[]
  showBack: boolean
  onBack: () => void
  onOpen: (id: string) => void
  onDownload: () => void
  teamsHref: string
}) {
  const note = group.challengerIds.length ? 'challengers rotate in' : null

  return (
    <div>
      {showBack ? (
        <button type="button" onClick={onBack} className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-ink">
          <Icon name="back" className="h-4 w-4" />
          Group
        </button>
      ) : null}
      <div className="rounded-[24px] bg-[#021C37] p-5 text-white">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-green">{group.code}</p>
        <h2 className="mt-1 text-[1.55rem] font-semibold leading-tight">{group.title}</h2>
        <p className="mt-1 text-sm text-white/70">
          {members.length} participant{members.length === 1 ? '' : 's'}
          {note ? ` · ${note}` : ''}
        </p>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <a
          href={teamsHref}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 rounded-2xl bg-green px-3 py-3 text-ink"
        >
          <Icon name="bell" className="h-5 w-5 shrink-0" />
          <span>
            <span className="block text-sm font-semibold">Teams chat</span>
            <span className="block text-xs">Open group room</span>
          </span>
        </a>
        <button type="button" onClick={onDownload} className="flex items-center gap-2 rounded-2xl bg-paper px-3 py-3 text-left text-ink ring-1 ring-line">
          <Icon name="download" className="h-5 w-5 shrink-0 text-green" />
          <span>
            <span className="block text-sm font-semibold">Materials</span>
            <span className="block text-xs text-muted">Download pack</span>
          </span>
        </button>
      </div>
      <p className="mb-2 mt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Participants</p>
      <ul className="overflow-hidden rounded-[22px] bg-paper">
        {members.map((person) => (
          <li key={person.id} className="border-b border-line last:border-b-0">
            <button type="button" onClick={() => onOpen(person.id)} className="flex w-full items-center gap-3 px-3 py-2.5 text-left">
              <Avatar person={person} size={36} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">
                  {person.fullName}
                  {person.isSelf ? ' · You' : ''}
                </span>
                <span className="block truncate text-xs text-muted">{person.jobTitle}</span>
                {group.scribeId === person.id ? <span className="block text-xs text-green">Scribe & rapporteur</span> : null}
                {group.challengerIds.includes(person.id) ? <span className="block text-xs text-green">Challenger</span> : null}
              </span>
              <Icon name="chevron" className="h-4 w-4 shrink-0 text-muted" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function teamsRoom(participants: Participant[], memberIds: string[]) {
  const emails = memberIds
    .map((id) => participants.find((person) => person.id === id)?.email)
    .filter((email): email is string => Boolean(email))
  if (!emails.length) return 'https://teams.microsoft.com'
  return `https://teams.microsoft.com/l/chat/0/0?users=${emails.map((email) => encodeURIComponent(email)).join(',')}`
}

function downloadPack(group: WorkshopGroup, members: PersonView[]) {
  const lines = [
    'The Huddle',
    `${group.code} · ${group.title}`,
    '',
    group.brief,
    '',
    'Participants',
    ...members.map((person) => `- ${person.fullName}, ${person.jobTitle}`),
    '',
  ]
  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${group.code.replace(/\s+/g, '-').toLowerCase()}-session-pack.txt`
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

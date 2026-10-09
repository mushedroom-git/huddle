import { useRef, useState } from 'react'
import { voteCount } from '@/lib/logic'
import { useNav } from '@/state/nav'
import { downloadAlbum, resizePhoto } from '@/lib/photos'
import { SAMPLE_IMPORT } from '@/data/seed'
import { activeSelfie } from '@/lib/challenge'
import { useStore } from '@/state/store'
import { GhostButton, PrimaryButton, ScreenHeader, TextArea, TextInput, Toggle } from '@/components/ui'
import { DEPARTMENTS, type AgendaItem, type AgendaKind, type LogisticsIcon, type LogisticsItem } from '@/lib/types'

export function Organizer() {
  const { state, dispatch } = useStore()
  const nav = useNav()
  const event = state.event
  const [note, setNote] = useState('')
  const [urgent, setUrgent] = useState(true)
  const [image, setImage] = useState<string | null>(null)
  const [reading, setReading] = useState(false)
  const photoInput = useRef<HTMLInputElement>(null)
  const [credit, setCredit] = useState('')
  const [person, setPerson] = useState({ fullName: '', jobTitle: '', department: 'Planning', email: '' })
  const [confirm, setConfirm] = useState<'reset' | 'samples' | null>(null)
  const feedback = state.feedback
  const average = (pick: 'metScore' | 'timeScore' | 'takeawayScore') =>
    feedback.length ? feedback.reduce((sum, item) => sum + item[pick], 0) / feedback.length : 0

  const patchAgenda = (id: string, patch: Partial<AgendaItem>) => {
    dispatch({
      type: 'patchEvent',
      patch: { agenda: event.agenda.map((item) => (item.id === id ? { ...item, ...patch } : item)) },
    })
  }
  const moveAgenda = (index: number, direction: -1 | 1) => {
    const next = event.agenda.slice()
    const target = index + direction
    if (target < 0 || target >= next.length) return
    const [item] = next.splice(index, 1)
    next.splice(target, 0, item)
    dispatch({ type: 'patchEvent', patch: { agenda: next } })
  }
  const patchLogistics = (id: string, patch: Partial<LogisticsItem>) => {
    dispatch({
      type: 'patchEvent',
      patch: { logistics: event.logistics.map((item) => (item.id === id ? { ...item, ...patch } : item)) },
    })
  }

  return (
    <div className="absolute inset-0 z-40 overflow-y-auto bg-cream px-4 pb-16">
      <ScreenHeader title="Run the day" onBack={nav.close} />
      <p className="text-sm leading-relaxed text-muted">Change it here. The room sees it straight away.</p>

      <section className="mt-6 space-y-3">
        <h2 className="font-semibold">Announcement</h2>
        <TextArea value={note} rows={2} maxLength={140} placeholder="The bus leaves in 10 minutes" onChange={(event) => setNote(event.target.value)} />
        <div className="flex items-center gap-3">
          {image ? <img src={image} alt="" className="h-14 w-14 shrink-0 rounded-xl object-cover" /> : null}
          <div className="min-w-0">
            <button
              type="button"
              className="font-semibold text-ink underline decoration-green decoration-2 underline-offset-4 disabled:opacity-40"
              disabled={reading}
              onClick={() => photoInput.current?.click()}
            >
              {image ? 'Change photo' : 'Add a photo'}
            </button>
            <p className="mt-1 text-sm text-muted">Optional. It shows on Home until you take this down.</p>
            {image ? (
              <button type="button" className="mt-1 text-sm font-semibold text-muted" onClick={() => setImage(null)}>
                Remove photo
              </button>
            ) : null}
          </div>
          <input
            ref={photoInput}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0]
              event.target.value = ''
              if (!file) return
              setReading(true)
              resizePhoto(file)
                .then((sized) => setImage(sized.full))
                .catch(() => dispatch({ type: 'toast', text: 'That photo could not be read.' }))
                .finally(() => setReading(false))
            }}
          />
        </div>
        <Toggle on={urgent} label="Urgent" hint="Warm banner, harder to miss." onChange={setUrgent} />
        <PrimaryButton
          disabled={reading || !note.trim()}
          onClick={() => {
            dispatch({ type: 'announce', text: note, urgent, imageUrl: image })
            setNote('')
            setImage(null)
          }}
        >
          Post to the room
        </PrimaryButton>
        {state.announcements
          .filter((item) => item.active)
          .map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl bg-paper px-4 py-3 text-sm">
              {item.imageUrl ? <img src={item.imageUrl} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" /> : null}
              <span className="min-w-0 flex-1">{item.text}</span>
              <button type="button" className="shrink-0 font-semibold text-ink underline decoration-green decoration-2 underline-offset-4" onClick={() => dispatch({ type: 'endAnnouncement', id: item.id })}>
                Take down
              </button>
            </div>
          ))}
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="font-semibold">The wall</h2>
        <p className="text-sm leading-relaxed text-muted">
          {state.photos.length
            ? `${state.photos.length} ${state.photos.length === 1 ? 'photo' : 'photos'} from the room. `
            : 'No photos yet. '}
          Take one down from the photo itself. This downloads the album for the follow-up.
        </p>
        <PrimaryButton
          disabled={!state.photos.length}
          onClick={() =>
            downloadAlbum(state.photos, (id) => state.participants.find((person) => person.id === id)?.fullName ?? 'guest')
          }
        >
          Download the album
        </PrimaryButton>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="font-semibold">The challenge</h2>
        <p className="text-sm leading-relaxed text-muted">People are ranked on their own points. The room sees the top five, plus their own place if they sit outside it.</p>
        <div className="space-y-2">
          {state.participants
            .filter((person) => activeSelfie(state.challengeClaims, person.id))
            .map((person) => (
              <div key={person.id} className="flex items-center justify-between gap-3 rounded-2xl bg-paper px-4 py-3 text-sm">
                <span>{person.fullName}</span>
                <button type="button" className="shrink-0 font-semibold text-ink underline decoration-green decoration-2 underline-offset-4" onClick={() => dispatch({ type: 'revokeClaim', participantId: person.id })}>
                  Take points off
                </button>
              </div>
            ))}
        </div>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="font-semibold">The day</h2>
        <Toggle on={event.draft} label="Agenda is a draft" onChange={(draft) => dispatch({ type: 'patchEvent', patch: { draft } })} />
        <Toggle on={event.questionsOpen} label="Questions are open" onChange={(questionsOpen) => dispatch({ type: 'patchEvent', patch: { questionsOpen } })} />
        <Toggle on={event.feedbackOpen} label="Feedback is open" onChange={(feedbackOpen) => dispatch({ type: 'patchEvent', patch: { feedbackOpen } })} />
        <Toggle on={event.demoClock} label="Demo clock" hint="Pretend the workshop is in progress." onChange={(demoClock) => dispatch({ type: 'patchEvent', patch: { demoClock } })} />
        {event.demoClock ? (
          <label className="block text-sm">
            <span className="text-muted">Show the agenda as if it’s</span>
            <input
              type="time"
              value={event.demoTime}
              onChange={(event) => dispatch({ type: 'patchEvent', patch: { demoTime: event.target.value } })}
              className="mt-2 w-full rounded-2xl bg-paper px-4 py-3"
            />
          </label>
        ) : null}
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="font-semibold">Agenda</h2>
        {event.agenda.map((item, index) => (
          <div key={item.id} className="space-y-2 rounded-3xl bg-paper p-4">
            <div className="grid grid-cols-2 gap-2">
              <input type="time" value={item.time} onChange={(event) => patchAgenda(item.id, { time: event.target.value })} className="rounded-xl bg-cream px-3 py-2" aria-label="Start" />
              <input type="time" value={item.end} onChange={(event) => patchAgenda(item.id, { end: event.target.value })} className="rounded-xl bg-cream px-3 py-2" aria-label="End" />
            </div>
            <TextInput value={item.title} onChange={(event) => patchAgenda(item.id, { title: event.target.value })} aria-label="Session title" />
            <TextInput value={item.detail} onChange={(event) => patchAgenda(item.id, { detail: event.target.value })} aria-label="Detail" />
            <select
              value={item.kind}
              onChange={(event) => patchAgenda(item.id, { kind: event.target.value as AgendaKind })}
              className="w-full rounded-xl bg-cream px-3 py-2"
            >
              <option value="session">Session</option>
              <option value="break">Break · links to people</option>
              <option value="qa">Q&A · links to questions</option>
              <option value="food">Food</option>
            </select>
            <div className="flex gap-3 text-sm font-semibold text-ink underline decoration-green decoration-2 underline-offset-4">
              <button type="button" onClick={() => moveAgenda(index, -1)}>Up</button>
              <button type="button" onClick={() => moveAgenda(index, 1)}>Down</button>
              <button
                type="button"
                onClick={() => dispatch({ type: 'patchEvent', patch: { agenda: event.agenda.filter((row) => row.id !== item.id) } })}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
        <GhostButton
          onClick={() =>
            dispatch({
              type: 'patchEvent',
              patch: {
                agenda: [
                  ...event.agenda,
                  { id: `ag-${Date.now()}`, time: '16:10', end: '16:30', title: 'New session', detail: '', kind: 'session' },
                ],
              },
            })
          }
        >
          Add a session
        </GhostButton>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="font-semibold">Logistics</h2>
        {event.logistics.map((item, index) => (
          <div key={item.id} className="space-y-2 rounded-3xl bg-paper p-4">
            <TextInput value={item.title} onChange={(event) => patchLogistics(item.id, { title: event.target.value })} aria-label="Card title" />
            <TextArea value={item.body} rows={2} onChange={(event) => patchLogistics(item.id, { body: event.target.value })} />
            <TextInput value={item.extra} placeholder="Password or extra detail" onChange={(event) => patchLogistics(item.id, { extra: event.target.value })} />
            <select
              value={item.icon}
              onChange={(event) => patchLogistics(item.id, { icon: event.target.value as LogisticsIcon })}
              className="w-full rounded-xl bg-cream px-3 py-2"
            >
              <option value="pin">Place</option>
              <option value="bus">Transport</option>
              <option value="wifi">Wi-Fi</option>
              <option value="food">Food</option>
              <option value="shirt">Dress</option>
            </select>
            <div className="flex gap-3 text-sm font-semibold text-ink underline decoration-green decoration-2 underline-offset-4">
              <button
                type="button"
                onClick={() => {
                  if (index === 0) return
                  const next = event.logistics.slice()
                  const [row] = next.splice(index, 1)
                  next.splice(index - 1, 0, row)
                  dispatch({ type: 'patchEvent', patch: { logistics: next } })
                }}
              >
                Up
              </button>
              <button
                type="button"
                onClick={() => {
                  if (index === event.logistics.length - 1) return
                  const next = event.logistics.slice()
                  const [row] = next.splice(index, 1)
                  next.splice(index + 1, 0, row)
                  dispatch({ type: 'patchEvent', patch: { logistics: next } })
                }}
              >
                Down
              </button>
              <button
                type="button"
                onClick={() => dispatch({ type: 'patchEvent', patch: { logistics: event.logistics.filter((row) => row.id !== item.id) } })}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
        <GhostButton
          onClick={() =>
            dispatch({
              type: 'patchEvent',
              patch: {
                logistics: [...event.logistics, { id: `lg-${Date.now()}`, icon: 'pin', title: 'New card', body: '', extra: '' }],
              },
            })
          }
        >
          Add a card
        </GhostButton>
      </section>

      <section className="mt-8">
        <h2 className="font-semibold">Feedback</h2>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <Stat label="Met people" value={average('metScore')} />
          <Stat label="Worth it" value={average('timeScore')} />
          <Stat label="Take back" value={average('takeawayScore')} />
        </div>
        <div className="mt-3 space-y-2">
          {feedback.map((item) =>
            item.best || item.change ? (
              <div key={item.id} className="rounded-2xl bg-paper px-4 py-3 text-sm">
                {item.best ? <p>{item.best}</p> : null}
                {item.change ? <p className="mt-1 text-muted">{item.change}</p> : null}
              </div>
            ) : null,
          )}
        </div>
        <p className="mt-2 text-xs text-muted">{feedback.length} notes · no names stored</p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="font-semibold">Questions to watch</h2>
        {state.questions
          .filter((question) => !question.isHidden && !question.isAnswered)
          .slice()
          .sort((a, b) => voteCount(state, b.id) - voteCount(state, a.id))
          .slice(0, 5)
          .map((question) => (
            <div key={question.id} className="rounded-2xl bg-paper px-4 py-3 text-sm">
              <p className="font-medium">{question.text}</p>
              <p className="mt-1 text-muted">{voteCount(state, question.id)} votes</p>
            </div>
          ))}
        <p className="text-sm text-muted">Hide or mark answered on the Ask tab, while viewing as an organizer.</p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="font-semibold">People · {state.participants.length}</h2>
        <TextInput placeholder="Full name" value={person.fullName} onChange={(event) => setPerson({ ...person, fullName: event.target.value })} />
        <TextInput placeholder="Title" value={person.jobTitle} onChange={(event) => setPerson({ ...person, jobTitle: event.target.value })} />
        <select value={person.department} onChange={(event) => setPerson({ ...person, department: event.target.value })} className="w-full rounded-2xl bg-paper px-4 py-3">
          {DEPARTMENTS.map((department) => (
            <option key={department}>{department}</option>
          ))}
        </select>
        <TextInput placeholder="Email" value={person.email} onChange={(event) => setPerson({ ...person, email: event.target.value })} />
        <PrimaryButton
          onClick={() => {
            dispatch({ type: 'addPerson', ...person })
            setPerson({ fullName: '', jobTitle: '', department: person.department, email: '' })
          }}
        >
          Add them
        </PrimaryButton>
        <label className="block rounded-3xl bg-paper px-4 py-4 text-sm font-semibold">
          Import a CSV
          <input
            type="file"
            accept=".csv,text/csv,text/plain"
            className="mt-2 block w-full text-sm font-normal"
            onChange={async (event) => {
              const file = event.target.files?.[0]
              if (!file) return
              dispatch({ type: 'importCsv', csv: await file.text() })
              event.target.value = ''
            }}
          />
        </label>
        <GhostButton onClick={() => dispatch({ type: 'importCsv', csv: SAMPLE_IMPORT })}>Add two sample late arrivals</GhostButton>
        <p className="text-xs leading-relaxed text-muted">
          Header: full_name, job_title, department, email, mobile. Re-importing updates roles and does not touch what people wrote themselves.
        </p>
        {state.participants
          .filter((item) => !item.isSample)
          .map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-2xl bg-paper px-4 py-3 text-sm">
              <span>{item.fullName}</span>
              <button type="button" className="font-semibold text-warm" onClick={() => dispatch({ type: 'removePerson', id: item.id })}>
                Remove
              </button>
            </div>
          ))}
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="font-semibold">Credits</h2>
        <div className="flex gap-2">
          <TextInput value={credit} placeholder="Name" onChange={(event) => setCredit(event.target.value)} />
          <button
            type="button"
            className="shrink-0 rounded-full bg-ink px-4 font-semibold text-cream"
            onClick={() => {
              const name = credit.trim()
              if (!name) return
              dispatch({ type: 'patchEvent', patch: { credits: [...event.credits, name] } })
              setCredit('')
            }}
          >
            Add
          </button>
        </div>
        {event.credits.map((name, index) => (
          <div key={`${name}-${index}`} className="flex items-center justify-between rounded-2xl bg-paper px-4 py-3 text-sm">
            <span>{name}</span>
            <button
              type="button"
              className="font-semibold text-ink underline decoration-green decoration-2 underline-offset-4"
              onClick={() => dispatch({ type: 'patchEvent', patch: { credits: event.credits.filter((_, i) => i !== index) } })}
            >
              Remove
            </button>
          </div>
        ))}
      </section>

      <section className="mt-10 space-y-3">
        {confirm ? (
          <div className="rounded-3xl bg-gold p-4">
            <p className="font-medium">{confirm === 'reset' ? 'Reset the demo on this device?' : 'Remove every fictional leader?'}</p>
            <div className="mt-3 flex gap-2">
              <PrimaryButton
                onClick={() => {
                  dispatch({ type: confirm === 'reset' ? 'reset' : 'removeSamples' })
                  setConfirm(null)
                }}
              >
                Yes
              </PrimaryButton>
              <GhostButton onClick={() => setConfirm(null)}>Cancel</GhostButton>
            </div>
          </div>
        ) : (
          <>
            <GhostButton onClick={() => setConfirm('reset')}>Reset demo</GhostButton>
            <button type="button" onClick={() => setConfirm('samples')} className="w-full py-2 text-sm text-muted">
              Remove fictional leaders
            </button>
          </>
        )}
      </section>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-paper px-3 py-3 text-center">
      <p className="text-2xl font-semibold">{value ? value.toFixed(1) : '–'}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  )
}

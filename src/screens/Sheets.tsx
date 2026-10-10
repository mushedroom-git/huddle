import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { findByScan, firstName, formatCode, presentPerson, suggestions } from '@/lib/logic'
import { useNav } from '@/state/nav'
import { useMe, useStore } from '@/state/store'
import { Avatar, Icon, PrimaryButton, ScreenHeader, TextArea, TextInput } from '@/components/ui'
import { DEFAULT_VISIBILITY, TOPICS, type Profile, type Visibility, type VisibilityLevel } from '@/lib/types'
import { NetworkGraph } from '@/components/graph'

export function PersonSheet({ id }: { id: string }) {
  const { state, dispatch } = useStore()
  const { me } = useMe()
  const nav = useNav()
  const view = presentPerson(state, me.id, id)
  if (!view) return null
  const reason = suggestions(state, me.id).find((item) => item.personId === id)?.reason
  const status = view.isConnected ? 'Connected' : view.isMet ? 'Said hello' : view.isSelf ? null : 'Open to connect'
  return (
    <div className="sheet-in absolute inset-0 z-40 overflow-y-auto bg-cream px-4 pb-10">
      <ScreenHeader title="" onBack={nav.close} />
      <div className="flex items-center gap-4">
        <Avatar person={view} size={88} />
        <div className="min-w-0">
          <h2 className="text-2xl font-semibold leading-tight tracking-tight">{view.fullName}</h2>
          <p className="mt-1 text-sm leading-snug text-muted">{view.jobTitle}</p>
          <p className="text-sm text-muted">{view.department}</p>
          {status ? (
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-green/15 px-2.5 py-1 text-xs font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-green" />
              {status}
            </p>
          ) : null}
        </div>
      </div>
      {reason ? <p className="mt-4 text-sm leading-snug text-muted">{reason}</p> : null}

      <div className="mt-5 space-y-3">
        {view.workshopGoal ? <ProfileBlock icon="target" label="Goal for this workshop" text={view.workshopGoal} chips={[]} /> : null}
        {view.dayGoal ? <ProfileBlock icon="target" label="Goal of the day" text={view.dayGoal} chips={[]} /> : null}
        {view.lookingFor ? <ProfileBlock icon="target" label="Looking for" text={view.lookingFor} chips={view.lookingTopics} /> : null}
        {view.canOffer ? <ProfileBlock icon="offer" label="Can offer" text={view.canOffer} chips={view.offerTopics} /> : null}
        {view.email ? <ContactRow icon="mail" text={view.email} /> : null}
        {view.linkedinUrl ? <ContactRow icon="share" text="LinkedIn" href={view.linkedinUrl} /> : null}
        {view.mobile ? <ContactRow icon="message" text={view.mobile} /> : null}
      </div>

      <div className="mt-6 space-y-3">
        {view.isSelf ? (
          <PrimaryButton onClick={() => nav.open({ type: 'setup' })}>Edit what I want</PrimaryButton>
        ) : (
          <>
            <PrimaryButton onClick={() => dispatch({ type: 'markMet', id: view.id })} disabled={view.isMet || view.isConnected}>
              <Icon name={view.isConnected ? 'check' : 'send'} className="mr-2 h-4 w-4" />
              {view.isConnected ? 'Connected' : view.isMet ? 'Said hello' : 'Say hello'}
            </PrimaryButton>
            {!view.isConnected ? (
              <button type="button" onClick={() => nav.open({ type: 'scan' })} className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-paper text-[15px] font-semibold ring-1 ring-line">
                <Icon name="qr" className="h-4 w-4" />
                Scan to swap details
              </button>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}

function ProfileBlock({ icon, label, text, chips }: { icon: 'target' | 'offer'; label: string; text: string; chips: string[] }) {
  return (
    <section className="rounded-[24px] bg-paper p-4 ring-1 ring-line">
      <div className="flex gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-green/15">
          <Icon name={icon} className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-muted">{label.toUpperCase()}</p>
          <p className="mt-1 text-[15px] font-semibold leading-snug">{text}</p>
          {chips.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {chips.map((chip) => (
                <span key={chip} className="rounded-full bg-sand px-3 py-1 text-sm">
                  {chip}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

function ContactRow({ icon, text, href }: { icon: 'mail' | 'share' | 'message'; text: string; href?: string }) {
  const body = (
    <>
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sand">
        <Icon name={icon} className="h-4 w-4" />
      </span>
      <span className="min-w-0 truncate text-sm">{text}</span>
    </>
  )
  const className = 'flex items-center gap-3 rounded-[24px] bg-paper px-4 py-3 ring-1 ring-line'
  if (href) {
    return (
      <a href={href} className={className}>
        {body}
      </a>
    )
  }
  return <div className={className}>{body}</div>
}

export function CardSheet() {
  const { state } = useStore()
  const { me, met, profile } = useMe()
  const nav = useNav()
  const [src, setSrc] = useState('')
  const view = presentPerson(state, me.id, me.id)

  useEffect(() => {
    let cancel = false
    QRCode.toDataURL(`gather:${me.id}`, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 560,
      color: { dark: '#021C37', light: '#FFFFFF' },
    }).then((url) => {
      if (!cancel) setSrc(url)
    })
    return () => {
      cancel = true
    }
  }, [me.id])

  const metPeople = met
    .map((id) => presentPerson(state, me.id, id))
    .filter((person): person is NonNullable<typeof person> => Boolean(person))

  return (
    <div className="sheet-in absolute inset-0 z-40 overflow-y-auto bg-cream px-4 pb-10">
      <ScreenHeader title="Let’s connect" onBack={nav.close} />
      <div className="rounded-[32px] bg-navy px-5 py-6 text-white">
        <div className="flex items-center justify-between">
          <img src="/logo.png" alt="" className="h-10 w-10 rounded-xl" />
        </div>
        <div className="mx-auto mt-5 w-fit rounded-3xl bg-white p-3">
          {src ? <img src={src} alt="" className="h-52 w-52" /> : <div className="h-52 w-52" />}
        </div>
        <p className="mt-5 text-center text-3xl font-semibold tracking-[0.18em]">{formatCode(me.shortCode)}</p>
        {view ? (
          <div className="mt-4 flex items-center gap-3">
            <Avatar person={view} size={48} />
            <div>
              <p className="font-semibold">{me.fullName}</p>
              <p className="text-sm text-white/70">{me.jobTitle}</p>
            </div>
          </div>
        ) : null}
        {profile.lookingFor ? <p className="mt-4 text-sm leading-relaxed text-white/80">{profile.lookingFor}</p> : null}
      </div>
      <div className="mt-4">
        <PrimaryButton onClick={() => nav.open({ type: 'scan' })}>Scan their code</PrimaryButton>
      </div>
      {metPeople.length ? (
        <div className="mt-6">
          <p className="text-sm text-muted">People you’ve met</p>
          <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
            {metPeople.slice(0, 12).map((person) => (
              <button key={person.id} type="button" onClick={() => nav.open({ type: 'person', id: person.id })} className="w-16 shrink-0 text-center">
                <Avatar person={person} size={52} />
                <span className="mt-1 block truncate text-xs">{firstName(person.fullName)}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function ScanSheet() {
  const { state, dispatch } = useStore()
  const nav = useNav()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [code, setCode] = useState('')
  const [camera, setCamera] = useState<'pending' | 'on' | 'off'>('pending')
  const finishRef = useRef<(raw: string) => void>(() => {})

  const finish = (raw: string) => {
    const person = findByScan(state, raw)
    if (!person) {
      dispatch({ type: 'toast', text: 'No one with that code.' })
      return
    }
    if (person.id === state.currentUserId) {
      dispatch({ type: 'toast', text: 'That’s your own card.' })
      return
    }
    dispatch({ type: 'connect', id: person.id, method: 'qr' })
    nav.open({ type: 'person', id: person.id })
  }
  finishRef.current = finish

  useEffect(() => {
    let stop = false
    let stream: MediaStream | null = null
    const video = videoRef.current
    ;(async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        if (stop || !video) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        video.srcObject = stream
        await video.play()
        setCamera('on')
        const Detector = window.BarcodeDetector
        if (!Detector) return
        const detector = new Detector({ formats: ['qr_code'] })
        const tick = async () => {
          if (stop || !videoRef.current) return
          try {
            const found = await detector.detect(videoRef.current)
            const raw = found[0]?.rawValue
            if (raw) {
              stop = true
              stream?.getTracks().forEach((track) => track.stop())
              finishRef.current(raw)
              return
            }
          } catch {
            /* keep scanning */
          }
          requestAnimationFrame(() => void tick())
        }
        void tick()
      } catch {
        if (!stop) setCamera('off')
      }
    })()
    return () => {
      stop = true
      stream?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  return (
    <div className="sheet-in absolute inset-0 z-40 overflow-y-auto bg-cream px-4 pb-10">
      <ScreenHeader title="Scan their code" onBack={nav.close} />
      <div className="overflow-hidden rounded-[28px] bg-navy">
        <video ref={videoRef} muted playsInline className={`aspect-[3/4] w-full object-cover ${camera === 'on' ? '' : 'hidden'}`} />
        {camera !== 'on' ? <div className="grid aspect-[3/4] place-items-center px-6 text-center text-sm text-white/70">Camera is off. Type their code instead.</div> : null}
      </div>
      <form
        className="mt-4 space-y-3"
        onSubmit={(event) => {
          event.preventDefault()
          finish(code)
        }}
      >
        <input
          value={formatCode(code)}
          onChange={(event) => setCode(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
          placeholder="Their code"
          autoCapitalize="characters"
          className="w-full rounded-3xl bg-paper px-4 py-4 text-center text-2xl font-semibold tracking-[0.2em] outline-none"
          aria-label="Six character code"
        />
        <PrimaryButton type="submit">Connect</PrimaryButton>
      </form>
    </div>
  )
}

const PRIVACY_ROWS: { key: keyof Visibility; label: string; hint?: string }[] = [
  { key: 'looking', label: 'What I’m looking for' },
  { key: 'offer', label: 'What I can offer' },
  { key: 'topics', label: 'Topics' },
  { key: 'email', label: 'Email' },
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'mobile', label: 'Mobile number', hint: 'Hidden unless you change it.' },
]

export function SetupSheet({ required = false, focus }: { required?: boolean; focus?: 'privacy' }) {
  const { dispatch } = useStore()
  const { me, profile } = useMe()
  const nav = useNav()
  const [draft, setDraft] = useState<Profile>(profile)
  const [linkedin, setLinkedin] = useState(me.linkedinUrl ?? '')

  useEffect(() => {
    if (focus === 'privacy') document.getElementById('privacy')?.scrollIntoView({ block: 'start' })
  }, [focus])

  const toggleTopic = (field: 'lookingTopics' | 'offerTopics', topic: string) => {
    setDraft((current) => {
      const has = current[field].includes(topic)
      const next = has ? current[field].filter((item) => item !== topic) : current[field].length >= 3 ? current[field] : [...current[field], topic]
      return { ...current, [field]: next }
    })
  }

  return (
    <div className="sheet-in absolute inset-0 z-40 overflow-y-auto bg-cream px-4 pb-12">
      <ScreenHeader title={required ? 'A minute, then you’re in' : 'What I want'} onBack={required ? undefined : nav.close} />
      <p className="text-sm text-muted">Pick up to three. One line is enough.</p>
      <TopicBlock label="I’m looking for" topics={draft.lookingTopics} onToggle={(topic) => toggleTopic('lookingTopics', topic)} />
      <TextArea value={draft.lookingFor} maxLength={240} rows={2} placeholder="One line" onChange={(event) => setDraft({ ...draft, lookingFor: event.target.value })} className="mt-3" />
      <TopicBlock label="I can offer" topics={draft.offerTopics} onToggle={(topic) => toggleTopic('offerTopics', topic)} />
      <TextArea value={draft.canOffer} maxLength={240} rows={2} placeholder="One line" onChange={(event) => setDraft({ ...draft, canOffer: event.target.value })} className="mt-3" />
      <label className="mt-5 block">
        <span className="text-sm text-muted">LinkedIn, if you want</span>
        <TextInput value={linkedin} onChange={(event) => setLinkedin(event.target.value)} placeholder="https://" className="mt-2" />
      </label>

      <div id="privacy" className="mt-8">
        <h2 className="text-lg font-semibold">Who can see this</h2>
        <div className="mt-3 space-y-3">
          {PRIVACY_ROWS.map((row) => (
            <div key={row.key} className="rounded-3xl bg-paper px-4 py-3">
              <p className="text-sm font-medium">{row.label}</p>
              {row.hint ? <p className="text-xs text-muted">{row.hint}</p> : null}
              <div className="mt-2 grid grid-cols-3 gap-2">
                {(['everyone', 'met', 'hidden'] as VisibilityLevel[]).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setDraft({ ...draft, visibility: { ...draft.visibility, [row.key]: level } })}
                    className={`rounded-full py-2 text-xs font-semibold ${draft.visibility[row.key] === level ? 'bg-ink text-cream' : 'bg-sand text-ink'}`}
                  >
                    {level === 'everyone' ? 'Everyone' : level === 'met' ? 'Connected' : 'Hidden'}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6">
        <PrimaryButton
          onClick={() => {
            const url = linkedin.trim()
            dispatch({
              type: 'saveProfile',
              profile: { ...draft, visibility: { ...DEFAULT_VISIBILITY, ...draft.visibility }, completedAt: draft.completedAt ?? new Date().toISOString() },
              linkedinUrl: url ? (url.startsWith('http') ? url : `https://${url}`) : null,
            })
            nav.close()
          }}
        >
          Save
        </PrimaryButton>
      </div>
    </div>
  )
}

function TopicBlock({ label, topics, onToggle }: { label: string; topics: string[]; onToggle: (topic: string) => void }) {
  return (
    <div className="mt-5">
      <p className="text-sm font-medium text-muted">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {TOPICS.map((topic) => {
          const on = topics.includes(topic)
          return (
            <button key={topic} type="button" onClick={() => onToggle(topic)} className={`rounded-full px-3 py-1.5 text-sm ${on ? 'bg-ink text-cream' : 'bg-paper text-ink'}`}>
              {topic}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function GraphSheet() {
  const nav = useNav()
  const { state } = useStore()
  const { me, connected, matches } = useMe()
  return (
    <div className="sheet-in absolute inset-0 z-40 overflow-y-auto bg-cream px-4 pb-10">
      <ScreenHeader title="My network" onBack={nav.close} />
      <p className="text-sm text-muted">Solid is connected. Dashed is worth the walk. A quiet wedge is a team you haven’t met.</p>
      <NetworkGraph mode="personal" tone="light" className="mt-2 w-full" onPick={(id) => id !== me.id && nav.open({ type: 'person', id })} />
      <p className="mt-2 text-sm font-semibold">Connected</p>
      <div className="mt-2 flex gap-3 overflow-x-auto">
        {connected.map((id) => {
          const view = presentPerson(state, me.id, id)
          if (!view) return null
          return (
            <button key={id} type="button" onClick={() => nav.open({ type: 'person', id })} className="w-16 shrink-0 text-center">
              <Avatar person={view} />
              <span className="mt-1 block truncate text-xs">{firstName(view.fullName)}</span>
            </button>
          )
        })}
      </div>
      {matches.length ? (
        <>
          <p className="mt-5 text-sm font-semibold">Suggested</p>
          <div className="mt-2 space-y-2">
            {matches.map((match) => {
              const view = presentPerson(state, me.id, match.personId)
              if (!view) return null
              return (
                <button key={match.personId} type="button" onClick={() => nav.open({ type: 'person', id: match.personId })} className="flex w-full items-center gap-3 rounded-3xl bg-paper p-3 text-left">
                  <Avatar person={view} size={40} />
                  <span>
                    <span className="block text-sm font-medium">{match.reason}</span>
                    <span className="text-xs text-muted">{view.fullName}</span>
                  </span>
                </button>
              )
            })}
          </div>
        </>
      ) : null}
    </div>
  )
}

export function CommitmentSheet() {
  const { state, dispatch } = useStore()
  const { me } = useMe()
  const nav = useNav()
  const existing = state.commitments.find((item) => item.participantId === me.id)
  const [text, setText] = useState(existing?.text ?? '')
  return (
    <div className="sheet-in absolute inset-0 z-40 overflow-y-auto bg-cream px-4 pb-10">
      <ScreenHeader title="One action" onBack={nav.close} />
      <TextArea value={text} maxLength={280} rows={4} placeholder="What I’ll take back to my team" onChange={(event) => setText(event.target.value)} />
      <div className="mt-4">
        <PrimaryButton
          onClick={() => {
            dispatch({ type: 'saveCommitment', text })
            nav.close()
          }}
        >
          Put it on the wall
        </PrimaryButton>
      </div>
    </div>
  )
}

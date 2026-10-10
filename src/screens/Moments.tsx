import { useRef, useState, type ChangeEvent } from 'react'
import { firstName } from '@/lib/logic'
import { useNav } from '@/state/nav'
import { resizePhoto } from '@/lib/photos'
import { useMe, useStore } from '@/state/store'
import { Icon } from '@/components/ui'
import type { Moment } from '@/lib/types'

export function PhotoWall() {
  const { state, dispatch } = useStore()
  const { me } = useMe()
  const input = useRef<HTMLInputElement>(null)
  const [caption, setCaption] = useState('')
  const [busy, setBusy] = useState(false)
  const [consentOpen, setConsentOpen] = useState(false)
  const [mineOnly, setMineOnly] = useState(false)
  const [openId, setOpenId] = useState<string | null>(null)
  const [asSelfie, setAsSelfie] = useState(false)
  const agreed = state.photoConsent.includes(me.id)
  const photos = state.photos
    .filter((photo) => !mineOnly || photo.uploaderId === me.id)
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const open = state.photos.find((photo) => photo.id === openId) ?? null

  const start = () => {
    if (agreed) input.current?.click()
    else setConsentOpen(true)
  }

  const onFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = [...(event.target.files ?? [])]
    event.target.value = ''
    if (!files.length) return
    setBusy(true)
    const made: Moment[] = []
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue
      try {
        const sized = await resizePhoto(file)
        made.push({
          id: `m-${crypto.randomUUID()}`,
          uploaderId: me.id,
          caption: caption.trim().slice(0, 80),
          createdAt: new Date().toISOString(),
          thumb: sized.thumb,
          full: sized.full,
        })
      } catch {
        dispatch({ type: 'toast', text: 'One photo could not be read' })
      }
    }
    setBusy(false)
    if (!made.length) return
    setCaption('')
    const selfie = asSelfie && !state.challengeClaims.some((claim) => claim.participantId === me.id && claim.challengeKey === 'selfie' && !claim.revokedAt)
    setAsSelfie(false)
    dispatch({ type: 'addPhotos', photos: made, selfie })
  }

  const selfieClaimed = state.challengeClaims.some((claim) => claim.participantId === me.id && claim.challengeKey === 'selfie' && !claim.revokedAt)

  return (
    <div className="mt-2">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Shared moments</h2>
          <p className="mt-1 text-sm text-muted">Add a photo from today. Everyone can contribute.</p>
        </div>
        <button type="button" onClick={() => setMineOnly((value) => !value)} className="mt-1 shrink-0 text-sm font-semibold text-ink">
          {mineOnly ? 'Everyone' : 'Mine'}
        </button>
      </div>
      <label className="mt-3 block">
        <span className="sr-only">Caption</span>
        <input
          value={caption}
          maxLength={80}
          onChange={(event) => setCaption(event.target.value)}
          placeholder="A caption, if you want one"
          className="w-full rounded-2xl bg-paper px-4 py-3 text-[15px] outline-none ring-1 ring-line placeholder:text-muted/70"
        />
      </label>
      {photos.length ? (
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
          {photos.map((photo) => (
            <button key={photo.id} type="button" onClick={() => setOpenId(photo.id)} className="aspect-square overflow-hidden rounded-[22px] bg-sand">
              <img src={photo.thumb} alt={photo.caption || 'Workshop photo'} className="h-full w-full object-cover" />
            </button>
          ))}
          <AddTile busy={busy} onClick={start} />
        </div>
      ) : (
        <AddTile busy={busy} onClick={start} roomy />
      )}
      {mineOnly && !photos.length ? <p className="mt-3 text-sm text-muted">You haven’t added one yet.</p> : null}
      <input ref={input} type="file" accept="image/*" capture="environment" multiple className="hidden" onChange={onFiles} />

      {consentOpen ? (
        <div className="fade-in absolute inset-0 z-50 flex items-end bg-navy/40" onClick={() => setConsentOpen(false)}>
          <div className="w-full rounded-t-[28px] bg-cream px-5 pb-8 pt-4" onClick={(event) => event.stopPropagation()}>
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line" />
            <h2 className="text-xl font-semibold tracking-tight">Everyone here can see it</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-muted">
              Photos you add stay on the shared album for the workshop. You can take yours down. Organizers can take any down.
            </p>
            {selfieClaimed ? null : (
              <label className="mt-4 flex items-center gap-2 text-sm">
                <input type="checkbox" checked={asSelfie} onChange={(event) => setAsSelfie(event.target.checked)} className="h-4 w-4 accent-[#102033]" />
                This is my selfie with the Executive VP
              </label>
            )}
            <button
              type="button"
              onClick={() => {
                dispatch({ type: 'consentPhotos' })
                setConsentOpen(false)
                input.current?.click()
              }}
              className="mt-5 h-12 w-full rounded-full bg-ink text-[15px] font-semibold text-cream"
            >
              Add a photo
            </button>
            <button type="button" onClick={() => setConsentOpen(false)} className="mt-2 h-12 w-full rounded-full text-[15px] font-semibold text-muted">
              Not now
            </button>
          </div>
        </div>
      ) : null}

      {open ? <Viewer photo={open} onClose={() => setOpenId(null)} /> : null}
    </div>
  )
}

function AddTile({ busy, onClick, roomy = false }: { busy: boolean; onClick: () => void; roomy?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className={`flex flex-col items-center justify-center gap-2 rounded-[22px] border border-dashed border-line bg-paper text-center disabled:opacity-60 ${roomy ? 'mt-4 h-48 w-full' : 'aspect-square'}`}
    >
      <span className="grid h-14 w-14 place-items-center rounded-full bg-green/15 text-ink">
        <Icon name="camera" className="h-6 w-6" />
      </span>
      <span className="text-[15px] font-semibold text-ink">{busy ? 'Adding…' : 'Add a photo'}</span>
      {roomy ? <span className="text-sm text-muted">From your camera roll</span> : null}
    </button>
  )
}

function Viewer({ photo, onClose }: { photo: Moment; onClose: () => void }) {
  const { state, dispatch } = useStore()
  const { me } = useMe()
  const nav = useNav()
  const person = state.participants.find((item) => item.id === photo.uploaderId)
  const canDelete = photo.uploaderId === me.id || me.isOrganizer
  const when = new Date(photo.createdAt)
  const time = Number.isNaN(when.getTime())
    ? ''
    : when.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

  return (
    <div className="fade-in absolute inset-0 z-50 flex flex-col bg-navy text-ink">
      <div className="flex items-center justify-between px-3 pt-[max(0.5rem,env(safe-area-inset-top))]">
        <button type="button" onClick={onClose} className="grid h-11 w-11 place-items-center" aria-label="Close">
          <Icon name="close" className="h-6 w-6" />
        </button>
        {canDelete ? (
          <button
            type="button"
            onClick={() => {
              dispatch({ type: 'deletePhoto', id: photo.id })
              onClose()
            }}
            className="rounded-full px-3 py-2 text-sm font-semibold text-ink underline decoration-green decoration-2 underline-offset-4"
          >
            Delete
          </button>
        ) : (
          <span className="w-11" />
        )}
      </div>
      <button type="button" onClick={onClose} className="flex min-h-0 flex-1 items-center justify-center px-3">
        <img src={photo.full || photo.thumb} alt={photo.caption || 'Workshop photo'} className="max-h-full max-w-full object-contain" />
      </button>
      <div className="px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3">
        {photo.caption ? <p className="text-lg font-medium leading-snug">{photo.caption}</p> : null}
        <p className="mt-1 text-sm text-muted">
          {person ? (
            <button
              type="button"
              className="font-medium text-ink"
              onClick={() => {
                onClose()
                nav.open({ type: 'person', id: person.id })
              }}
            >
              {firstName(person.fullName)}
            </button>
          ) : (
            'Someone in the room'
          )}
          {person ? ` · ${person.department}` : ''}
          {time ? ` · ${time}` : ''}
        </p>
      </div>
    </div>
  )
}

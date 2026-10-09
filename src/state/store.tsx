import { createContext, useContext, useEffect, useReducer, type Dispatch, type ReactNode } from 'react'
import {
  applyImport,
  emptyProfile,
  metIds,
  partnerIds,
  presentPerson,
  quietDepartments,
  suggestions,
  withConnection,
} from '@/lib/logic'
import { createInitialState } from '@/data/seed'
import {
  SEED_VERSION,
  type Announcement,
  type AppState,
  type Commitment,
  type EventConfig,
  type Feedback,
  type PersistedState,
  type Moment,
  type Profile,
  type Question,
  type QuestionComment,
} from '@/lib/types'

const KEY = 'gather-demo-v1'

type Action =
  | { type: 'enter' }
  | { type: 'leave' }
  | { type: 'switch'; id: string }
  | { type: 'toast'; text: string | null }
  | { type: 'saveProfile'; profile: Profile; linkedinUrl: string | null }
  | { type: 'markMet'; id: string }
  | { type: 'connect'; id: string; method: 'qr' | 'mutual_mark' }
  | { type: 'postQuestion'; text: string; anonymous: boolean; topics?: string[] }
  | { type: 'addComment'; questionId: string; text: string }
  | { type: 'toggleVote'; questionId: string }
  | { type: 'moderate'; questionId: string; patch: Partial<Pick<Question, 'isHidden' | 'isAnswered'>> }
  | { type: 'saveCommitment'; text: string }
  | { type: 'submitFeedback'; entry: Omit<Feedback, 'id' | 'createdAt'> }
  | { type: 'announce'; text: string; urgent: boolean; imageUrl: string | null }
  | { type: 'endAnnouncement'; id: string }
  | { type: 'dismissAnnouncement'; id: string }
  | { type: 'patchEvent'; patch: Partial<EventConfig> }
  | { type: 'importCsv'; csv: string }
  | { type: 'addPerson'; fullName: string; jobTitle: string; department: string; email: string }
  | { type: 'removePerson'; id: string }
  | { type: 'removeSamples' }
  | { type: 'dismissInstall' }
  | { type: 'addPhotos'; photos: Moment[]; selfie?: boolean }
  | { type: 'deletePhoto'; id: string }
  | { type: 'claimSelfie'; photoId: string | null }
  | { type: 'revokeClaim'; participantId: string }
  | { type: 'consentPhotos' }
  | { type: 'reset' }

function load(): PersistedState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return createInitialState()
    const parsed = JSON.parse(raw) as PersistedState
    if (!parsed || parsed.seedVersion !== SEED_VERSION) return createInitialState()
    const fresh = createInitialState()
    const freshFaces = new Map(fresh.participants.map((person) => [person.id, person.photoUrl ?? null]))
    const freshTeams = new Map(fresh.participants.map((person) => [person.id, person.team]))
    const freshNotes = new Map(fresh.announcements.map((item) => [item.id, item.imageUrl]))
    return {
      ...fresh,
      ...parsed,
      participants: (parsed.participants ?? fresh.participants).map((person) => ({
        ...person,
        photoUrl: freshFaces.get(person.id) ?? person.photoUrl ?? null,
        team: person.team === undefined ? (freshTeams.get(person.id) ?? null) : person.team,
      })),
      announcements: (parsed.announcements ?? fresh.announcements).map((item) => ({
        ...item,
        imageUrl: item.imageUrl || freshNotes.get(item.id) || null,
      })),
      profiles: Object.fromEntries(
        Object.entries(parsed.profiles ?? fresh.profiles).map(([id, profile]) => {
          const base = emptyProfile(id)
          return [id, { ...base, ...profile, participantId: id, visibility: { ...base.visibility, ...profile.visibility } }]
        }),
      ),
      groups: Array.isArray(parsed.groups) && parsed.groups.length ? parsed.groups : fresh.groups,
      comments: Array.isArray(parsed.comments) ? parsed.comments : [],
      questions: (parsed.questions ?? fresh.questions).map((question) => ({ ...question, topics: question.topics ?? [] })),
      photos: Array.isArray(parsed.photos) ? parsed.photos : [],
      photoConsent: Array.isArray(parsed.photoConsent) ? parsed.photoConsent : [],
      challengeClaims: Array.isArray(parsed.challengeClaims) ? parsed.challengeClaims : fresh.challengeClaims,
    }
  } catch {
    return createInitialState()
  }
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'enter':
      return { ...state, entered: true }
    case 'leave':
      return { ...state, entered: false }
    case 'switch':
      if (!state.participants.some((person) => person.id === action.id)) return state
      return { ...state, currentUserId: action.id }
    case 'toast':
      return { ...state, toast: action.text }
    case 'saveProfile': {
      const profiles = {
        ...state.profiles,
        [action.profile.participantId]: {
          ...action.profile,
          lookingFor: action.profile.lookingFor.slice(0, 240),
          canOffer: action.profile.canOffer.slice(0, 240),
          lookingTopics: action.profile.lookingTopics.slice(0, 3),
          offerTopics: action.profile.offerTopics.slice(0, 3),
          completedAt: action.profile.completedAt ?? new Date().toISOString(),
        },
      }
      const participants = state.participants.map((person) =>
        person.id === action.profile.participantId ? { ...person, linkedinUrl: action.linkedinUrl } : person,
      )
      return { ...state, profiles, participants, toast: 'Saved' }
    }
    case 'markMet': {
      if (action.id === state.currentUserId) return state
      if (state.metMarks.some((mark) => mark.markerId === state.currentUserId && mark.markedId === action.id)) {
        return state
      }
      const metMarks = [
        ...state.metMarks,
        { markerId: state.currentUserId, markedId: action.id, createdAt: new Date().toISOString() },
      ]
      const reciprocal = metMarks.some((mark) => mark.markerId === action.id && mark.markedId === state.currentUserId)
      const connections = reciprocal
        ? withConnection(state.connections, state.currentUserId, action.id, 'mutual_mark')
        : state.connections
      const name = state.participants.find((person) => person.id === action.id)?.fullName.split(' ')[0] ?? 'them'
      return {
        ...state,
        metMarks,
        connections,
        toast: reciprocal ? `You both met. You're connected with ${name}.` : 'Saved privately. Only you can see this.',
      }
    }
    case 'connect': {
      if (action.id === state.currentUserId) return { ...state, toast: 'That’s your own card.' }
      const already = state.connections.some((link) => {
        const [a, b] = state.currentUserId < action.id ? [state.currentUserId, action.id] : [action.id, state.currentUserId]
        return link.participantA === a && link.participantB === b
      })
      const name = state.participants.find((person) => person.id === action.id)?.fullName.split(' ')[0] ?? 'them'
      if (already) return { ...state, toast: `You're already connected with ${name}.` }
      const now = new Date().toISOString()
      const metMarks = [...state.metMarks]
      for (const mark of [
        { markerId: state.currentUserId, markedId: action.id },
        { markerId: action.id, markedId: state.currentUserId },
      ]) {
        if (!metMarks.some((item) => item.markerId === mark.markerId && item.markedId === mark.markedId)) {
          metMarks.push({ ...mark, createdAt: now })
        }
      }
      return {
        ...state,
        metMarks,
        connections: withConnection(state.connections, state.currentUserId, action.id, action.method),
        toast: `Connected with ${name}.`,
      }
    }
    case 'postQuestion': {
      const text = action.text.trim().slice(0, 280)
      if (!text) return state
      if (!state.event.questionsOpen) return { ...state, toast: 'Questions are closed.' }
      const question: Question = {
        id: `q-${Date.now()}`,
        text,
        authorId: action.anonymous ? null : state.currentUserId,
        isAnonymous: action.anonymous,
        isAnswered: false,
        isHidden: false,
        createdAt: new Date().toISOString(),
        topics: (action.topics ?? []).slice(0, 3),
      }
      return { ...state, questions: [question, ...state.questions], toast: 'It’s in the room.' }
    }
    case 'addComment': {
      const text = action.text.trim().slice(0, 240)
      if (!text) return state
      const comment: QuestionComment = {
        id: `c-${Date.now()}`,
        questionId: action.questionId,
        authorId: state.currentUserId,
        text,
        createdAt: new Date().toISOString(),
      }
      return { ...state, comments: [...state.comments, comment], toast: 'Comment added' }
    }
    case 'toggleVote': {
      if (!state.event.questionsOpen) return state
      const exists = state.votes.some((vote) => vote.questionId === action.questionId && vote.voterId === state.currentUserId)
      const votes = exists
        ? state.votes.filter((vote) => !(vote.questionId === action.questionId && vote.voterId === state.currentUserId))
        : [...state.votes, { questionId: action.questionId, voterId: state.currentUserId }]
      return { ...state, votes }
    }
    case 'moderate': {
      const me = state.participants.find((person) => person.id === state.currentUserId)
      if (!me?.isOrganizer) return state
      return {
        ...state,
        questions: state.questions.map((question) =>
          question.id === action.questionId ? { ...question, ...action.patch } : question,
        ),
      }
    }
    case 'saveCommitment': {
      const text = action.text.trim().slice(0, 280)
      if (!text) return state
      const others = state.commitments.filter((item) => item.participantId !== state.currentUserId)
      const commitment: Commitment = { participantId: state.currentUserId, text, createdAt: new Date().toISOString() }
      return { ...state, commitments: [commitment, ...others], toast: 'It’s on the wall.' }
    }
    case 'submitFeedback': {
      if (state.feedbackDone.includes(state.currentUserId)) return { ...state, toast: 'Already sent. Thank you.' }
      const entry: Feedback = { ...action.entry, id: `f-${Date.now()}`, createdAt: new Date().toISOString() }
      return {
        ...state,
        feedback: [...state.feedback, entry],
        feedbackDone: [...state.feedbackDone, state.currentUserId],
        toast: 'Thank you. It’s anonymous.',
      }
    }
    case 'announce': {
      const text = action.text.trim().slice(0, 140)
      if (!text) return state
      const me = state.participants.find((person) => person.id === state.currentUserId)
      if (!me?.isOrganizer) return state
      const announcement: Announcement = {
        id: `ann-${Date.now()}`,
        text,
        imageUrl: action.imageUrl,
        urgent: action.urgent,
        active: true,
        createdAt: new Date().toISOString(),
      }
      return { ...state, announcements: [announcement, ...state.announcements], toast: 'Posted to the room.' }
    }
    case 'endAnnouncement':
      return {
        ...state,
        announcements: state.announcements.map((item) => (item.id === action.id ? { ...item, active: false } : item)),
      }
    case 'dismissAnnouncement':
      if (state.dismissals.some((item) => item.userId === state.currentUserId && item.announcementId === action.id)) {
        return state
      }
      return {
        ...state,
        dismissals: [...state.dismissals, { userId: state.currentUserId, announcementId: action.id }],
      }
    case 'patchEvent':
      return { ...state, event: { ...state.event, ...action.patch } }
    case 'importCsv': {
      const result = applyImport(state, action.csv)
      if ('error' in result) return { ...state, toast: result.error }
      const { added, updated, skipped } = result.report
      return {
        ...state,
        participants: result.participants,
        profiles: result.profiles,
        toast: `Added ${added}, updated ${updated}${skipped ? `, skipped ${skipped}` : ''}.`,
      }
    }
    case 'addPerson': {
      const csv = `full_name,job_title,department,email,mobile\n${csvCell(action.fullName)},${csvCell(action.jobTitle)},${csvCell(action.department)},${csvCell(action.email)},`
      return reducer(state, { type: 'importCsv', csv })
    }
    case 'removePerson': {
      const person = state.participants.find((item) => item.id === action.id)
      if (!person || person.isSample) return state
      const id = action.id
      const participants = state.participants.filter((item) => item.id !== id)
      const profiles = { ...state.profiles }
      delete profiles[id]
      return {
        ...state,
        participants,
        profiles,
        connections: state.connections.filter((link) => link.participantA !== id && link.participantB !== id),
        metMarks: state.metMarks.filter((mark) => mark.markerId !== id && mark.markedId !== id),
        commitments: state.commitments.filter((item) => item.participantId !== id),
        votes: state.votes.filter((vote) => vote.voterId !== id),
        questions: state.questions.map((question) => (question.authorId === id ? { ...question, authorId: null, isAnonymous: true } : question)),
        photos: state.photos.filter((photo) => photo.uploaderId !== id),
        photoConsent: state.photoConsent.filter((personId) => personId !== id),
        challengeClaims: state.challengeClaims.filter((claim) => claim.participantId !== id),
        currentUserId: state.currentUserId === id ? participants[0]?.id ?? state.currentUserId : state.currentUserId,
        toast: 'Removed',
      }
    }
    case 'removeSamples': {
      const sampleIds = new Set(state.participants.filter((person) => person.isSample).map((person) => person.id))
      const participants = state.participants.filter((person) => !person.isSample)
      const profiles: Record<string, Profile> = {}
      for (const person of participants) {
        profiles[person.id] = state.profiles[person.id] ?? emptyProfile(person.id)
      }
      const keep = (id: string | null) => id !== null && !sampleIds.has(id)
      return {
        ...state,
        participants,
        profiles,
        connections: state.connections.filter((link) => !sampleIds.has(link.participantA) && !sampleIds.has(link.participantB)),
        metMarks: state.metMarks.filter((mark) => !sampleIds.has(mark.markerId) && !sampleIds.has(mark.markedId)),
        commitments: state.commitments.filter((item) => !sampleIds.has(item.participantId)),
        votes: state.votes.filter((vote) => !sampleIds.has(vote.voterId)),
        questions: state.questions.map((question) =>
          question.authorId && sampleIds.has(question.authorId) ? { ...question, authorId: null, isAnonymous: true } : question,
        ),
        photos: state.photos.filter((photo) => !sampleIds.has(photo.uploaderId)),
        photoConsent: state.photoConsent.filter((personId) => !sampleIds.has(personId)),
        challengeClaims: state.challengeClaims.filter((claim) => !sampleIds.has(claim.participantId)),
        currentUserId: keep(state.currentUserId) ? state.currentUserId : participants[0]?.id ?? 'alex',
        toast: 'Sample leaders removed',
      }
    }
    case 'dismissInstall':
      return { ...state, installHintDismissed: true }
    case 'consentPhotos':
      if (state.photoConsent.includes(state.currentUserId)) return state
      return { ...state, photoConsent: [...state.photoConsent, state.currentUserId] }
    case 'addPhotos': {
      if (!action.photos.length) return state
      const photoConsent = state.photoConsent.includes(state.currentUserId)
        ? state.photoConsent
        : [...state.photoConsent, state.currentUserId]
      const already = state.challengeClaims.some(
        (claim) => claim.participantId === state.currentUserId && claim.challengeKey === 'selfie' && !claim.revokedAt,
      )
      const claim =
        action.selfie && !already
          ? {
              participantId: state.currentUserId,
              challengeKey: 'selfie' as const,
              photoId: action.photos[0].id,
              createdAt: new Date().toISOString(),
              revokedAt: null,
            }
          : null
      return {
        ...state,
        photos: [...action.photos, ...state.photos],
        photoConsent,
        challengeClaims: claim ? [claim, ...state.challengeClaims] : state.challengeClaims,
        toast: claim ? 'On the wall. It counts for you.' : action.photos.length === 1 ? 'On the wall' : `${action.photos.length} photos on the wall`,
      }
    }
    case 'claimSelfie': {
      const already = state.challengeClaims.some(
        (claim) => claim.participantId === state.currentUserId && claim.challengeKey === 'selfie' && !claim.revokedAt,
      )
      if (already) return state
      return {
        ...state,
        challengeClaims: [
          {
            participantId: state.currentUserId,
            challengeKey: 'selfie',
            photoId: action.photoId,
            createdAt: new Date().toISOString(),
            revokedAt: null,
          },
          ...state.challengeClaims,
        ],
        toast: 'It counts for you.',
      }
    }
    case 'revokeClaim': {
      const me = state.participants.find((person) => person.id === state.currentUserId)
      if (!me?.isOrganizer) return state
      return {
        ...state,
        challengeClaims: state.challengeClaims.map((claim) =>
          claim.participantId === action.participantId && claim.challengeKey === 'selfie' && !claim.revokedAt
            ? { ...claim, revokedAt: new Date().toISOString() }
            : claim,
        ),
        toast: 'Taken off the board.',
      }
    }
    case 'deletePhoto': {
      const photo = state.photos.find((item) => item.id === action.id)
      const me = state.participants.find((person) => person.id === state.currentUserId)
      if (!photo || !me || (photo.uploaderId !== me.id && !me.isOrganizer)) return state
      return {
        ...state,
        photos: state.photos.filter((item) => item.id !== action.id),
        challengeClaims: state.challengeClaims.map((claim) =>
          claim.photoId === action.id && !claim.revokedAt ? { ...claim, revokedAt: new Date().toISOString() } : claim,
        ),
        toast: 'Taken off the wall',
      }
    }
    case 'reset': {
      const fresh = createInitialState()
      return { ...fresh, entered: true, toast: 'Demo reset' }
    }
    default:
      return state
  }
}

function csvCell(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`
  return value
}

function saveDemo(state: PersistedState) {
  const slim = {
    ...state,
    photos: state.photos.map((photo) => ({ ...photo, full: photo.thumb })),
  }
  const attempts = [state, slim, { ...slim, photos: slim.photos.slice(0, 12) }]
  for (const attempt of attempts) {
    try {
      localStorage.setItem(KEY, JSON.stringify(attempt))
      return
    } catch {
      // The demo keeps thumbnails if the album outgrows this browser.
    }
  }
}

const StoreContext = createContext<{ state: AppState; dispatch: Dispatch<Action> } | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => ({ ...load(), toast: null }))

  useEffect(() => {
    const { toast, ...persisted } = state
    void toast
    saveDemo(persisted)
  }, [state])

  useEffect(() => {
    if (!state.toast) return
    const timer = window.setTimeout(() => dispatch({ type: 'toast', text: null }), 2600)
    return () => window.clearTimeout(timer)
  }, [state.toast])

  return <StoreContext.Provider value={{ state, dispatch }}>{children}</StoreContext.Provider>
}

export function useStore() {
  const value = useContext(StoreContext)
  if (!value) throw new Error('Store missing')
  return value
}

export function useMe() {
  const { state } = useStore()
  const me = state.participants.find((person) => person.id === state.currentUserId) ?? state.participants[0]
  const profile = state.profiles[me.id] ?? emptyProfile(me.id)
  return {
    me,
    profile,
    view: presentPerson(state, me.id, me.id),
    matches: suggestions(state, me.id),
    quiet: quietDepartments(state, me.id),
    met: metIds(state, me.id),
    connected: partnerIds(state, me.id),
  }
}

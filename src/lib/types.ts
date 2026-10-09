export const DEPARTMENTS = [
  'Planning',
  'Procurement',
  'Logistics',
  'Manufacturing',
  'Quality',
  'Delivery',
  'Sustainability',
  'Finance',
  'Digital',
  'People',
] as const

export const TOPICS = [
  'AI in operations',
  'Forecasting',
  'Supplier risk',
  'Regional collaboration',
  'Sustainability',
  'Talent',
  'Cost',
  'S&OP',
  'Data & analytics',
  'Change',
  'Quality',
  'Customer delivery',
  'Inventory',
  'Process improvement',
] as const

export type VisibilityLevel = 'everyone' | 'met' | 'hidden'

export type Visibility = {
  looking: VisibilityLevel
  offer: VisibilityLevel
  topics: VisibilityLevel
  email: VisibilityLevel
  linkedin: VisibilityLevel
  mobile: VisibilityLevel
}

export const DEFAULT_VISIBILITY: Visibility = {
  looking: 'everyone',
  offer: 'everyone',
  topics: 'everyone',
  email: 'everyone',
  linkedin: 'everyone',
  mobile: 'hidden',
}

export type Participant = {
  id: string
  email: string
  fullName: string
  jobTitle: string
  department: string
  mobile: string | null
  linkedinUrl: string | null
  isOrganizer: boolean
  isSample: boolean
  shortCode: string
  photoUrl?: string | null
  /** Kept for an older demo. The challenge ranks people, not tables. */
  team: string | null
}

/** A working group for the day: people, a Teams room, and a session pack. */
export type WorkshopGroup = {
  id: string
  code: string
  title: string
  brief: string
  memberIds: string[]
  challengerIds: string[]
  scribeId: string | null
}

export type Profile = {
  participantId: string
  lookingFor: string
  canOffer: string
  lookingTopics: string[]
  offerTopics: string[]
  /** Short line on the personal banner. */
  banner: string
  /** What they want from the workshop, shown on the banner when visible. */
  workshopGoal: string
  /** One goal for today. Hidden from others when goalsVisible is false. */
  dayGoal: string
  goalsVisible: boolean
  visibility: Visibility
  discoverable: boolean
  completedAt: string | null
}

export type Connection = {
  id: string
  participantA: string
  participantB: string
  createdAt: string
  method: 'qr' | 'mutual_mark'
}

export type MetMark = {
  markerId: string
  markedId: string
  createdAt: string
}

export type Question = {
  id: string
  text: string
  authorId: string | null
  isAnonymous: boolean
  isAnswered: boolean
  isHidden: boolean
  createdAt: string
  topics: string[]
}

export type QuestionComment = {
  id: string
  questionId: string
  authorId: string
  text: string
  createdAt: string
}

export type QuestionVote = {
  questionId: string
  voterId: string
}

export type Commitment = {
  participantId: string
  text: string
  createdAt: string
}

export type Feedback = {
  id: string
  metScore: number
  timeScore: number
  takeawayScore: number
  best: string
  change: string
  createdAt: string
}

export type Announcement = {
  id: string
  text: string
  imageUrl: string | null
  urgent: boolean
  active: boolean
  createdAt: string
}

export type Dismissal = {
  userId: string
  announcementId: string
}

export type AgendaKind = 'session' | 'break' | 'qa' | 'food'

export type AgendaItem = {
  id: string
  time: string
  end: string
  title: string
  detail: string
  kind: AgendaKind
  /** Workshop date this session belongs to, such as "15". */
  day?: string
  room?: string
  speakerIds?: string[]
}

export type LogisticsIcon = 'pin' | 'bus' | 'wifi' | 'food' | 'shirt' | 'user'

export type LogisticsItem = {
  id: string
  icon: LogisticsIcon
  title: string
  body: string
  extra: string
}

export type EventConfig = {
  title: string
  dateLabel: string
  draft: boolean
  questionsOpen: boolean
  feedbackOpen: boolean
  credits: string[]
  demoClock: boolean
  demoTime: string
  agenda: AgendaItem[]
  logistics: LogisticsItem[]
}

export type Moment = {
  id: string
  uploaderId: string
  caption: string
  createdAt: string
  thumb: string
  full: string
}

export type ChallengeClaim = {
  participantId: string
  challengeKey: 'selfie'
  photoId: string | null
  createdAt: string
  revokedAt: string | null
}

export type ImportReport = {
  added: number
  updated: number
  skipped: number
  note: string
}

/** Everything the demo remembers. Components never read this raw for another person. */
export type PersistedState = {
  seedVersion: number
  participants: Participant[]
  groups: WorkshopGroup[]
  profiles: Record<string, Profile>
  connections: Connection[]
  metMarks: MetMark[]
  questions: Question[]
  comments: QuestionComment[]
  votes: QuestionVote[]
  commitments: Commitment[]
  feedback: Feedback[]
  announcements: Announcement[]
  dismissals: Dismissal[]
  event: EventConfig
  currentUserId: string
  entered: boolean
  feedbackDone: string[]
  installHintDismissed: boolean
  photos: Moment[]
  photoConsent: string[]
  challengeClaims: ChallengeClaim[]
}

export type AppState = PersistedState & {
  toast: string | null
}

export type PersonView = {
  id: string
  fullName: string
  jobTitle: string
  department: string
  initials: string
  color: string
  photoUrl: string | null
  lookingFor: string | null
  canOffer: string | null
  lookingTopics: string[]
  offerTopics: string[]
  workshopGoal: string | null
  dayGoal: string | null
  email: string | null
  linkedinUrl: string | null
  mobile: string | null
  isSelf: boolean
  isConnected: boolean
  isMet: boolean
  isOrganizer: boolean
}

export type Suggestion = {
  personId: string
  score: number
  reason: string
  gap: boolean
}

export const SEED_VERSION = 5

export const DEMO_LENSES = ['alex', 'maria', 'priya', 'james', 'carla', 'david', 'nina'] as const

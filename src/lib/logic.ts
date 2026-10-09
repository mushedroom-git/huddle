import {
  DEFAULT_VISIBILITY,
  DEPARTMENTS,
  type AgendaItem,
  type Connection,
  type EventConfig,
  type ImportReport,
  type Participant,
  type PersistedState,
  type PersonView,
  type Profile,
  type Suggestion,
  type VisibilityLevel,
} from '@/lib/types'

const AVATAR_COLORS = [
  '#021C37',
  '#0E6B6B',
  '#8C3A4B',
  '#A56A2A',
  '#1F4E79',
  '#3D5A3D',
  '#6B4C7A',
  '#8A4B2F',
  '#1E4D4A',
  '#3E4C6B',
  '#7A3E5C',
  '#4A5E2F',
]

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function hash(value: string): number {
  let h = 2166136261
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] || fullName
}

export function initials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] ?? ''
  const second = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : parts[0]?.[1] ?? ''
  return (first + second).toUpperCase()
}

export function avatarColor(id: string): string {
  return AVATAR_COLORS[hash(id) % AVATAR_COLORS.length]
}

export function makeShortCode(seed: string, taken: Set<string>): string {
  const start = hash(seed) || 1
  for (let i = 0; i < 5000; i++) {
    let x = (start + i * 997) >>> 0
    let code = ''
    for (let k = 0; k < 6; k++) {
      code += CODE_ALPHABET[x % CODE_ALPHABET.length]
      x = Math.floor(x / CODE_ALPHABET.length)
    }
    if (!taken.has(code)) {
      taken.add(code)
      return code
    }
  }
  throw new Error('Could not make a short code')
}

export function emptyProfile(participantId: string): Profile {
  return {
    participantId,
    lookingFor: '',
    canOffer: '',
    lookingTopics: [],
    offerTopics: [],
    banner: '',
    workshopGoal: '',
    dayGoal: '',
    goalsVisible: true,
    visibility: { ...DEFAULT_VISIBILITY },
    discoverable: true,
    completedAt: null,
  }
}

export function canSee(level: VisibilityLevel, isSelf: boolean, isConnected: boolean): boolean {
  if (isSelf) return true
  if (level === 'everyone') return true
  if (level === 'met') return isConnected
  return false
}

export function personById(state: PersistedState, id: string): Participant | undefined {
  return state.participants.find((person) => person.id === id)
}

export function isConnected(state: PersistedState, a: string, b: string): boolean {
  const [left, right] = a < b ? [a, b] : [b, a]
  return state.connections.some((link) => link.participantA === left && link.participantB === right)
}

export function partnerIds(state: PersistedState, id: string): string[] {
  const ids: string[] = []
  for (const link of state.connections) {
    if (link.participantA === id) ids.push(link.participantB)
    else if (link.participantB === id) ids.push(link.participantA)
  }
  return ids
}

export function metIds(state: PersistedState, id: string): string[] {
  return state.metMarks.filter((mark) => mark.markerId === id).map((mark) => mark.markedId)
}

export function isMet(state: PersistedState, markerId: string, markedId: string): boolean {
  return state.metMarks.some((mark) => mark.markerId === markerId && mark.markedId === markedId)
}

export function withConnection(
  connections: Connection[],
  a: string,
  b: string,
  method: Connection['method'],
): Connection[] {
  if (a === b) return connections
  const [participantA, participantB] = a < b ? [a, b] : [b, a]
  if (connections.some((link) => link.participantA === participantA && link.participantB === participantB)) {
    return connections
  }
  return [
    ...connections,
    {
      id: `${participantA}:${participantB}`,
      participantA,
      participantB,
      createdAt: new Date().toISOString(),
      method,
    },
  ]
}

export function presentPerson(state: PersistedState, viewerId: string, personId: string): PersonView | null {
  const person = personById(state, personId)
  if (!person) return null
  const profile = state.profiles[personId] ?? emptyProfile(personId)
  const self = viewerId === personId
  const connected = self || isConnected(state, viewerId, personId)
  const see = (level: VisibilityLevel) => canSee(level, self, connected)
  return {
    id: person.id,
    fullName: person.fullName,
    jobTitle: person.jobTitle,
    department: person.department,
    initials: initials(person.fullName),
    color: avatarColor(person.id),
    photoUrl: person.photoUrl || null,
    lookingFor: see(profile.visibility.looking) ? profile.lookingFor : null,
    canOffer: see(profile.visibility.offer) ? profile.canOffer : null,
    lookingTopics: see(profile.visibility.topics) ? profile.lookingTopics : [],
    offerTopics: see(profile.visibility.topics) ? profile.offerTopics : [],
    workshopGoal: self || profile.goalsVisible ? profile.workshopGoal || null : null,
    dayGoal: self || profile.goalsVisible ? profile.dayGoal || null : null,
    email: see(profile.visibility.email) ? person.email : null,
    linkedinUrl: see(profile.visibility.linkedin) ? person.linkedinUrl : null,
    mobile: see(profile.visibility.mobile) ? person.mobile : null,
    isSelf: self,
    isConnected: !self && isConnected(state, viewerId, personId),
    isMet: !self && isMet(state, viewerId, personId),
    isOrganizer: person.isOrganizer,
  }
}

function matchScore(
  state: PersistedState,
  me: Participant,
  them: Participant,
): { score: number; reason: string | null } {
  const mine = state.profiles[me.id]
  const theirs = state.profiles[them.id]
  if (!mine || !theirs) return { score: 0, reason: null }
  const connected = isConnected(state, me.id, them.id)
  if (!canSee(theirs.visibility.topics, false, connected)) return { score: 0, reason: null }

  let score = 0
  let best: { kind: 'want' | 'offer'; topic: string; points: number } | null = null
  for (const topic of mine.lookingTopics) {
    if (!theirs.offerTopics.includes(topic)) continue
    score += 3
    if (!best || best.points < 3) best = { kind: 'want', topic, points: 3 }
  }
  for (const topic of mine.offerTopics) {
    if (!theirs.lookingTopics.includes(topic)) continue
    score += 2
    if (!best || best.points < 2) best = { kind: 'offer', topic, points: 2 }
  }
  if (score > 0 && them.department !== me.department) score += 1
  if (!best || score <= 0) return { score: 0, reason: null }
  const name = firstName(them.fullName)
  const reason =
    best.kind === 'want'
      ? `You want ${best.topic}. ${name} offers it.`
      : `${name} wants ${best.topic}. You offer it.`
  return { score, reason }
}

export function allDepartments(state: PersistedState): string[] {
  const present = new Set(state.participants.map((person) => person.department))
  const known = DEPARTMENTS.filter((department) => present.has(department))
  const extras = [...present].filter((department) => !(DEPARTMENTS as readonly string[]).includes(department)).sort()
  return [...known, ...extras]
}

export function suggestions(state: PersistedState, viewerId: string): Suggestion[] {
  const me = personById(state, viewerId)
  const mine = state.profiles[viewerId]
  if (!me || !mine?.completedAt) return []
  const acted = new Set([...partnerIds(state, viewerId), ...metIds(state, viewerId)])
  const candidates = state.participants.filter((person) => {
    if (person.id === viewerId || acted.has(person.id)) return false
    const profile = state.profiles[person.id]
    return Boolean(profile?.completedAt && profile.discoverable)
  })

  const ranked = candidates
    .map((person) => {
      const { score, reason } = matchScore(state, me, person)
      return score > 0 && reason ? { personId: person.id, score, reason, gap: false } : null
    })
    .filter((item): item is Suggestion => item !== null)
    .sort((a, b) => b.score - a.score || nameOf(state, a.personId).localeCompare(nameOf(state, b.personId)))

  const picked = ranked.slice(0, 5)
  if (picked.length < 5) {
    const reached = new Set<string>([me.department])
    for (const id of metIds(state, viewerId)) {
      const person = personById(state, id)
      if (person) reached.add(person.department)
    }
    for (const department of allDepartments(state)) {
      if (picked.length >= 5 || reached.has(department)) continue
      const person = candidates
        .filter((candidate) => candidate.department === department && !picked.some((item) => item.personId === candidate.id))
        .sort((a, b) => a.fullName.localeCompare(b.fullName))[0]
      if (!person) continue
      picked.push({
        personId: person.id,
        score: 0,
        reason: `From ${department}, a team you haven't met yet.`,
        gap: true,
      })
    }
  }
  return picked.slice(0, 5)
}

/** Topic overlap, scaled the way the room talks about a match. */
export function matchPercent(score: number): number {
  if (score <= 0) return 0
  return Math.min(99, Math.round((score / 16) * 100))
}

function nameOf(state: PersistedState, id: string): string {
  return personById(state, id)?.fullName ?? id
}

export function quietDepartments(state: PersistedState, viewerId: string): string[] {
  const me = personById(state, viewerId)
  if (!me) return []
  const reached = new Set<string>([me.department])
  for (const id of metIds(state, viewerId)) {
    const person = personById(state, id)
    if (person) reached.add(person.department)
  }
  return allDepartments(state).filter((department) => !reached.has(department))
}

export function orderedDepartments(state: PersistedState, viewerId: string | null): string[] {
  const alpha = allDepartments(state).slice().sort((a, b) => a.localeCompare(b))
  if (!viewerId) return alpha
  const mine = personById(state, viewerId)?.department
  if (!mine) return alpha
  const index = alpha.indexOf(mine)
  if (index < 0) return alpha
  return [...alpha.slice(index), ...alpha.slice(0, index)]
}

export function toMinutes(value: string): number {
  const [hours, minutes] = value.split(':').map((part) => Number(part))
  return (hours || 0) * 60 + (minutes || 0)
}

export function clockMinutes(event: EventConfig, now = new Date()): number {
  if (event.demoClock && event.demoTime) return toMinutes(event.demoTime)
  return now.getHours() * 60 + now.getMinutes()
}

export type Phase = 'past' | 'now' | 'next' | 'later'

export function agendaPhases(items: AgendaItem[], minutes: number): Map<string, Phase> {
  const phases = new Map<string, Phase>()
  let nextId: string | null = null
  for (const item of items) {
    const start = toMinutes(item.time)
    let end = toMinutes(item.end)
    if (end <= start) end = start + 45
    if (minutes >= start && minutes < end) phases.set(item.id, 'now')
    else if (minutes >= end) phases.set(item.id, 'past')
    else {
      if (!nextId) nextId = item.id
      phases.set(item.id, 'later')
    }
  }
  if (nextId) phases.set(nextId, 'next')
  return phases
}

export function spotlight(items: AgendaItem[], phases: Map<string, Phase>): { now: AgendaItem | null; next: AgendaItem | null } {
  let now: AgendaItem | null = null
  let next: AgendaItem | null = null
  for (const item of items) {
    const phase = phases.get(item.id)
    if (phase === 'now') now = item
    if (phase === 'next') next = item
  }
  return { now, next }
}

export function voteCount(state: PersistedState, questionId: string): number {
  return state.votes.reduce((count, vote) => (vote.questionId === questionId ? count + 1 : count), 0)
}

export function hasVoted(state: PersistedState, questionId: string, voterId: string): boolean {
  return state.votes.some((vote) => vote.questionId === questionId && vote.voterId === voterId)
}

export function findByScan(state: PersistedState, raw: string): Participant | undefined {
  const text = raw.trim()
  const fromQr = text.match(/gather:([a-z0-9-]+)/i)
  if (fromQr) {
    const id = fromQr[1].toLowerCase()
    return state.participants.find((person) => person.id === id)
  }
  const compact = text.toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (compact.length < 6) return undefined
  const code = compact.slice(0, 6)
  return state.participants.find((person) => person.shortCode === code)
}

export function matchesQuery(state: PersistedState, viewerId: string, personId: string, query: string): boolean {
  const view = presentPerson(state, viewerId, personId)
  if (!view) return false
  const person = personById(state, personId)
  const haystack = [
    view.fullName,
    view.jobTitle,
    view.department,
    person?.team ?? '',
    view.lookingFor ?? '',
    view.canOffer ?? '',
    ...view.lookingTopics,
    ...view.offerTopics,
  ]
    .join(' ')
    .toLowerCase()
  return haystack.includes(query.trim().toLowerCase())
}

export function parseCsv(text: string): { headers: string[]; rows: string[][] } {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false
  const source = text.replace(/^\uFEFF/, '')
  for (let i = 0; i < source.length; i++) {
    const char = source[i]
    if (quoted) {
      if (char === '"') {
        if (source[i + 1] === '"') {
          cell += '"'
          i++
        } else quoted = false
      } else cell += char
    } else if (char === '"') quoted = true
    else if (char === ',') {
      row.push(cell)
      cell = ''
    } else if (char === '\n') {
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
    } else if (char !== '\r') cell += char
  }
  if (cell.length || row.length) {
    row.push(cell)
    rows.push(row)
  }
  const kept = rows.filter((line) => line.some((value) => value.trim()))
  if (!kept.length) return { headers: [], rows: [] }
  return {
    headers: kept[0].map((header) => header.trim().toLowerCase()),
    rows: kept.slice(1),
  }
}

function uniqueId(name: string, people: Participant[]): string {
  const base = name.toLowerCase().split(/\s+/)[0]?.replace(/[^a-z0-9]/g, '') || 'person'
  const taken = new Set(people.map((person) => person.id))
  let id = base
  let n = 2
  while (taken.has(id)) id = `${base}${n++}`
  return id
}

export function applyImport(
  state: PersistedState,
  csv: string,
): { participants: Participant[]; profiles: Record<string, Profile>; report: ImportReport } | { error: string } {
  const { headers, rows } = parseCsv(csv)
  for (const header of ['full_name', 'job_title', 'department', 'email']) {
    if (!headers.includes(header)) {
      return { error: 'Use a header row: full_name, job_title, department, email, mobile' }
    }
  }
  const column = (name: string) => headers.indexOf(name)
  const participants = state.participants.map((person) => ({ ...person }))
  const profiles = { ...state.profiles }
  const taken = new Set(participants.map((person) => person.shortCode))
  let added = 0
  let updated = 0
  let skipped = 0
  for (const row of rows) {
    const email = (row[column('email')] ?? '').trim().toLowerCase()
    const fullName = (row[column('full_name')] ?? '').trim()
    if (!email.includes('@') || !fullName) {
      skipped++
      continue
    }
    const jobTitle = (row[column('job_title')] ?? '').trim()
    const department = (row[column('department')] ?? '').trim() || 'Planning'
    const mobile = column('mobile') >= 0 ? (row[column('mobile')] ?? '').trim() : ''
    const team = column('team') >= 0 ? (row[column('team')] ?? '').trim() : ''
    const existing = participants.find((person) => person.email.toLowerCase() === email)
    if (existing) {
      existing.fullName = fullName
      existing.jobTitle = jobTitle || existing.jobTitle
      existing.department = department || existing.department
      if (mobile) existing.mobile = mobile
      if (column('team') >= 0) existing.team = team || null
      updated++
      continue
    }
    const id = uniqueId(fullName, participants)
    participants.push({
      id,
      email,
      fullName,
      jobTitle,
      department,
      mobile: mobile || null,
      linkedinUrl: null,
      isOrganizer: false,
      isSample: false,
      shortCode: makeShortCode(email, taken),
      team: team || null,
    })
    profiles[id] = emptyProfile(id)
    added++
  }
  return {
    participants,
    profiles,
    report: {
      added,
      updated,
      skipped,
      note: 'Headshots stay with the directory import. This file updates names and roles only.',
    },
  }
}

export type GraphNode = {
  id: string
  x: number
  y: number
  r: number
  kind: 'me' | 'connected' | 'suggested' | 'other'
  department: string
}

export type GraphWedge = {
  department: string
  start: number
  end: number
  quiet: boolean
  labelX: number
  labelY: number
}

export function layoutGraph(state: PersistedState, viewerId: string | null, mode: 'room' | 'personal', size = 360) {
  const cx = size / 2
  const cy = size / 2
  const departments = mode === 'personal' ? orderedDepartments(state, viewerId) : orderedDepartments(state, null)
  const wedge = (Math.PI * 2) / Math.max(departments.length, 1)
  const startAngle = -Math.PI / 2
  const quiet = new Set(viewerId ? quietDepartments(state, viewerId) : [])
  const suggested = new Set(viewerId ? suggestions(state, viewerId).map((item) => item.personId) : [])
  const connected = new Set(viewerId ? partnerIds(state, viewerId) : [])
  const nodes: GraphNode[] = []
  const wedges: GraphWedge[] = departments.map((department, index) => {
    const mid = startAngle + wedge * (index + 0.5)
    const labelR = size * 0.46
    return {
      department,
      start: startAngle + wedge * index,
      end: startAngle + wedge * (index + 1),
      quiet: quiet.has(department),
      labelX: cx + Math.cos(mid) * labelR,
      labelY: cy + Math.sin(mid) * labelR,
    }
  })

  if (mode === 'personal' && viewerId) {
    nodes.push({ id: viewerId, x: cx, y: cy, r: 15, kind: 'me', department: personById(state, viewerId)?.department ?? '' })
  }

  departments.forEach((department, index) => {
    const people = state.participants
      .filter((person) => person.department === department && person.id !== viewerId)
      .sort((a, b) => hash(a.id) - hash(b.id) || a.id.localeCompare(b.id))
    people.forEach((person, personIndex) => {
      const t = people.length === 1 ? 0.5 : (personIndex + 0.5) / people.length
      const angle = startAngle + index * wedge + wedge * (0.14 + 0.72 * t)
      let kind: GraphNode['kind'] = 'other'
      let radius = size * (mode === 'room' ? 0.32 : 0.31)
      let r = mode === 'room' ? 5.5 : 3.6
      if (mode === 'personal') {
        if (connected.has(person.id)) {
          kind = 'connected'
          radius = size * 0.2
          r = 7
        } else if (suggested.has(person.id)) {
          kind = 'suggested'
          radius = size * 0.38
          r = 6.5
        }
      }
      nodes.push({
        id: person.id,
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
        r,
        kind,
        department,
      })
    })
  })

  const byId = new Map(nodes.map((node) => [node.id, node]))
  const links = state.connections
    .filter((link) => byId.has(link.participantA) && byId.has(link.participantB))
    .filter((link) => (mode === 'personal' && viewerId ? link.participantA === viewerId || link.participantB === viewerId : true))
    .map((link) => ({ a: link.participantA, b: link.participantB }))

  return { nodes, links, wedges, byId }
}

export function privacySummary(profile: Profile): string {
  const hidden = (Object.entries(profile.visibility) as [keyof Profile['visibility'], VisibilityLevel][])
    .filter(([, level]) => level === 'hidden')
    .map(([key]) => key)
  const metOnly = (Object.entries(profile.visibility) as [keyof Profile['visibility'], VisibilityLevel][])
    .filter(([, level]) => level === 'met')
    .map(([key]) => key)
  if (hidden.length === 1 && hidden[0] === 'mobile' && metOnly.length === 0) {
    return 'Visible to the room. Mobile stays hidden.'
  }
  const parts: string[] = []
  if (metOnly.length) parts.push('Some details open after you connect')
  if (hidden.some((key) => key !== 'mobile')) parts.push('A few details are hidden')
  if (hidden.includes('mobile')) parts.push('Mobile stays hidden')
  return parts.join('. ') || 'Visible to the room.'
}

export function formatCode(code: string): string {
  const clean = code.replace(/\s/g, '')
  return clean.length > 3 ? `${clean.slice(0, 3)} ${clean.slice(3)}` : clean
}

import { partnerIds, personById } from '@/lib/logic'
import type { ChallengeClaim, PersistedState, Profile } from '@/lib/types'

export type ChallengeKey = 'profile' | 'match' | 'department' | 'selfie' | 'question' | 'photos' | 'commitment' | 'feedback'

export type ChallengeItem = {
  key: ChallengeKey
  title: string
  points: number
  cap: number
  done: number
  earned: number
}

export type PersonStanding = {
  id: string
  points: number
  rank: number
}

export type ChallengeView = {
  items: ChallengeItem[]
  earned: number
  possible: number
  next: ChallengeItem | null
  rank: number
  standing: PersonStanding[]
}

const POSSIBLE = 70

export function challengeFor(state: PersistedState, viewerId: string): ChallengeView {
  const earnedBy = new Map(state.participants.map((person) => [person.id, scorePerson(state, person.id).earned]))
  const ranked = state.participants
    .map((person) => ({
      id: person.id,
      points: earnedBy.get(person.id) ?? 0,
      rank: 0,
      name: person.fullName,
    }))
    .sort((a, b) => b.points - a.points || a.name.localeCompare(b.name))
  let last = Number.NaN
  let rank = 0
  ranked.forEach((row, index) => {
    if (row.points !== last) {
      rank = index + 1
      last = row.points
    }
    row.rank = rank
  })
  const standing = ranked.map(({ id, points, rank: place }) => ({ id, points, rank: place }))
  const mine = scorePerson(state, viewerId)
  return {
    ...mine,
    possible: POSSIBLE,
    rank: standing.find((row) => row.id === viewerId)?.rank ?? standing.length,
    standing,
  }
}

export function placeLabel(rank: number): string {
  const teen = rank % 100
  if (teen >= 11 && teen <= 13) return `${rank}th`
  if (rank % 10 === 1) return `${rank}st`
  if (rank % 10 === 2) return `${rank}nd`
  if (rank % 10 === 3) return `${rank}rd`
  return `${rank}th`
}

function scorePerson(state: PersistedState, id: string): { items: ChallengeItem[]; earned: number; next: ChallengeItem | null } {
  const profile = state.profiles[id]
  const partners = partnerIds(state, id)
  const me = personById(state, id)
  let matches = 0
  const departments = new Set<string>()
  for (const partnerId of partners) {
    const theirs = state.profiles[partnerId]
    const partner = personById(state, partnerId)
    if (profile && theirs && topicsMatch(profile, theirs)) matches += 1
    if (partner && me && partner.department !== me.department) departments.add(partner.department)
  }
  const selfie = state.challengeClaims.some(
    (claim) => claim.participantId === id && claim.challengeKey === 'selfie' && !claim.revokedAt,
  )
  const asked = state.questions.some((question) => question.authorId === id)
  const photos = state.photos.filter((photo) => photo.uploaderId === id).length
  const committed = state.commitments.some((item) => item.participantId === id)

  const items: ChallengeItem[] = [
    item('profile', 'Fill in your profile', 5, 1, profile?.completedAt ? 1 : 0, 'each'),
    item('match', 'Connect with a match', 5, 3, matches, 'each'),
    item('department', 'Meet a new department', 3, 5, departments.size, 'each'),
    item('selfie', 'Selfie with the Executive VP', 10, 1, selfie ? 1 : 0, 'each'),
    item('question', 'Ask a question', 5, 1, asked ? 1 : 0, 'each'),
    item('photos', 'Post three photos', 5, 3, photos, 'once'),
    item('commitment', 'Add your commitment', 10, 1, committed ? 1 : 0, 'each'),
    item('feedback', 'Submit feedback', 5, 1, state.feedbackDone.includes(id) ? 1 : 0, 'each'),
  ]
  const earned = items.reduce((sum, entry) => sum + entry.earned, 0)
  return { items, earned, next: items.find((entry) => entry.done < entry.cap) ?? null }
}

function item(key: ChallengeKey, title: string, points: number, cap: number, raw: number, mode: 'each' | 'once'): ChallengeItem {
  const done = Math.min(cap, raw)
  const earned = mode === 'once' ? (raw >= cap ? points : 0) : done * points
  return { key, title, points, cap, done, earned }
}

function topicsMatch(mine: Profile, theirs: Profile): boolean {
  return (
    mine.lookingTopics.some((topic) => theirs.offerTopics.includes(topic)) ||
    mine.offerTopics.some((topic) => theirs.lookingTopics.includes(topic))
  )
}

export function activeSelfie(claims: ChallengeClaim[], participantId: string): ChallengeClaim | undefined {
  return claims.find((claim) => claim.participantId === participantId && claim.challengeKey === 'selfie' && !claim.revokedAt)
}

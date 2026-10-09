import { challengeFor } from '@/lib/challenge'
import { emptyProfile, makeShortCode, partnerIds, presentPerson, suggestions } from '@/lib/logic'
import {
  DEFAULT_VISIBILITY,
  SEED_VERSION,
  type ChallengeClaim,
  type Commitment,
  type Feedback,
  type MetMark,
  type PersistedState,
  type Profile,
  type Question,
  type QuestionComment,
  type Visibility,
  type WorkshopGroup,
} from '@/lib/types'

type Draft = {
  id: string
  fullName: string
  jobTitle: string
  department: string
  lookingTopics: string[]
  offerTopics: string[]
  lookingFor: string
  canOffer: string
}

function person(
  id: string,
  fullName: string,
  jobTitle: string,
  department: string,
  lookingTopics: string[],
  offerTopics: string[],
  lookingFor: string,
  canOffer: string,
): Draft {
  return { id, fullName, jobTitle, department, lookingTopics, offerTopics, lookingFor, canOffer }
}

const PEOPLE: Draft[] = [
  person('alex', 'Alex Rivera', 'Director, Supply Planning', 'Planning', ['AI in operations', 'Regional collaboration'], ['Forecasting', 'S&OP'], 'Where AI actually helps planning.', 'An S&OP rhythm people trust.'),
  person('maria', 'Maria Santos', 'VP, Global Supply Chain', 'Logistics', ['Talent', 'Regional collaboration'], ['Customer delivery', 'Process improvement'], 'Leaders who can work across regions.', 'A delivery network that holds under pressure.'),
  person('david', 'David Chen', 'Head of Operations Excellence', 'Manufacturing', ['Process improvement', 'Cost'], ['AI in operations', 'Quality'], 'AI that belongs on the floor, not a slide.', 'Cleaner processes and fewer defects.'),
  person('priya', 'Priya Nair', 'Director, Digital & Innovation', 'Digital', ['Forecasting', 'Change'], ['AI in operations', 'Data & analytics'], 'Planners who will actually use a new tool.', 'AI your planning team will open on Monday.'),
  person('james', 'James Wilson', 'Director, Procurement', 'Procurement', ['Supplier risk', 'Sustainability'], ['Cost', 'Supplier risk'], 'Suppliers we can still count on.', 'Cost moves that do not add risk.'),
  person('carla', 'Carla Reyes', 'Head of Sustainability', 'Sustainability', ['Supplier risk', 'Data & analytics'], ['Sustainability', 'Change'], 'A true read on supplier emissions.', 'Sustainability your buyers can run with.'),
  person('lena', 'Lena Hoffmann', 'S&OP Lead', 'Planning', ['Data & analytics', 'Inventory'], ['S&OP', 'Forecasting'], 'One inventory picture everyone trusts.', 'Decisions the S&OP actually records.'),
  person('omar', 'Omar Farouk', 'Category Lead, Electronics', 'Procurement', ['Supplier risk', 'Cost'], ['Supplier risk', 'Regional collaboration'], 'Earlier warning when a supplier wobbles.', 'A risk view the regions can share.'),
  person('sofia', 'Sofia Almeida', 'Head of Customer Delivery', 'Delivery', ['Forecasting', 'Inventory'], ['Customer delivery', 'Process improvement'], 'Fewer surprises between promise and delivery.', 'A calm promise to the customer.'),
  person('noah', 'Noah Kim', 'Data Science Lead', 'Digital', ['S&OP', 'Change'], ['Data & analytics', 'AI in operations'], 'A planning cycle that uses the model.', 'Data operators do not have to translate.'),
  person('amira', 'Amira Hassan', 'Quality Systems Lead', 'Quality', ['Process improvement', 'Supplier risk'], ['Quality', 'Data & analytics'], 'Defects traced to the supplier, fast.', 'Quality signals people will act on.'),
  person('luca', 'Luca Bianchi', 'Regional Logistics Lead, EMEA', 'Logistics', ['S&OP', 'Inventory'], ['Regional collaboration', 'Customer delivery'], 'A plan that survives the regional handoff.', 'How EMEA actually moves product.'),
  person('hannah', 'Hannah Brooks', 'Talent Partner', 'People', ['Talent', 'Change'], ['Talent', 'Regional collaboration'], 'Roles we keep failing to fill.', 'Leaders ready for a bigger brief.'),
  person('nina', 'Nina Kapoor', 'Director, Leadership Programmes', 'People', ['Talent', 'Process improvement'], ['Talent', 'Change'], 'A day people still talk about on Monday.', 'A simple way to run a room like this.'),
  person('mateo', 'Mateo Silva', 'Finance Business Partner', 'Finance', ['Cost', 'Forecasting'], ['Cost', 'Data & analytics'], 'Where the forecast and the money disagree.', 'A cost read without the theatre.'),
  person('ingrid', 'Ingrid Larsen', 'Sustainable Sourcing Lead', 'Sustainability', ['Supplier risk', 'Cost'], ['Sustainability', 'Supplier risk'], 'Risk and emissions in the same conversation.', 'Sourcing targets a buyer can hold.'),
  person('wei', 'Wei Zhang', 'Plant Operations Lead', 'Manufacturing', ['AI in operations', 'Process improvement'], ['Process improvement', 'Quality'], 'A pilot that survives one noisy line.', 'Process changes a shift will keep.'),
  person('chloe', 'Chloe Martin', 'Demand Planning Manager', 'Planning', ['Inventory', 'Data & analytics'], ['S&OP', 'Inventory'], 'Inventory that matches the promise we made.', 'A demand plan the regions recognize.'),
  person('rajiv', 'Rajiv Mehta', 'Indirect Procurement Lead', 'Procurement', ['Sustainability', 'Cost'], ['Supplier risk', 'Cost'], 'Spend we can explain to finance.', 'Suppliers who will still be here.'),
  person('elena', 'Elena Popov', 'Supplier Quality Lead', 'Quality', ['Quality', 'Supplier risk'], ['Quality', 'Process improvement'], 'Quality issues caught before they ship.', 'A supplier conversation that fixes the cause.'),
  person('samuel', 'Samuel Adeyemi', 'Customer Logistics Manager', 'Delivery', ['Customer delivery', 'Forecasting'], ['Customer delivery', 'Inventory'], 'Promises the warehouse can keep.', 'A delivery view the customer team trusts.'),
  person('freya', 'Freya Nielsen', 'Product Analytics Lead', 'Digital', ['Change', 'AI in operations'], ['Data & analytics', 'Change'], 'Tools people do not work around.', 'The few numbers a leader should see.'),
  person('hassan', 'Hassan Al-Farsi', 'Transport Network Lead', 'Logistics', ['Regional collaboration', 'Inventory'], ['Regional collaboration', 'Customer delivery'], 'Lanes that work in more than one region.', 'A network that bends without breaking.'),
  person('julia', 'Julia Berger', 'Cost and Inventory Finance', 'Finance', ['Cost', 'Forecasting'], ['Cost', 'S&OP'], 'Inventory cash we can actually release.', 'A cost bridge the S&OP will use.'),
  person('kenji', 'Kenji Sato', 'Manufacturing Excellence', 'Manufacturing', ['Forecasting', 'Quality'], ['Quality', 'Process improvement'], 'A forecast the line can build to.', 'Fewer stops, cleaner output.'),
  person('aisha', 'Aisha Diallo', 'Climate and Supply Lead', 'Sustainability', ['Supplier risk', 'Change'], ['Sustainability', 'Change'], 'Suppliers who can show their numbers.', 'Climate targets that change a purchase.'),
  person('tomas', 'Tomas Novak', 'Regional Planning Lead', 'Planning', ['S&OP', 'Inventory'], ['Forecasting', 'Inventory'], 'One number for the region and the center.', 'A forecast the plant will believe.'),
  person('grace', 'Grace Okafor', 'Leadership Development', 'People', ['Regional collaboration', 'Talent'], ['Talent', 'Change'], 'Leaders who have worked outside their team.', 'Moves that stretch people on purpose.'),
  person('luis', 'Luis Ortega', 'Packaging Category Lead', 'Procurement', ['Cost', 'Supplier risk'], ['Cost', 'Supplier risk'], 'Savings that do not come back as risk.', 'A short list of suppliers we trust.'),
  person('mei', 'Mei Lin', 'Quality Data Lead', 'Quality', ['Data & analytics', 'Quality'], ['Quality', 'Data & analytics'], 'Defect data someone will open.', 'A weekly signal, not a quarterly surprise.'),
  person('patrick', 'Patrick Doyle', 'Outbound Delivery Lead', 'Delivery', ['Customer delivery', 'Process improvement'], ['Customer delivery', 'Regional collaboration'], 'Handoffs that stop losing a day.', 'Delivery promises with a name on them.'),
  person('sara', 'Sara Goldstein', 'FP&A, Supply Chain', 'Finance', ['Cost', 'Data & analytics'], ['Cost', 'Forecasting'], 'A forecast finance can plan around.', 'Where the money actually sits.'),
  person('youssef', 'Youssef Benali', 'Warehouse Network Lead', 'Logistics', ['Inventory', 'Customer delivery'], ['Customer delivery', 'Process improvement'], 'Warehouses that do not surprise the customer.', 'A simpler path from dock to door.'),
  person('emma', 'Emma Clarke', 'AI Program Lead', 'Digital', ['Forecasting', 'AI in operations'], ['AI in operations', 'Change'], 'Planning teams who want a pilot.', 'AI with an owner after the demo.'),
  person('hiro', 'Hiro Tanaka', 'Factory Performance Lead', 'Manufacturing', ['Quality', 'Cost'], ['Process improvement', 'Quality'], 'Cost that does not hide in scrap.', 'A line that tells you when it drifts.'),
  person('fatima', 'Fatima Zahra', 'Supplier Sustainability', 'Sustainability', ['Forecasting', 'S&OP'], ['Sustainability', 'Data & analytics'], 'A plan that includes the carbon, not after.', 'Emissions next to the volume.'),
  person('oliver', 'Oliver Grant', 'IBP Manager', 'Planning', ['Inventory', 'S&OP'], ['Forecasting', 'S&OP'], 'One plan the functions will defend.', 'A monthly decision, written down.'),
  person('nadia', 'Nadia Petrova', 'People Partner, Operations', 'People', ['Talent', 'Change'], ['Talent', 'Regional collaboration'], 'Teams that can spare someone to grow.', 'Moves across regions that stick.'),
  person('carlos', 'Carlos Mendes', 'Direct Procurement Lead', 'Procurement', ['Supplier risk', 'Sustainability'], ['Supplier risk', 'Cost'], 'Dual source before we need it.', 'Leverage that does not burn the supplier.'),
  person('hana', 'Hana Suzuki', 'Incoming Quality Lead', 'Quality', ['Process improvement', 'Quality'], ['Quality', 'Supplier risk'], 'Issues stopped at the dock.', 'A supplier score people respect.'),
  person('benoit', 'Benoit Laurent', 'Service Logistics Lead', 'Delivery', ['Customer delivery', 'Regional collaboration'], ['Customer delivery', 'Inventory'], 'Parts that arrive before the promise slips.', 'A service network with fewer exceptions.'),
  person('anika', 'Anika Sharma', 'Supply Finance Lead', 'Finance', ['Cost', 'Sustainability'], ['Cost', 'Data & analytics'], 'Sustainability with a cost, said plainly.', 'A number the buyer and the CFO share.'),
  person('kwame', 'Kwame Boateng', 'Regional Logistics, AMEA', 'Logistics', ['Regional collaboration', 'Customer delivery'], ['Regional collaboration', 'Process improvement'], 'A playbook that works beyond one region.', 'Local fixes the network can reuse.'),
  person('isla', 'Isla MacLeod', 'Planning Systems Lead', 'Digital', ['Change', 'Data & analytics'], ['AI in operations', 'Data & analytics'], 'A system people stop exporting from.', 'Data the planner already trusts.'),
  person('diego', 'Diego Vargas', 'Production Planning Lead', 'Manufacturing', ['AI in operations', 'Quality'], ['Quality', 'Process improvement'], 'A schedule the line can keep.', 'Less firefighting on the day.'),
  person('leila', 'Leila Haddad', 'Global Planning Manager', 'Planning', ['Forecasting', 'Regional collaboration'], ['S&OP', 'Regional collaboration'], 'Regions that plan with us, not after us.', 'A global picture with local truth in it.'),
  person('peter', 'Peter Novak', 'Quality Operations', 'Quality', ['Forecasting', 'AI in operations'], ['AI in operations', 'Quality'], 'A private forecasting worry.', 'Quality checks a model could catch.'),
  person('rosa', 'Rosa Ferreira', 'Culture and Belonging', 'People', ['Talent', 'Change'], ['Talent', 'Process improvement'], 'Rooms where the quiet voices get in.', 'Habits that outlast the offsite.'),
  person('arjun', 'Arjun Patel', 'Strategic Sourcing Lead', 'Procurement', ['Supplier risk', 'Regional collaboration'], ['Supplier risk', 'Sustainability'], 'Sourcing that the regions will follow.', 'Suppliers chosen for more than price.'),
  person('elise', 'Elise Moreau', 'Circular Supply Lead', 'Sustainability', ['Sustainability', 'Data & analytics'], ['Sustainability', 'Change'], 'Materials we can trace past tier one.', 'A circular pilot with an owner.'),
]

const LINKS: [string, string][] = [
  ['alex', 'lena'],
  ['alex', 'chloe'],
  ['alex', 'maria'],
  ['alex', 'mateo'],
  ['alex', 'sofia'],
  ['alex', 'noah'],
  ['lena', 'oliver'],
  ['chloe', 'leila'],
  ['tomas', 'oliver'],
  ['leila', 'tomas'],
  ['lena', 'mei'],
  ['maria', 'sofia'],
  ['maria', 'youssef'],
  ['luca', 'hassan'],
  ['hassan', 'kwame'],
  ['youssef', 'kwame'],
  ['luca', 'sofia'],
  ['james', 'anika'],
  ['omar', 'rajiv'],
  ['rajiv', 'carlos'],
  ['carlos', 'luis'],
  ['luis', 'arjun'],
  ['omar', 'arjun'],
  ['david', 'wei'],
  ['wei', 'kenji'],
  ['kenji', 'hiro'],
  ['hiro', 'diego'],
  ['diego', 'david'],
  ['priya', 'noah'],
  ['noah', 'emma'],
  ['emma', 'freya'],
  ['freya', 'isla'],
  ['isla', 'priya'],
  ['sofia', 'samuel'],
  ['samuel', 'patrick'],
  ['patrick', 'benoit'],
  ['benoit', 'sofia'],
  ['carla', 'ingrid'],
  ['ingrid', 'aisha'],
  ['aisha', 'fatima'],
  ['fatima', 'elise'],
  ['elise', 'carla'],
  ['amira', 'elena'],
  ['elena', 'mei'],
  ['mei', 'hana'],
  ['hana', 'peter'],
  ['peter', 'amira'],
  ['mateo', 'julia'],
  ['julia', 'sara'],
  ['sara', 'anika'],
  ['anika', 'mateo'],
  ['nina', 'hannah'],
  ['hannah', 'grace'],
  ['grace', 'nadia'],
  ['nadia', 'rosa'],
  ['rosa', 'nina'],
  ['noah', 'kenji'],
  ['sofia', 'julia'],
  ['grace', 'chloe'],
  ['diego', 'amira'],
  ['isla', 'tomas'],
  ['kwame', 'benoit'],
  ['arjun', 'elena'],
  ['peter', 'sara'],
  ['rosa', 'elise'],
  ['freya', 'hiro'],
  ['luis', 'mei'],
  ['ingrid', 'omar'],
  ['youssef', 'patrick'],
  ['leila', 'hannah'],
]

const MOBILES: Record<string, string> = {
  alex: '+1 555 0101',
  maria: '+1 555 0102',
  priya: '+1 555 0104',
  james: '+1 555 0105',
  nina: '+1 555 0114',
}

const LINKEDIN = new Set(['alex', 'maria', 'priya', 'james', 'carla', 'david'])

const VISIBILITY: Record<string, Partial<Visibility>> = {
  peter: { topics: 'hidden', looking: 'hidden', offer: 'hidden' },
  david: { email: 'met' },
}

const WHEN = '2026-10-15T08:00:00.000Z'

const FACE_IDS = new Set([
  'alex',
  'priya',
  'luca',
  'fatima',
  'nina',
  'nadia',
  'maria',
  'grace',
  'james',
  'carla',
  'david',
  'sofia',
  'noah',
  'omar',
  'lena',
  'hannah',
  'wei',
])

function emailFor(fullName: string): string {
  const [first, ...rest] = fullName.toLowerCase().split(/\s+/)
  return `${first}.${rest.join('') || 'guest'}@example.com`
}

export function createInitialState(): PersistedState {
  const taken = new Set<string>()
  const participants = PEOPLE.map((draft, index) => ({
    id: draft.id,
    email: emailFor(draft.fullName),
    fullName: draft.fullName,
    jobTitle: draft.jobTitle,
    department: draft.department,
    mobile: MOBILES[draft.id] ?? null,
    linkedinUrl: LINKEDIN.has(draft.id) ? `https://www.linkedin.com/in/gather-demo-${draft.id}` : null,
    isOrganizer: draft.id === 'nina',
    isSample: true,
    shortCode: makeShortCode(draft.id, taken),
    photoUrl: FACE_IDS.has(draft.id) ? `/faces/${draft.id}.jpg` : null,
    team: `Table ${(index % 8) + 1}`,
  }))

  const profiles: Record<string, Profile> = {}
  for (const draft of PEOPLE) {
    profiles[draft.id] = {
      ...emptyProfile(draft.id),
      lookingFor: draft.lookingFor,
      canOffer: draft.canOffer,
      banner: '',
      workshopGoal: draft.lookingFor,
      dayGoal: '',
      goalsVisible: true,
      lookingTopics: draft.lookingTopics,
      offerTopics: draft.offerTopics,
      visibility: { ...DEFAULT_VISIBILITY, ...VISIBILITY[draft.id] },
      discoverable: draft.id !== 'rosa',
      completedAt: WHEN,
    }
  }

  const connections = LINKS.map(([a, b]) => {
    const [participantA, participantB] = a < b ? [a, b] : [b, a]
    return {
      id: `${participantA}:${participantB}`,
      participantA,
      participantB,
      createdAt: WHEN,
      method: 'qr' as const,
    }
  })

  const metMarks: MetMark[] = []
  for (const [a, b] of LINKS) {
    metMarks.push({ markerId: a, markedId: b, createdAt: WHEN }, { markerId: b, markedId: a, createdAt: WHEN })
  }
  for (const id of ['wei', 'hannah', 'emma', 'oliver', 'youssef']) {
    metMarks.push({ markerId: 'alex', markedId: id, createdAt: WHEN })
  }

  const questions: Question[] = [
    q('q1', 'How can we better collaborate across regions on supply resilience?', 'james', false, false, false),
    q('q2', 'What role will AI really play in our operations in the next two years?', 'priya', false, false, false),
    q('q3', 'How do we build stronger talent pipelines across markets?', 'maria', false, false, false),
    q('q4', 'What is the one thing we should stop doing this quarter?', null, true, false, false),
    q('q5', 'Where is supplier risk actually showing up in delivery dates?', 'carla', false, false, false),
    q('q6', 'How do we know the S&OP is changing decisions, not just slides?', 'alex', false, false, false),
    q('q7', 'Can regional teams share one inventory picture?', 'lena', false, false, false),
    q('q8', 'What should manufacturing hear from procurement tomorrow?', 'david', false, false, false),
    q('q9', 'How do we make sustainability a buyer target, not a side report?', 'ingrid', false, false, false),
    q('q10', 'Which AI pilots are worth scaling past one site?', 'noah', false, false, false),
    q('q11', 'Can we keep a list of who still has not mixed across teams?', 'hannah', false, false, false),
    q('q12', 'Will the slides be shared after the close?', null, true, true, false),
    q('q13', 'What is the plan if a region misses the forecast again?', 'omar', false, true, false),
    q('q14', 'Is the return bus at the front or the side entrance?', null, true, false, true),
  ].map((question) => ({ ...question, topics: QUESTION_TOPICS[question.id] ?? [] }))

  const comments: QuestionComment[] = [
    { id: 'c1', questionId: 'q1', authorId: 'maria', text: 'A shared picture of inventory would help the regions talk.', createdAt: WHEN },
    { id: 'c2', questionId: 'q2', authorId: 'david', text: 'Start with one line, not the whole network.', createdAt: WHEN },
    { id: 'c3', questionId: 'q2', authorId: 'noah', text: 'We have two pilots worth comparing.', createdAt: WHEN },
    { id: 'c4', questionId: 'q9', authorId: 'carla', text: 'Buyers will move if the target is in the scorecard.', createdAt: WHEN },
  ]

  const ids = PEOPLE.map((draft) => draft.id).filter((id) => id !== 'alex')
  const votes = [
    ...take('q1', ids, 22),
    ...take('q2', ids, 17),
    ...take('q3', ids, 14),
    ...take('q4', ids, 11),
    ...take('q5', ids, 9),
    ...take('q6', ids, 7),
    ...take('q7', ids, 6, true),
    ...take('q8', ids, 5),
    ...take('q9', ids, 4),
    ...take('q10', ids, 3),
    ...take('q11', ids, 2),
    ...take('q12', ids, 8),
    ...take('q13', ids, 6),
    ...take('q14', ids, 1),
  ]

  const commitments: Commitment[] = [
    c('alex', 'Block a monthly hour with Procurement before the next S&OP.'),
    c('maria', 'Pair two leads across regions before year end.'),
    c('priya', 'Sit with planning for a day before pitching another tool.'),
    c('james', 'Review the top ten suppliers with sustainability, together.'),
    c('carla', 'Turn one emissions metric into a buyer target.'),
    c('david', 'Try one AI check on a single line for a month.'),
    c('lena', 'Publish the S&OP decisions, not just the deck.'),
    c('omar', 'Put supplier risk where delivery can see it.'),
    c('sofia', 'Name an owner for every promise we miss.'),
    c('noah', 'Stop any pilot that has no operator attached.'),
    c('hannah', 'Fill two stretch roles with people from another team.'),
    c('mateo', 'Show finance the three inventory numbers that matter.'),
    c('ingrid', 'Bring one buyer into the next emissions review.'),
    c('wei', 'Keep the pilot going after the visitors leave.'),
    c('samuel', 'Share yesterday’s misses with planning every Monday.'),
    c('aisha', 'Pick one supplier and ask for the real numbers.'),
    c('grace', 'Move one high-potential lead across regions.'),
    c('kenji', 'Give the line the forecast a day earlier.'),
    c('julia', 'Cut one report nobody uses to decide.'),
    c('nina', 'Leave the next workshop easier to run than this one.'),
  ]

  const feedback: Feedback[] = [
    f('f1', 5, 5, 5, 'I knew who to walk up to.', 'A longer coffee, a shorter keynote.'),
    f('f2', 5, 4, 5, 'The matches. Specific, not a directory.', ''),
    f('f3', 4, 5, 4, 'Seeing which teams I still had not met.', 'Put the Wi-Fi on the table as well.'),
    f('f4', 5, 4, 5, 'Questions rose instead of repeating.', ''),
    f('f5', 4, 4, 5, 'One commitment, said out loud.', 'Start the mixing earlier.'),
    f('f6', 5, 5, 4, 'I talked to procurement. I never do.', ''),
    f('f7', 3, 4, 4, 'The agenda in my pocket.', 'Tell us the room number sooner.'),
    f('f8', 5, 4, 5, 'Swapping details without a business-card shuffle.', ''),
  ]

  return {
    seedVersion: SEED_VERSION,
    participants,
    groups: buildGroups(participants.map((person) => person.id)),
    profiles,
    connections,
    metMarks,
    questions,
    comments,
    votes,
    commitments,
    feedback,
    announcements: [
      {
        id: 'ann-coffee',
        text: 'Bus leaves in 10 minutes.',
        imageUrl: '/scenes/coffee.jpg',
        urgent: true,
        active: true,
        createdAt: '2026-10-15T10:05:00.000Z',
      },
    ],
    dismissals: [],
    event: {
      title: 'GSC Leadership Workshop',
      dateLabel: 'Wednesday 15 October',
      draft: true,
      questionsOpen: true,
      feedbackOpen: true,
      credits: [],
      demoClock: true,
      demoTime: '10:20',
      agenda: [
        { id: 'ag1', day: '15', time: '09:00', end: '09:30', title: 'Opening & welcome', detail: 'Why we are in the room.', kind: 'session', room: 'Grand Ballroom', speakerIds: ['nina'] },
        { id: 'ag2', day: '15', time: '09:30', end: '10:30', title: 'The road ahead', detail: 'Keynote with the workshop hosts.', kind: 'session', room: 'Grand Ballroom', speakerIds: ['nina', 'maria'] },
        { id: 'ag3', day: '15', time: '10:30', end: '11:00', title: 'Coffee & connections', detail: 'The best half hour to meet someone new.', kind: 'break', room: 'Foyer' },
        { id: 'ag4', day: '15', time: '11:00', end: '12:30', title: 'Breakout sessions', detail: 'Smaller rooms. Mix the tables.', kind: 'session', room: 'Rooms A, B, C', speakerIds: ['james', 'priya', 'david'] },
        { id: 'ag5', day: '15', time: '12:30', end: '13:30', title: 'Lunch', detail: 'Served in the foyer.', kind: 'food', room: 'Foyer' },
        { id: 'ag6', day: '15', time: '13:30', end: '15:00', title: 'Leadership Q&A', detail: 'The questions you upvoted, answered.', kind: 'qa', room: 'Grand Ballroom', speakerIds: ['nina', 'james'] },
        { id: 'ag7', day: '15', time: '15:00', end: '15:40', title: 'Commitments', detail: 'One action to take back to your team.', kind: 'session', room: 'Grand Ballroom' },
        { id: 'ag8', day: '15', time: '15:40', end: '16:10', title: 'Close & feedback', detail: 'A short note before the bus.', kind: 'session', room: 'Grand Ballroom', speakerIds: ['nina'] },
      ],
      logistics: [
        { id: 'lg1', icon: 'pin', title: 'Venue', body: 'Grand Ballroom, lobby level.', extra: '' },
        { id: 'lg2', icon: 'bus', title: 'Transport', body: 'Shuttle buses 7:00–8:00 AM from the main office, and 16:30 back. The return bus boards outside the ballroom.', extra: '' },
        { id: 'lg3', icon: 'wifi', title: 'Wi-Fi', body: 'Network SE-Guest', extra: 'workshop2026' },
        { id: 'lg4', icon: 'food', title: 'Food', body: 'Coffee at the break. Lunch in the foyer. Snacks through the day.', extra: '' },
        { id: 'lg5', icon: 'shirt', title: 'Dress code', body: 'Smart casual.', extra: '' },
        { id: 'lg6', icon: 'pin', title: 'Parking', body: 'On-site parking under the building. Tell reception you are with the workshop.', extra: '' },
        { id: 'lg7', icon: 'user', title: 'Need help?', body: 'Ask at the registration desk in the lobby, or find an organizer in the app.', extra: '' },
      ],
    },
    currentUserId: 'alex',
    entered: false,
    feedbackDone: [],
    installHintDismissed: false,
    photos: [],
    photoConsent: [],
    challengeClaims: ['wei', 'grace', 'james', 'luca', 'carla'].map(
      (participantId): ChallengeClaim => ({
        participantId,
        challengeKey: 'selfie',
        photoId: null,
        createdAt: WHEN,
        revokedAt: null,
      }),
    ),
  }
}

const QUESTION_TOPICS: Record<string, string[]> = {
  q1: ['Regional collaboration'],
  q2: ['AI in operations'],
  q3: ['Talent'],
  q4: ['Change'],
  q5: ['Supplier risk'],
  q6: ['S&OP'],
  q7: ['Inventory'],
  q8: ['Customer delivery'],
  q9: ['Sustainability'],
  q10: ['AI in operations'],
  q11: ['Talent'],
  q13: ['Forecasting'],
}

function q(
  id: string,
  text: string,
  authorId: string | null,
  isAnonymous: boolean,
  isAnswered: boolean,
  isHidden: boolean,
): Question {
  return { id, text, authorId: isAnonymous ? null : authorId, isAnonymous, isAnswered, isHidden, createdAt: WHEN, topics: [] }
}

function take(questionId: string, ids: string[], count: number, includeAlex = false) {
  const voters = ids.slice(0, count)
  if (includeAlex) voters.push('alex')
  return voters.map((voterId) => ({ questionId, voterId }))
}

function c(participantId: string, text: string): Commitment {
  return { participantId, text, createdAt: WHEN }
}

function f(id: string, metScore: number, timeScore: number, takeawayScore: number, best: string, change: string): Feedback {
  return { id, metScore, timeScore, takeawayScore, best, change, createdAt: WHEN }
}

export const SAMPLE_IMPORT = `full_name,job_title,department,email,mobile
Rita Okonkwo,Director Regional Planning,Planning,rita.okonkwo@example.com,
Jon Hale,Customer Logistics Lead,Delivery,jon.hale@example.com,+15550199
`

function buildGroups(ids: string[]): WorkshopGroup[] {
  const challengerIds = ['nina', 'maria', 'james'].filter((id) => ids.includes(id))
  const rest = ids.filter((id) => !challengerIds.includes(id))
  const slice = (start: number, count: number) => rest.slice(start, start + count)
  const drafts: Omit<WorkshopGroup, 'scribeId'>[] = [
    {
      id: 'p0',
      code: 'P0',
      title: 'Supply resilience',
      brief: 'A mixed room. The three challengers move between groups and bring back what they hear.',
      memberIds: [...challengerIds, ...slice(0, 7)],
      challengerIds,
    },
    {
      id: 'g1',
      code: 'Group 1',
      title: 'Plan the network',
      brief: 'One number the region and the center can both defend.',
      memberIds: slice(7, 10),
      challengerIds: [],
    },
    {
      id: 'g2',
      code: 'Group 2',
      title: 'Know the supplier',
      brief: 'Risk, cost, and emissions in the same conversation.',
      memberIds: slice(17, 10),
      challengerIds: [],
    },
    {
      id: 'g3',
      code: 'Group 3',
      title: 'Keep the promise',
      brief: 'From the forecast to the customer, without losing a day in the handoff.',
      memberIds: slice(27, 10),
      challengerIds: [],
    },
    {
      id: 'g4',
      code: 'Group 4',
      title: 'Grow the people',
      brief: 'The roles we keep failing to fill, and the moves that stretch someone on purpose.',
      memberIds: slice(37, 10),
      challengerIds: [],
    },
  ]
  return drafts.map((group) => ({
    ...group,
    scribeId: group.memberIds.find((id) => !group.challengerIds.includes(id)) ?? null,
  }))
}

export function assertDemo(state: PersistedState): void {
  if (state.participants.length !== 50) throw new Error(`Expected 50 people, got ${state.participants.length}`)
  if (state.groups.length !== 5) throw new Error(`Expected 5 groups, got ${state.groups.length}`)
  const seated = state.groups.flatMap((group) => group.memberIds)
  if (seated.length !== 50 || new Set(seated).size !== 50) throw new Error('Every person should sit in one group')
  if (!state.groups[0]?.memberIds.includes('alex')) throw new Error('Alex should sit in P0')
  const codes = new Set(state.participants.map((person) => person.shortCode))
  if (codes.size !== 50) throw new Error('Short codes collided')
  const alex = suggestions(state, 'alex')
  const alexIds = alex.map((item) => item.personId)
  if (alexIds.slice(0, 3).join(',') !== 'luca,priya,fatima') {
    throw new Error(`Alex matches:\n${alex.map((item) => `${item.personId} ${item.score} ${item.reason}`).join('\n')}`)
  }
  for (const id of partnerIds(state, 'alex')) {
    if (alexIds.includes(id)) throw new Error(`Connected person suggested: ${id}`)
  }
  if (alex.some((item) => item.personId === 'rosa')) throw new Error('Rosa was suggested')
  if (alex.some((item) => /peter|private forecasting/i.test(item.reason))) throw new Error('Hidden profile leaked into a reason')
  const peter = presentPerson(state, 'alex', 'peter')
  if (!peter || peter.lookingFor || peter.canOffer || peter.lookingTopics.length || peter.offerTopics.length) {
    throw new Error('Peter’s private fields are visible')
  }
  if (!peter.fullName) throw new Error('Name should always show')
  const david = presentPerson(state, 'alex', 'david')
  if (david?.email) throw new Error('David’s email should wait until you connect')
  if (!presentPerson(state, 'david', 'david')?.email) throw new Error('David should see his own email')
  if (presentPerson(state, 'maria', 'alex')?.mobile) throw new Error('Alex’s mobile leaked')
  if (presentPerson(state, 'alex', 'alex')?.mobile !== '+1 555 0101') throw new Error('Alex should see his own mobile')
  const maria = suggestions(state, 'maria').map((item) => item.personId)
  if (!maria.includes('hannah') || maria.includes('alex')) throw new Error(`Maria matches: ${maria.join(',')}`)
  const priya = suggestions(state, 'priya').map((item) => item.personId)
  if (!priya.includes('alex')) throw new Error(`Priya matches: ${priya.join(',')}`)
  const james = suggestions(state, 'james').map((item) => item.personId)
  if (!james.includes('ingrid')) throw new Error(`James matches: ${james.join(',')}`)
  for (const id of ['alex', 'maria', 'priya', 'james', 'carla', 'david', 'nina']) {
    const items = suggestions(state, id)
    if (items.length < 3) throw new Error(`${id} only has ${items.length} suggestions`)
    for (const item of items) {
      if (partnerIds(state, id).includes(item.personId)) throw new Error(`${id} suggested someone they already connected with`)
    }
  }
  if (suggestions(state, 'rosa').length < 1) throw new Error('Hiding Rosa removed her own matches')
  const board = challengeFor(state, 'alex')
  if (board.earned < 20) throw new Error(`Alex challenge score too low: ${board.earned}`)
  if (board.possible !== 70) throw new Error('Challenge should total 70 points')
  if (board.standing.length !== state.participants.length) throw new Error('Leaderboard should rank every person')
  const alexRow = board.standing.find((row) => row.id === 'alex')
  if (!alexRow || alexRow.rank !== board.rank || alexRow.points !== board.earned) throw new Error('Alex rank does not match his score')
  for (let index = 1; index < board.standing.length; index += 1) {
    const previous = board.standing[index - 1]
    const row = board.standing[index]
    if (row.points > previous.points) throw new Error('Leaderboard is out of order')
    if (row.points === previous.points && row.rank !== previous.rank) throw new Error('A tie should share a rank')
    if (row.points < previous.points && row.rank <= previous.rank) throw new Error('A lower score should rank further down')
  }
  if (!board.items.every((item) => item.earned <= item.points * (item.key === 'photos' ? 1 : item.cap))) {
    throw new Error('A challenge exceeded its cap')
  }
}

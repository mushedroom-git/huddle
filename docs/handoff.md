# GSC Event App Handoff

Oct 2, 2026 · @Michael

## What this is

A phone web app for a one-day workshop of about 50 Global Supply Chain leaders at Schneider Electric in mid-October 2026. It is an entry in an internal challenge set by a VP, due end of day Tuesday 6 October.

The app's single job: help people who do not normally work together find each other and talk. Everything else supports that.

The VP asked for seven things.

| Required | Where it lives |
| --- | --- |
| List of all participants | People tab |
| Profile per person, headshot from the directory | Person card |
| A place to say what you want from the day | Profile setup |
| Draft agenda | Day tab |
| Logistics: venue, transport, Wi-Fi, food, dress code | Day tab |
| Ask questions during the afternoon Q&A | Ask tab |
| Short feedback form at the end | Day tab |

Bonuses the VP offered: matchmaking, upvoting with an anonymous option, a people-I've-met tracker, a commitment wall, live announcements, and an organizer view. All are in scope.

Added beyond the brief: a QR handshake and virtual personal card, a personal network graph, an optional LinkedIn field, per-field privacy control, a voice-led profile setup, a shared photo wall, and a one-day challenge with a team leaderboard.

The entry is judged on three things, in the VP's own words: how well it helps people connect, how easy it is to use on a phone, and how easy it is for the organizers to run on the day. Every build decision below is aimed at one of those three.

## Decisions already locked

These were settled in discussion. Treat them as fixed and do not reopen them.

1. **Build outside Schneider Electric first, migrate later.** The Tuesday entry is a working app on a personal domain. The move into SE systems is described in the last section and is not part of this build.
2. **Name and photo are always visible.** Everyone in the room is physically present with a name badge, so hiding a name would be strange and would make the participant list look broken. Every other field is the person's choice.
3. **Every other field has three visibility levels**: everyone, people I've met, or hidden.
4. **"Met" means two different things** and the distinction is load-bearing. See the section on met and connected.
5. **Matching is the core feature, not voice.** Voice-led setup is a shortcut into the same fields. If it is cut, nothing else breaks.
6. **The network graph is personal first.** A room-wide version on a projector is a stretch goal, built from the same component.
7. **LinkedIn is an optional self-entered field**, under the same visibility control as everything else.
8. **The demo uses invented people.** No real participant names or photos go onto a server outside SE, at any point, for any reason.
9. **Cursor writes the code, not Lovable.** The app has enough moving parts that prompt-driven building would thrash.
10. **Schneider green, single dark theme.** See the visual direction below.
11. **The challenge leaderboard is by team, never by individual**, and every volume-based challenge is capped. Both rules exist for reasons set out in the challenge section; changing either one breaks what the feature is for.

Still unnamed: the app itself. See the open items at the end.

## Stack, hosting and deployment

React with Vite, Supabase for data and sign-in, deployed on Vercel at mushedroom.com.

| Piece | Choice | Why |
| --- | --- | --- |
| Frontend | React + Vite, TypeScript | Fast, no server rendering needed |
| Styling | Tailwind | Speed; the app is single-theme dark |
| Data, auth, realtime | Supabase | Postgres with row-level security, realtime subscriptions and magic-link sign-in in one service |
| Photos | Supabase Storage | Headshots uploaded by the organizer |
| QR generation | A small client-side QR library | No server round-trip |
| QR scanning | The browser camera API with a scanning library | Works on iOS and Android in a browser; see the caveat below |
| Graph | Hand-drawn SVG, no graph library | The layout is radial and deterministic, so a physics engine adds weight and mess |
| Hosting | Vercel | Free tier is ample for 50 people |

**Install to home screen.** The app must be installable, since the VP asked for something people do not open a browser to reach. That needs a web app manifest with name, icons at 192px and 512px, `display: standalone` and a theme colour, plus a service worker. Keep the service worker minimal: cache the app shell, always fetch data fresh. A stale-data bug during the workshop would be worse than a slow load. On iOS, installing is Share then Add to Home Screen, which has to be explained on screen because nothing prompts you.

**Test the camera from the installed app early.** Camera and microphone access inside an iOS home-screen app has historically been the weak spot in this kind of build. Test the QR scanner from an installed icon on a real iPhone on day one, not the day before the deadline. If it fails, the fallback is a 6-character code on the personal card that the other person types in.

**Moving the domain.** mushedroom.com was bought through Lovable but is fully owned and portable. In the Lovable workspace, switch the domain to custom nameservers, or reveal the EPP code and transfer the registrar outright. Then point it at Vercel. Lovable's own documentation covers both paths ([custom domain docs](https://docs.lovable.dev/features/custom-domain)). Budget ten minutes plus DNS propagation. Do this on day one so a propagation delay cannot threaten the deadline.

**Secrets.** The Supabase anonymous key ships in the frontend, which is normal and safe, but only if row-level security is on for every table. The service-role key never goes near the client. If voice is built, the model API key lives in a Vercel serverless function, never in the browser.

## Visual direction

Schneider green on a dark ground. One theme, no light-mode toggle.

**Why dark.** Schneider green is #3DCD58, a bright saturated green. As text on white it scores about 2:1 against the readable minimum of 4.5, so a light theme forces a darker, duller green everywhere and the brand colour never actually appears. On a dark ground the real green scores about 9:1 and can be used as itself. Dark also suits a conference room with the lights down, and it photographs better on a projector.

| Token | Hex | Use |
| --- | --- | --- |
| bg | #0C1512 | Page background |
| surface | #14211B | Cards |
| surface-2 | #1C2C24 | Tab bar, input fills, raised areas |
| line | #26382F | Borders and dividers |
| ink | #E8F1EC | Primary text |
| ink-2 | #9CB1A6 | Secondary text, labels, captions |
| green | #3DCD58 | The accent. Schneider green, unmodified |
| on-green | #07210E | Text sitting on a green fill |
| amber | #F2B74C | Urgent announcements, warnings |
| red | #FF8F86 | Destructive actions |

Every pairing above clears 8:1 against its background, which matters more than usual because people will read this on phones in a room with the blinds half closed.

**Keep it from looking generic.** Dark background with one bright green accent is a well-worn look and lands as a template if handled lazily. Three things stop that. The neutrals are not grey: every dark tone above carries a slight green bias, so the palette reads as one family rather than black plus a neon pop. The green appears at several strengths, as solid fills, as 12% tints behind borders, and as hairlines, not only at full brightness. And amber carries warning state, so green is not asked to mean brand, success, selection and urgency all at once.

**Type.** One family across the app with a good weight range, rather than a display-and-body pairing, which is the honest choice for something people operate rather than read. Figtree or Public Sans from Google Fonts both work and are legible at small sizes on a phone. Set numbers in tabular figures wherever they line up in columns, which is the vote counts, the met counter and the agenda times. The landing page may add a second face for its headline, since it is a page people read rather than an app they use. If Schneider Electric has a licensed brand typeface, use it in the internal version; do not put a licensed font on a personal domain.

**Touch targets** are at least 44px tall throughout. The people using this are holding a coffee in one hand.

**Hardcode the colours.** Define them once as Tailwind theme values, not as CSS custom properties referenced across files. If any screen is ever exported or pasted elsewhere, variables break and literal values do not.

## The screens

Five tabs along the bottom, plus a landing page and a few full-screen views that sit above the tabs.

**Landing page**, at the root of the domain. Public, no sign-in. The hero is a live animated network graph: dots for the fifty leaders, lines appearing between them as you watch. It is the product metaphor doing the selling. A headline in the shape of "Fifty leaders. One room. One day.", one button into the app, the seven features listed plainly below, credits at the bottom. This is the surface that has to impress, because it is the first thing a judge sees.

**Home tab**. A scrolling dashboard, and the screen people come back to between sessions. It answers one question: what should I be doing right now.

- *Now card*. The current agenda item and what is coming next.
- *Challenge card*. Your points, your team's position, and the next thing you could go and do. Taps through to the challenge screen.
- *Announcement banner*, when there is one.
- *Agenda*, opened from Home. Time down the left, session cards on the right. The current session is outlined and marked Now; the next is marked Up next. A draft banner sits on top while the agenda is still provisional. Break items point at the People tab; the Q and A item points at the Ask tab.
- *Logistics*, opened from Home. Five cards: venue, transport, Wi-Fi, food, dress code. Organizers can rename, reorder, add or remove them.
- *Feedback*, opened from Home. Three statements rated 1 to 5, two free-text boxes. Opens when the organizer switches it on. Stores nothing that identifies the author.

**People tab** — three sub-views.

- *Match*. The headline screen. Your met-count and progress bar, then three suggested people, each with one line explaining why. Below that, which departments you have not reached yet.
- *Everyone*. Searchable list of all participants, name, title and department, with a Mark as met button on each.
- *Graph*. Your personal network, described in its own section below.

**Ask tab**. A box to post a question with an anonymous toggle, then the questions ranked by votes with answered ones sinking to the bottom. Organizers see Hide and Mark answered on each card.

**Moments tab**. The shared photo wall. A big camera button, then a grid of everyone's photos, newest first. Tap one to view it full screen. You can delete your own; organizers can delete any. A count in the tab label shows it filling up through the day.

**Me tab**. Your profile, your privacy settings, your QR card, and for organizers an extra Organizer sub-view.

**Full-screen views**, reached from the tabs rather than living in them.

- *My card*. Big QR at the top, photo, name, title, department, your one line on what you are looking for, and whichever contact details you have chosen to show. One button flips it to the scanner. This is what you hold up at a coffee break.
- *Scanner*. Camera view. On a successful scan, both people are connected and the other person's card opens.
- *Challenge*. Reached from the Home card. Two views: the list of challenges with your progress, and the team leaderboard.
- *Profile setup*. Runs once after first sign-in. Topics you are looking for, topics you can offer, two short free-text lines, LinkedIn, privacy choices. Must be completable in under a minute.
- *Organizer view*. Announcements, agenda editor, logistics editor, event settings, participant import, challenge setup and feedback results. Plain forms, no cleverness. An organizer has to be able to use this on the day without calling anyone.

**Announcements** appear as a banner at the top of whatever tab you are on, dismissable, with an urgent variant in a warmer colour.

## Data model

Eight tables in Postgres. Everything hangs off `participant`.

**participant** — one row per person, created by the organizer's import, not by sign-up.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid | Primary key |
| email | text, unique | The key that links a sign-in to a row |
| full\_name | text | From the directory |
| job\_title | text | From the directory |
| department | text | From the directory; drives the cross-team logic |
| mobile | text, nullable | From the directory; hidden by default |
| photo\_path | text, nullable | Supabase Storage path |
| linkedin\_url | text, nullable | Self-entered |
| auth\_user\_id | uuid, nullable | Filled on first sign-in |
| is\_organizer | boolean | Default false |
| is\_sample | boolean | Marks demo people so they can be wiped in one go |

**profile** — one row per participant, what they want from the day.

| Column | Type | Notes |
| --- | --- | --- |
| participant\_id | uuid | Primary key, references participant |
| looking\_for | text | One or two lines, max 240 characters |
| can\_offer | text | One or two lines, max 240 characters |
| looking\_topics | text\[\] | From the fixed topic list |
| offer\_topics | text\[\] | From the fixed topic list |
| visibility | jsonb | Per-field levels; see the next section |
| completed\_at | timestamptz | Null until setup is finished |

**connection** — the mutual record. One row per pair, never two.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid | Primary key |
| participant\_a | uuid | Always the lower uuid of the pair |
| participant\_b | uuid | Always the higher uuid |
| created\_at | timestamptz |  |
| method | text | `qr` or `mutual_mark` |

Storing the pair in a fixed order with a unique constraint on the two columns is what stops duplicate rows and makes "are we connected" a single cheap lookup.

**met\_mark** — the one-sided record, private to the person who made it.

| Column | Type | Notes |
| --- | --- | --- |
| marker\_id | uuid | Who ticked |
| marked\_id | uuid | Who they ticked |
| created\_at | timestamptz |  |

Primary key is both columns together. Only the marker can ever read their own rows.

**question**: id, text, author\_id nullable, is\_anonymous, is\_answered, is\_hidden, created\_at. When anonymous, `author_id` is left null rather than stored and filtered, so there is nothing to leak.

**question\_vote**: question\_id, voter\_id, primary key on both. One vote per person per question.

**commitment**: participant\_id as primary key, text, created\_at. One per person, editable.

**feedback**: id, three integer ratings, two text fields, created\_at. No author column at all.

**photo**: id, uploader\_id, storage\_path, caption nullable, created\_at, is\_hidden. Uploader is always recorded even though the wall shows photos without prominent attribution, because the organizer needs to know who posted something if they have to take it down.

**challenge\_claim**: participant\_id, challenge\_key, photo\_id nullable, created\_at, revoked\_at nullable. Only for challenges that cannot be computed from other tables, which today means the selfie. Everything else is derived at read time from connections, questions, photos, commitments and profile completion, so there is no score to keep in sync and no way for it to drift.

Add a **team** column to participant, nullable, set by the organizer. The challenge leaderboard groups on it and falls back to department when it is empty.

**event\_config**: a single row holding title, date, draft flag, questions-open flag, feedback-open flag, credits, the agenda as jsonb and the logistics as jsonb. Agenda and logistics are jsonb rather than their own tables because the organizer edits them as whole lists, and a single row keeps that edit atomic.

## Who sees what

Each person sets their own level per field: **everyone**, **people I've met**, or **hidden**. The levels are stored in `profile.visibility` as a small json object, one key per field.

| Field | Default | Can be changed? |
| --- | --- | --- |
| Name, photo, title, department | Everyone | No |
| What I'm looking for | Everyone | Yes |
| What I can offer | Everyone | Yes |
| Topics | Everyone | Yes |
| Email | Everyone | Yes |
| LinkedIn | Everyone | Yes |
| Mobile | Hidden | Yes |

Defaults are set so that most people never open the privacy screen at all. Mobile starts hidden because a phone number is the one field people regret sharing.

**Enforce this in the database, not in the browser.** Row-level security policies and a view that returns only the fields the requesting person is allowed to see. A field hidden in the UI but present in the API response is not hidden. Assume someone in the room will open the network tab, because in a room of fifty supply chain leaders, someone will.

**Two rules that are easy to get wrong.**

First, a hidden profile still gets suggestions. If you hide your profile, the app still matches you to other people and tells *you* who to talk to. You simply do not appear in anyone else's suggestions. The matching is one-directional in that case. This matters because the alternative, where privacy costs you the main feature, pushes people into oversharing.

Second, the suggestion text must respect visibility too. If Ana has hidden her topics, the app cannot tell Ben "talk to Ana, she offers supplier risk", because that leaks exactly what she hid. Generate the reason text from fields the viewer is allowed to see, or fall back to the department-based reason.

The privacy screen itself is one row per field with three buttons. Five rows, one tap each. Do not bury it behind an "advanced" link; the VP named privacy explicitly as a requirement, so it should be visible that it was taken seriously.

## Met, connected and the QR handshake

There are two separate ideas here and collapsing them into one breaks the privacy model.

**I met them** is one-sided and private. You tap Mark as met on someone's card. It feeds your own progress bar and the "you haven't met anyone from Procurement" nudge. Nobody else ever sees it, including the person you marked. Keeping it private avoids the obvious social problem: if marking were visible, people would notice who had and had not marked them back.

**We connected** is mutual. It happens two ways: either one of you scans the other's QR code, or both of you have independently marked each other. This is the only thing that unlocks a field set to "people I've met".

**Why this matters.** If one-sided marking unlocked gated fields, anyone could tick all fifty names and harvest every mobile number in the room. The gate has to require agreement from both sides. The QR scan is agreement, because you cannot scan someone's phone without standing in front of them.

That is what makes the QR more than decoration. It is the mechanism that makes "people I've met" a promise the app can actually keep.

**The flow.** You open My card and hold up your phone. The other person opens Scanner and scans it. A connection row is written, both people see a confirmation, and the other person's full card opens with whatever they have chosen to share at the met level. From that moment the two of you appear in each other's graphs as solid nodes.

**The QR payload** is just the participant id, as a URL into the app. No personal data in the code itself, so a photograph of someone's screen reveals nothing.

**Fallback if the camera fails.** Show a 6-character code under the QR. The other person types it in. Build this from the start rather than as an emergency patch, because it also serves anyone who declines the camera permission.

## How matching works

Score every other participant, show the top three, and say why.

**The score.**

| Signal | Points |
| --- | --- |
| A topic you are looking for that they offer | 3 each |
| A topic you offer that they are looking for | 2 each |
| They are in a different department | +1, only if the score is already above zero |

Exclude anyone you are already connected to, and anyone whose profile is not yet filled in. Sort by score, take the top three.

The weighting is deliberate: what *you* want is worth more than what you can give, because the person reading the screen needs a reason to walk across the room. The cross-department bonus is small, a tiebreaker rather than a driver. It should never push a weak match above a strong one, only separate two equally good ones.

**If fewer than three people score above zero**, fill the remaining slots with people from departments you have not met, with the reason "From Procurement, a team you haven't met yet." This keeps the screen useful on day one, before many profiles exist.

**The reason line** is the whole point. A match without an explanation is a name; a match with one is a conversation opener. Two patterns:

- "You want supplier risk. Priya offers it."
- "Priya is looking for forecasting. You offer it."

Show one or both. Use first names. Keep it under about twelve words. Generate it only from fields the viewer is allowed to see, as described in the visibility section.

**Recalculate on view**, not on a schedule. With fifty people this is trivial work and it means a profile someone fills in over coffee shows up immediately.

**Do not repeat suggestions** that the person has already acted on. Once you connect with someone, they drop out of the pool and the next-best person takes the slot, so the screen always has somewhere new to point.

## The network graph

You at the centre, everyone else in a ring around you, divided into department wedges. People you have connected with are solid dots on the inner ring. People the app suggests are dashed outlines further out.

&#91;embedded content: personal network · inner ring met, outer ring suggested\]

The empty wedge is the whole point. You open the graph, see a gap where Procurement should be, and know where to go next. Nobody has to tell you to get out of your usual circle; the picture does it.

**Why radial rather than a floating-bubble graph.** A force-directed layout turns to spaghetti on a phone, jiggles while you are trying to tap it, and puts people in different places every time you open it. A radial layout is deterministic, legible at 390px wide, and needs no library. Draw it as plain SVG.

**Build notes.**

- Wedge order is fixed and alphabetical by department, so a person stays in the same place every time.
- Your own department's wedge sits at the top, so you can see at a glance how much of your network is just your own team.
- Angle within a wedge is derived from the participant id, so it is stable but not meaningful.
- Tapping a solid dot opens that person's card. Tapping a dashed one shows why they are suggested.
- When a new connection is made, animate the dot moving from the outer ring to the inner one. It is one transition and it is the most satisfying moment in the app.
- With nothing yet, show your own node and three dashed suggestions. Never an empty circle.

**The room version**, if there is time, is the same component with no centre: all fifty people in department wedges, lines drawn between everyone who has connected, on a projector. It fills in over the day while people watch. Build it only once everything else works.

## The photo wall

The disposable camera on a wedding table, except everyone already has a better one in their pocket. One shared wall that fills up through the day, and an album the organizers can send round afterwards without asking anyone for anything.

It is also the feature people open more than once. Most of the app is used at specific moments: setup in the morning, matches at the break, a question in the afternoon. The photo wall is the one thing someone opens while waiting for coffee.

**The screen.** A camera button at the top, then a grid of photos, newest first, three across. Tap one for full screen with its caption and who posted it. Captions are optional and one line. Your own photos have a delete; organizers can delete anything.

**Use a file input, not the live camera API.** `<input type="file" accept="image/*" capture="environment" multiple>` opens the phone's own camera or gallery picker. It works everywhere, including inside an iOS home-screen app, which is exactly where the QR scanner is at risk. Do not build this on `getUserMedia`.

**Resize before upload.** Draw the picture to a canvas at 1600px on the long edge and export JPEG at 0.8 quality. That turns a 4MB phone photo into roughly 300KB. Fifty people posting ten photos each is then about 150MB, comfortably inside a Supabase free tier, and it uploads over hotel Wi-Fi without a spinner that never ends. Generate a 400px thumbnail at the same time and use it for the grid; load the full image only when a photo is opened.

**Moderation and consent.** Show one line the first time someone uploads: photos are visible to everyone at the workshop. Give organizers a delete on every photo from the start, not as an afterthought. Record the uploader on every row even though the wall does not emphasise it, so a photo that has to come down can be traced.

**Download them all** from the organizer view, as a zip. This is a few lines of work and it turns into the follow-up email the organizers would otherwise have to assemble by hand. It is the kind of detail that reads as thoughtful rather than clever.

**Inside Schneider Electric**, this becomes a SharePoint document library, which is the natural home for it and solves retention and access without any extra thinking. Worth checking whether photos of identifiable employees need a line in the workshop invitation; a sentence in the joining instructions usually covers it.

## The one-day challenge

A list of things to do during the day, each worth points, with a team leaderboard. It is the main reason someone opens the app ten times instead of twice.

It does something no other feature does. Most people spend a workshop talking to the colleagues they already know, because walking up to a stranger is awkward. A challenge removes the awkwardness by giving them a reason that is not about them: they are not interrupting you, they are doing the selfie challenge.

**The scoring pays for the behaviour we want.**

| Challenge | Points | Cap |
| --- | --- | --- |
| Fill in your profile before the day starts | 5 | once |
| Connect with someone whose topics match yours | 5 | 3 times |
| Connect with someone from a department you have not met | 3 | 5 times |
| Selfie with the Executive VP | 10 | once |
| Ask a question in the Q and A | 5 | once |
| Post three photos to the wall | 5 | once |
| Add your commitment to the wall | 10 | once |

About 65 points available. Two deliberate choices in that table.

Meeting someone who actually matches you is worth more than meeting anyone, so the points push people toward the right people rather than simply more people. And every volume-based item is capped, so there is no reward for carrying on past the point where it stops being a real conversation.

The profile item is quietly the most valuable thing here. Matching cannot work until profiles exist, and five points is enough to get people filling theirs in the night before.

**The failure mode to design against.** If meeting people scored per person with no cap, you would get queues of people scanning each other's codes, thirty seconds each, no conversation. That is the standard way gamified networking goes wrong, and it produces the exact opposite of what the workshop is for. The caps are what prevent it, so do not remove them to make the numbers look bigger.

**The leaderboard is by team, never by individual.** Fifty senior leaders, and a public ranking that puts a VP at number 43 is mildly humiliating. The people most likely to quietly stop participating are the senior ones you most want taking part. By team, nobody is personally last, it produces banter rather than exposure, and people pull their colleagues in rather than competing with them.

Each person still sees their own score and progress on their own screen. That is private to them.

**Score teams on average points per person, not total.** A twelve-person department would otherwise beat a three-person one every time regardless of effort.

**Use workshop tables as the teams if the organizers assign them.** Tables are usually similar in size, which removes the fairness problem entirely, and because tables are normally mixed across departments, a table leaderboard rewards exactly the cross-team mixing the day is for. Add a `team` field to the participant record that the organizer can set, falling back to department when it is empty.

**Verification.** Most items are computed from data the app already holds: connections, questions, photos, commitments, profile completion. Nothing extra to record and nothing to keep in sync. The selfie is the exception: post the photo to the wall and tag it as the challenge, which awards the points immediately, with the organizer able to revoke. Nobody is going to fake a selfie with the EVP at a leadership workshop, so trust it and keep the friction at zero.

**Where it lives.** A card on the Home screen showing your points, your team's position and the next thing you could do. Tapping it opens the challenge screen, which has two views: Challenges and Leaderboard.

## Demo mode for the judges

The judges open the link on Tuesday with no Schneider Electric sign-in available. An empty app behind a login wall would lose the challenge in the first ten seconds, so the demo has to carry itself.

**What happens.** The landing page has one button into the app. Tapping it drops the judge straight into the app as one of the sample participants, fully set up. In the corner sits a small control reading "Viewing as Alex Rivera · switch". Tapping it offers a short list of sample people from different departments.

Within thirty seconds a judge should see a filled-in profile, three coffee-break matches each with a reason, a half-built network graph with visible gaps, a live Q&A with votes, and a commitment wall with entries on it. Switching person changes all of it, which demonstrates the matching is real rather than hardcoded.

**Seed data.** About fifty invented people across realistic GSC departments: planning, procurement, logistics, manufacturing operations, quality, customer delivery, sustainability, finance, digital and data, people. Every one needs a filled profile with topics, or the matching has nothing to work with. Roughly two thirds should have a few connections already, so the graph looks lived-in rather than empty. Seed about fifteen questions with varied vote counts and a couple marked answered, and about twenty commitments.

Mark every sample row `is_sample = true` so the whole set can be removed in one action when the real roster arrives.

**Photos.** Do not use real people's photos, including stock photos of real faces presented as participants. Generated initial-avatars on coloured backgrounds are honest, look clean, and sidestep the problem entirely. Name them something obviously invented.

**Behind the demo door.** A real event code for actual participants, so the app is not wide open. Demo mode is read-mostly: a judge can post a question and vote, but cannot delete anything or reach the organizer view.

**Keep one organizer login** available so you can show the organizer view if asked. Do not expose it from the landing page.

## Roster import format

The participant list will come from a Selenium script that pulls Name, Title, Department, Email and Mobile from the Schneider Electric employee portal, plus the headshot. Fix the format now so the scraper and the importer agree, even though the list of fifty names does not exist yet.

**One CSV, UTF-8, with a header row:**

```csv
full_name,job_title,department,email,mobile
Jane Doe,VP Supply Chain Planning,Planning,jane.doe@example.com,+33600000000
```

**Photos** in a folder beside it, each named after the local part of the email: `jane.doe.jpg`. The importer matches on that, so a photo with no matching row is skipped and reported rather than guessed at.

**Rules the importer follows.**

- Email is the unique key. Re-importing the same file updates rows rather than duplicating them, so the organizer can run it again when three more people are added.
- Resize photos to 320 by 320, centre-cropped, before upload. A folder of 4MB portal photos will make the people list crawl on hotel Wi-Fi.
- Never overwrite a person's own self-entered fields. The import touches directory fields only.
- Report what happened: rows added, rows updated, photos matched, photos skipped.

**Keep the real file off the prototype.** The directory pull should be tested against a handful of volunteers or dummy rows. The full fifty go in only after the app is inside Schneider Electric. This is both the right thing and a point worth making in the entry note.

**Mobile numbers.** Import them, but they arrive hidden by default and only the person themselves can reveal them. If there is any doubt about whether mobile numbers may leave the portal at all, leave the column empty on the first import and add it later; nothing else depends on it.

## Build order and what to cut

Four days to the deadline. Build in this order, and ship whatever is finished.

| # | What | Why here |
| --- | --- | --- |
| 1 | Project skeleton, Supabase schema, sign-in, domain pointed at Vercel | Deployment problems must surface on day one, not day four |
| 2 | Seed data: fifty sample people with full profiles | Everything after this is easier to see working |
| 3 | Profile setup and the privacy screen | The input the rest of the app runs on |
| 4 | Matching and the suggestion cards | The feature that wins the challenge |
| 5 | People list, person cards, met marking | Rounds out the connection story |
| 6 | Home screen, agenda, logistics, organizer editor | Required, and judged on "easy to run" |
| 7 | Q and A with votes, anonymous option, moderation | Required |
| 8 | Feedback form and results | Required |
| 9 | QR card and scanner | High impact, and the camera risk is known |
| 10 | Landing page | Needs the app's look to already exist |
| 11 | Install-to-home-screen manifest | Small, but explicitly asked for |
| 12 | Shared photo wall | Two hours of work, and the thing people open all day |
| 13 | Commitment wall | Cheap, and the challenge scores it |
| 14 | Announcements | Half an hour of work |
| 15 | One-day challenge and team leaderboard | Needs items 9, 12 and 13 to exist first |
| 16 | Network graph | Distinctive, but a day's work |
| 17 | Voice setup | Icing, and the riskiest piece |

**Cut from the bottom.** Items 1 to 8 are the entry. Everything below that is upside.

**Two things not to cut.** The install manifest, because the VP asked for it by name and it takes under an hour. And the organizer view, because one third of the judging is how easy it is to run on the day.

**If the QR scanner fails on iPhone**, ship the 6-character code fallback and say so plainly in the entry note. A known limitation described honestly reads better than a feature that breaks in front of fifty leaders.

**Leave the last half-day for testing on real phones.** One iPhone and one Android, installed to the home screen, on a network that is not your home Wi-Fi. Most of what will go wrong on the day shows up in that session.

## Still open

None of these block the start of the build.

- [ ] **The app needs a name.** It appears on the home screen icon, the landing page and in the credits. Worth ten minutes.
- [ ] **Who goes in the credits.** The VP asked for names with the entry. Deadline Tuesday.
- [ ] **The list of fifty participants.** Not yet known. The app must work without it, and the organizer must be able to load it in one step when it exists.
- [ ] **The agenda.** Not yet known. Seed a plausible draft for the demo, clearly marked as draft.
- [ ] **The event date and venue**, for the logistics cards.
- [ ] **Whether the voice setup gets built at all**, which depends on how items 1 to 11 go.
- [ ] **Whether SharePoint can serve profile photos by email**, which would remove the need for a portal scraper entirely in the Schneider Electric version. Worth asking before investing more in Selenium.

## Moving it into Schneider Electric

The VP's ground rules require company sign-in and data kept inside the SE ecosystem. The prototype does not meet that and should not pretend to. The entry note should say so plainly and describe this path, which is short because the app is built for it.

| Piece | Prototype | Inside SE |
| --- | --- | --- |
| Sign-in | Magic link via Supabase | Microsoft 365 single sign-on |
| Participant list and profiles | Postgres tables | SharePoint lists |
| Headshots | Supabase Storage | The directory, by email |
| Agenda and logistics | A config row | A SharePoint list the organizers already know how to edit |
| Hosting | Vercel | Wherever SE hosts internal web apps |

**What makes this cheap.** Keep every database call behind a thin data layer, one module per table, with no Supabase calls anywhere in the components. Swapping to SharePoint then means rewriting that layer and nothing else. This is the single most important structural decision in the build, and it costs almost nothing to follow from the start.

**What gets better after the move.** Headshots arrive automatically, so nobody uploads anything. Nobody picks their name from a list, because sign-in identifies them. And the organizers edit the agenda in a SharePoint list rather than a custom screen, which is a better answer to "simple enough to update on the day" than anything purpose-built.

**What needs checking before the move.** Whether SharePoint can serve profile photos by email address, which would replace the Selenium scraper. Whether mobile numbers may be surfaced in an app at all. And whether SE has an approved voice-capable AI service, if the voice setup survives.

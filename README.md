# The Huddle

A phone web app for a one-day workshop of about 50 Global Supply Chain leaders. Its job is to help people who do not normally work together find each other and talk.

The demo runs entirely in the browser. Participants, photos, and the agenda are invented, and everything you do is stored in `localStorage` on this device.

## Run it

```bash
npm install
npm run dev
```

Open [http://localhost:5184](http://localhost:5184).

```bash
npm run build    # typecheck, then production build
npm run preview  # serve the production build
```

## What you can do

- **Home** — who to talk to next, the live agenda, and the day's challenge
- **People** — the room, filtered by match, department, or who you have not met
- **Day** — agenda, logistics, photo wall, commitment wall, and feedback
- **Ask** — questions for the afternoon Q&A, with votes
- **Me** — your profile, privacy, personal card, and QR handshake

An organizer view imports a participant list, moderates questions, and posts announcements.

## Layout

```
src/
  main.tsx            app entry
  App.tsx             shell: landing, phone frame, tabs
  components/         shared UI, face crowd, network graph
  screens/            one file per surface
  state/              app state, theme, and navigation
  data/               demo seed and the sample CSV
  lib/                types and domain logic
  styles/             Tailwind and theme tokens
public/               icons, faces, scenes, manifest, service worker
docs/
  handoff.md          product decisions and the original brief
  design/             brand marks, mockups, and earlier explorations
```

Imports use the `@/` alias, which points at `src/`. A screen imports domain code as `@/lib/logic`, not a relative path that breaks when files move.

## Notes

Product decisions that should stay fixed are written in [docs/handoff.md](docs/handoff.md). The app described there still talks about Supabase and a hosted deploy. This repository is the client demo: no server, no real participant data.

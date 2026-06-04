# 🌱 Bloom

A gentle, gamified task app for ADHD brains. Drop in a big, daunting project, choose **how finely** an AI should break it down, and watch it become a patch of tiny, doable steps — visualised as a cute, Animal-Crossing-style pastel **garden**.

- **AI breakdown** — subtasks span the *whole* scope of a project (research → design → backend → testing → launch), not just the first few steps. A slider controls granularity from *Gentle* (3–4 chunks) to *Deep* (12+ with nested sub-steps).
- **The garden** — planting a task drops seedlings; tapping a plant advances it (🌱 to do → 🌿 growing → 🌸 bloomed). Each project grows a central tree as you complete steps.
- **Semi-organised** — plants are clustered by category, so similar work sits together. Unfinished steps stay small, so what needs doing is obvious at a glance.
- **Local-only** — everything lives in your browser (`localStorage`). No account, no cloud. The only network call is the AI breakdown, which goes through a tiny local proxy so your API key never reaches the browser.

## Run it

```bash
npm install
cp .env.example .env        # then add your ANTHROPIC_API_KEY
npm run dev                 # starts Vite (web) + the Express AI proxy together
```

Open http://localhost:5173.

## How it's built

| Piece | Tech |
|------|------|
| UI | React + TypeScript + Vite |
| Styling | Tailwind (custom pastel palette) |
| Animation | Framer Motion |
| Garden | hand-drawn SVG plants, deterministic clustering layout |
| State | Zustand + `persist` (localStorage) |
| AI | `server/index.ts` — Express proxy → Anthropic SDK, forced tool-use for valid structured subtasks, prompt caching on the system prompt |

### Layout / clustering
`src/lib/layout.ts` buckets every subtask by category, places each category zone on a golden-angle spiral from the centre, and scatters a category's plants on a seeded inner spiral — so positions are stable across reloads and similar work clusters together.

### Growth
`src/lib/growth.ts` derives a plant's visual stage purely from its status (and a project tree's stage from overall progress) — nothing about appearance is stored, so the garden always reflects the true state.

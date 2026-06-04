# 🌱 Bloom

### ▶︎ [**Try it live**](https://knowledgegarden-amelia3141s-projects.vercel.app)

[![Live on Vercel](https://img.shields.io/badge/Live-knowledgegarden.vercel.app-6cc28a?style=for-the-badge&logo=vercel&logoColor=white)](https://knowledgegarden-amelia3141s-projects.vercel.app)

A gentle, gamified task app for ADHD brains. Drop in a big, daunting project, choose **how finely** an AI should break it down, and watch it become a patch of tiny, doable steps — visualised as a cute, Animal-Crossing-style pastel **garden**.

- **AI breakdown** — subtasks span the *whole* scope of a project (research → design → backend → testing → launch), not just the first few steps. A slider controls granularity from *Gentle* (3–4 chunks) to *Deep* (12+ with nested sub-steps).
- **The garden** — planting a task drops seedlings; tapping a plant advances it (🌱 to do → 🌿 growing → 🌸 bloomed). Each project grows a central tree as you complete steps.
- **One patch per project** — each project is its own garden bed with a central tree and its steps ringed around it, grouped by category so similar work sits together. Unfinished steps stay small, so what needs doing is obvious at a glance.
- **Cozy & alive** — pick the season (spring blossom → summer berries → autumn leaves → winter snow), time of day (day/golden/dusk/night with shadows, fireflies, god-rays) and weather; parallax depth, drifting pollen, and a one-thing-at-a-time **focus mode**.
- **Local-first** — all task/garden data lives in your browser (`localStorage`); no account, no database. The only network call is the AI breakdown, which is proxied server-side (a local Express server in dev, a Vercel serverless function in prod) so your API key never touches the browser.

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

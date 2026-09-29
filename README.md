# Monkey TO-DO

A focused workspace for tasks and notes, with a Kanban board for a second view of the same work. Built for HNG Internship 15, Stage 1.

Anyone can start using it instantly in a private guest workspace — no sign-up required.

## Live URL

_Pending first Vercel deploy — added once available._

## Features (P0)

- **F-01** App shell & navigation — sidebar (desktop), icon rail (tablet), bottom tabs (mobile)
- **F-02** Guest workspace — private data per browser via a cookie, no login screen
- **F-03 – F-07** Tasks — create, list, edit, delete, change status/complete
- **F-08** Search & filter tasks — keyword, status, priority, due date
- **F-09** Notes — create, list, search, edit with autosave, delete
- **F-10** Kanban board — To Do / In Progress / Done, drag to move
- **F-11** Health check endpoint — `/api/health`

See [PRD.md](./PRD.md) and [FRD.md](./FRD.md) for full scope and acceptance criteria.

## Tech stack

- Next.js 15 (App Router, `src/` dir), React 19, TypeScript (strict)
- Tailwind CSS v4, shadcn/ui components, Lucide icons
- Neon Postgres via Drizzle ORM (`neon-http` driver in production)
- `@electric-sql/pglite` (in-memory Postgres) for tests
- Zod for validation, SWR for client data, `@dnd-kit/core` for drag-and-drop, `date-fns` for dates, Sonner for toasts
- Vitest for tests

Deployed on Vercel with a Neon Postgres database.

## Local setup

```bash
npm install
npm run dev   # http://localhost:3000
```

No database setup needed to start: with no `DATABASE_URL` set, `npm run dev` uses a local PGlite database persisted to `./.pglite`, migrated automatically on startup. To point at a real Postgres instead (e.g. a Neon `dev` branch), copy `.env.example` to `.env.local` and set `DATABASE_URL`.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Local dev server |
| `npm run build` | Production build (no migrations) |
| `npm run vercel-build` | Runs migrations, then builds — used by Vercel |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Run all tests (in-memory database, no network) |
| `npm run test:watch` | Vitest watch mode |
| `npm run db:generate` | Create a migration from schema changes |
| `npm run db:migrate` | Apply migrations to `DATABASE_URL` |
| `npm run check` | Lint + typecheck + test — must pass before every commit |

## Project docs

- [PRD.md](./PRD.md) — why we're building this, scope and priorities
- [FRD.md](./FRD.md) — exact features, data model and API contract
- [DESIGN.md](./DESIGN.md) — colours, typography, components, icons
- [AGENTS.md](./AGENTS.md) — rules for AI coding agents working on this project
- [BUILD_PROMPT.md](./BUILD_PROMPT.md) — the milestone-gated build plan

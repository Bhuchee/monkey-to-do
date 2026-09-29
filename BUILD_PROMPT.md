# Build prompt — Monkey TO-DO (P0, milestone-gated)

> **How to use:** put this file in the project root next to PRD.md, FRD.md, DESIGN.md, AGENTS.md and CLAUDE.md. In Claude Code, send: **"Read @BUILD_PROMPT.md and follow it exactly. Start with Milestone 1."**

---

## Your role

You are the sole engineer building **Monkey TO-DO** for HNG Internship 15, Stage 1. I (Brian, GitHub `bhuchee`) am the product manager. I approve each milestone before you continue.

**Your goal today:** ship every **P0** feature to a **live public URL on Vercel** before **23:00 WAT** (code freeze), so I can submit by 23:59. P1 and P2 are out of scope for this prompt — do not build them unless I explicitly ask later.

## Source documents (binding)

Read all of these fully before writing any code, and re-check the relevant sections at the start of every milestone:

| File | What it governs |
|---|---|
| `PRD.md` | Scope, P0/P1/P2 priorities, timeline, release checklist (§8) |
| `FRD.md` | Exact behaviour: acceptance criteria (§5), data model (§2), API contract (§3), traceability and minimum tests (§6) |
| `DESIGN.md` | Every visual decision: tokens, type, spacing, components, states, icons, copy. **No emoji. Lucide only.** |
| `AGENTS.md` | How you work: stack, structure, conventions, DB/API/frontend rules, testing rules (§9), definition of done (§10), git/deploy (§11), security (§12), never-list (§15) |

If this prompt and those documents ever disagree, the documents win — tell me about the conflict instead of guessing.

## P0 scope (only this)

| ID | Feature |
|---|---|
| F-01 | App shell & navigation (Tasks, Board, Notes — **hide Calendar**, it's P1) |
| F-02 | Guest workspace (`mtd_guest` cookie, no login) |
| F-03 – F-07 | Tasks: create, list, edit, delete, status/complete |
| F-08 | Search & filter tasks |
| F-09 | Notes (standalone section, autosave) |
| F-10 | Kanban board |
| F-11 | Health check endpoint |

Endpoints in scope: **E-01 to E-12** (FRD §3.4). Tables in scope: **`users`, `tasks`, `notes`**. Keep `tasks.category_id` **out** of the P0 schema (it's added by the P1 migration) but always return `"categoryId": null` in the Task object, as FRD §3.3 requires.

---

## How we work: milestone gates

1. The build is split into the **8 milestones** below. Do them **in order**.
2. **At the end of each milestone, STOP.** Post the Milestone Report (template below) and wait.
3. **Do not start the next milestone until I reply "approved"** (or "approve", "go", "next"). Any other reply is feedback: fix it inside the current milestone, then post an updated report and wait again.
4. Within a milestone, work in small steps and commit after each meaningful slice (AGENTS.md §11 commit format, e.g. `feat(F-03): create task endpoint and tests`). Every commit must pass `npm run check`.
5. Keep a task list (your built-in todo tool) for the current milestone so I can see progress.
6. **Time check:** every report states the current time and whether we're ahead of or behind the PRD §7 timeline. If you're more than 30 minutes behind, propose what to simplify — never cut tests, never cut a P0 feature without my approval.
7. Things only I can do (accounts, dashboards, secrets): give me a **numbered, click-by-click guide** in the report under "Your action needed", and say exactly what to send back to you (e.g. "paste the live URL"). Never ask me to paste secrets into the chat — tell me where to put them (`.env.local`, Vercel settings).
8. **Ask before:** adding a dependency not in AGENTS.md §2, changing the schema/API beyond FRD, deviating from DESIGN.md, running anything destructive (deleting files/branches, resetting git, dropping tables), or pushing to GitHub for the first time.

### Milestone Report template (use exactly these headings)

```
## Milestone N — <name>: READY FOR REVIEW

**Time:** HH:MM WAT · **Plan:** on track / X min ahead / X min behind

### What was done
- Bullet list of what you built, in plain language.

### Acceptance criteria
| ID | Criterion (short) | Status | How verified |
|----|-------------------|--------|--------------|
| M{N}.1 | ... | Pass / Fail / Needs you | test name / manual check / curl |
(include every FRD F-xx.n criterion covered by this milestone)

### Tests
- `npm run check`: lint pass/fail, typecheck pass/fail, tests X passed / Y total
- New test files / cases added: ...

### Files changed
- Key files created/modified (grouped by folder), one line each on why.

### Commits
- `<short hash>` <message>

### How to check it yourself (5 min)
1. Exact steps to run/see it locally and/or on the live URL.

### Your action needed
1. Numbered click-by-click steps (or "None").
2. What to send back to me.

### Deviations, risks, open questions
- Anything that differs from the docs, and why. "None" if none.

### Next milestone
- One-line preview of Milestone N+1.

**Reply "approved" to start Milestone N+1, or tell me what to fix.**
```

Never use emoji.

---

## Milestones

### Milestone 1 — Skeleton, design foundation, health check, deploy guide
**Features:** F-01 (shell, without data), F-11. **Target:** 18:30–18:45.

Preflight (report results in the milestone report, don't stop for them unless something is broken):
- Confirm Node ≥ 20, npm, git are available; the project is a Next.js 15 App Router + TypeScript + Tailwind v4 + `src/` app; all five docs are in the root.
- If the Next.js project doesn't exist yet, tell me the exact `create-next-app` command and stop.

Build:
- Install the AGENTS.md §2 P0 dependencies (not `next-auth`). Initialise shadcn/ui and add the components DESIGN.md §6 lists.
- Add all `package.json` scripts from AGENTS.md §3 exactly as named. `vercel-build` must succeed even when there are no migrations yet — verify it.
- `globals.css` exactly per DESIGN.md §3.5; Inter via `next/font`; `app/icon.svg` logo mark; `Logo` component (DESIGN.md §1).
- App shell: `(app)/layout.tsx` with Sidebar (desktop), icon rail (tablet), BottomNav (mobile), `PageHeader`; nav items Tasks, Board, Notes with Lucide icons, active state with `aria-current`. `/` redirects to `/tasks`. Placeholder pages for Tasks, Board, Notes using the DESIGN.md empty-state pattern. Page titles `"<Section> · Monkey TO-DO"`.
- `src/db/index.ts` (AGENTS.md §6: PGlite in test, `neon-http` otherwise, clear error if `DATABASE_URL` missing), `src/db/schema.ts` (empty or minimal), `drizzle.config.ts`.
- `src/lib/http.ts` helpers (`ok`, `created`, `noContent`, `fail`, `handle`, `readJson`, `parseId`).
- `vitest.config.ts` (with `@/` alias), `tests/setup.ts`, `tests/helpers.ts` (`call()` helper per AGENTS.md §9.3).
- `GET /api/health` (E-01) + `tests/api/health.test.ts`.
- `.env.example` (`DATABASE_URL=` only for now), `.gitignore` covers `.env*` except `.env.example`.
- A short `README.md`: what the app is, features (P0), tech stack, how to run locally, how to run tests, link to the docs. (The live URL gets added in Milestone 8.)

Acceptance criteria:
- **M1.1** `npm run check` passes (lint, typecheck, tests).
- **M1.2** `npm run build` passes.
- **M1.3** `/` redirects to `/tasks`; nav works between Tasks, Board, Notes on desktop (1280 px), tablet (768 px) and mobile (375 px) with no horizontal scroll.
- **M1.4** Colours, font, radius and icons match DESIGN.md; no hex values or Tailwind palette colours in components; no emoji anywhere.
- **M1.5** `health.test.ts` covers the E-01 cases in FRD §6.
- **M1.6** Code is committed locally in small commits.

**"Your action needed" for this milestone must include a complete, beginner-friendly setup guide** covering, in order:
1. **GitHub:** create the empty public repo `bhuchee/monkey-to-do` (no README, no .gitignore, no licence), then the exact commands to add the remote and push `main` (or offer to do it with `gh` if it's installed and logged in — ask first).
2. **Vercel:** sign up/log in with GitHub → Add New → Project → import `monkey-to-do` → framework Next.js → confirm the build command will use `vercel-build` → deploy. Note the region setting.
3. **Neon via Vercel:** Vercel project → Storage → Create Database → Neon (free) → choose the region **closest to the Vercel functions region** (default Washington `iad1` ↔ Neon US East) → connect to all environments → confirm `DATABASE_URL` appears in Settings → Environment Variables → Redeploy.
4. **Local database:** in the Neon console, create a branch named `dev` → copy its connection string → create `.env.local` with `DATABASE_URL=<that string>` → restart `npm run dev`.
5. **Verify:** open `https://<live-url>/api/health` and confirm `{"data":{"status":"ok","db":"ok"}}`; open the live URL and confirm the shell loads.
6. **Send back:** the live URL, and "health ok" (or the exact error text / a screenshot of the Vercel build log if it failed).

After I send the live URL, curl `/api/health` yourself, record the result, and keep the URL in `README.md` from then on.

### Milestone 2 — Guest workspace
**Features:** F-02, E-02. **Target:** ~19:00.

Build: `users` table + migration (FRD §2.1); `middleware.ts` (FRD §3.2 — pages only, sets cookie on response and forwards it on the request); `requireUser(request)` in `src/lib/session.ts` (reads cookie from request headers, upserts guest row, ignores cookies of non-guest users, 401 otherwise); `GET /api/me` + `tests/api/me.test.ts`; `GuestBanner` (DESIGN.md §6.8, dismissal in `localStorage` inside try/catch).

Acceptance criteria:
- **M2.1** First visit in a private window sets `mtd_guest` (HttpOnly, SameSite=Lax, Secure in production, 1 year) with no login prompt (F-02.1).
- **M2.2** `/api/me` without cookie → 401; with cookie → 200 guest shape and creates the user row (F-02.3, E-02 tests).
- **M2.3** Guest banner shows, can be dismissed, stays dismissed on refresh (F-02.4).
- **M2.4** Migration applied locally (dev branch) and via `vercel-build` on deploy; live `/api/me` works after visiting a page (show your curl with a cookie jar).
- **M2.5** `npm run check` passes; pushed; live deploy healthy.

### Milestone 3 — Tasks API
**Features:** F-03 – F-08 (API side), E-03 – E-07. **Target:** ~19:30.

Build: `tasks` table + enums + indexes + migration (FRD §2.2, without `category_id`); Zod schemas (FRD §3.5, strict, trimmed, real calendar dates); serializers; query functions scoped by `user_id`; route handlers per AGENTS.md §7; `completedAt` rules; list filters `q`, `status`, `priority`, `due` + `today`, default sort, 500 cap; `tests/api/tasks.test.ts` covering **every** row for E-03 – E-07 in FRD §6 "Minimum test cases", including two-guest isolation.

Acceptance criteria:
- **M3.1** All E-03 – E-07 behaviours match FRD §3 (status codes, envelope, shapes, `categoryId: null`, no `userId`).
- **M3.2** Every minimum test case in FRD §6 for E-03 – E-07 exists and passes. List the test names in the report.
- **M3.3** Guest A can't read, update or delete guest B's task (404) (F-02.2, F-02.5).
- **M3.4** Invalid UUID → 404; malformed JSON / unknown field / empty PATCH → 400.
- **M3.5** Live smoke test (AGENTS.md §9.7) creates and lists a task on the live URL; paste the curl output.
- **M3.6** `npm run check` passes; pushed.

### Milestone 4 — Tasks UI
**Features:** F-03, F-04, F-05, F-06, F-07. **Target:** ~20:15.

Build: SWR hooks + `api-client.ts`; `TaskList`, `TaskRow`, `TaskDialog` (create + edit, shared later with Board), `ConfirmDialog`, `PriorityBadge`, `StatusBadge`, `DueChip` with Overdue/Today rules using the user's local date; optimistic checkbox with rollback; toasts; loading/empty/error states.

Acceptance criteria:
- **M4.1** Every criterion F-03.1–F-03.6, F-04.1–F-04.5, F-05.1–F-05.3, F-06.1–F-06.3, F-07.1–F-07.3 passes — list each one in the table with how you checked it.
- **M4.2** Matches DESIGN.md §6.1–6.4, §6.8, §6.9 at 375 / 768 / 1280 px.
- **M4.3** Keyboard: Tab order, Enter submits, Esc closes, focus returns to trigger, visible focus rings.
- **M4.4** No browser console errors; `npm run check` passes; pushed; works on the live URL (create, edit, complete, delete, refresh persists).

### Milestone 5 — Search & filter
**Features:** F-08 (UI). **Target:** ~20:45.

Build: `TaskFilters` (search with 300 ms debounce, Status, Priority, Due: All / Overdue / Today / Next 7 days / No date, Clear filters), URL query state, local `today` sent with `due`, filtered-empty state.

Acceptance criteria:
- **M5.1** F-08.1–F-08.6 all pass.
- **M5.2** Refreshing or sharing `/tasks?q=…&status=…` restores the same filters and results.
- **M5.3** Works at 375 px (filters wrap or collapse cleanly, no horizontal scroll).
- **M5.4** `npm run check` passes; pushed; verified on the live URL.

### Milestone 6 — Notes
**Features:** F-09, E-08 – E-12. **Target:** ~21:30.

Build: `notes` table + migration; Zod schemas; routes; `tests/api/notes.test.ts` covering every FRD §6 minimum case for E-08 – E-12; `NoteList`, `NoteEditor` (two-pane desktop, list → editor with Back on mobile, `/notes?id=` selection); create-on-click; 800 ms autosave with Saving/Saved/retry states that never discard text; delete with confirm; search; empty state.

Acceptance criteria:
- **M6.1** All E-08 – E-12 tests pass, including isolation and 404s. List the test names.
- **M6.2** F-09.1–F-09.7 all pass.
- **M6.3** Typing fast, switching notes, and refreshing never loses text (explain how you verified).
- **M6.4** Matches DESIGN.md §6.6; `npm run check` passes; pushed; verified on the live URL.

### Milestone 7 — Kanban board
**Features:** F-10. **Target:** ~22:15.

Build: `Board`, `BoardColumn`, `TaskCard` with `@dnd-kit/core` (mouse + touch sensors); optimistic status change with rollback + toast; card More menu with Move to / Edit / Delete; per-column "Add task" presetting status; reuse `TaskDialog`; column sort (priority, then due date); mobile horizontal column scroll with snap inside the board only.

Acceptance criteria:
- **M7.1** F-10.1–F-10.7 all pass.
- **M7.2** A drag survives refresh; a failed PATCH (simulate by stopping the dev server or forcing an error) puts the card back and shows an error toast.
- **M7.3** Moving via the menu works with keyboard only.
- **M7.4** Matches DESIGN.md §6.5; `npm run check` passes; pushed; verified on the live URL.

### Milestone 8 — Release validation and handover
**Target:** 22:15–23:00. **Code freeze at 23:00** — after that, only fixes for release blockers.

Do:
- Run the full **PRD §8 release checklist** against the live URL and report each item (pass/fail + evidence). Skip only the Google item (P1, not built).
- Run the **AGENTS.md §10 definition of done** for every P0 feature; list any gaps.
- Final `npm run check`, clean `git status`, everything pushed, Vercel production deploy healthy.
- Update `README.md`: live URL, feature list with the IDs, tech stack, screenshots optional (no emoji), local setup, tests, links to PRD/FRD/DESIGN/AGENTS.
- Security pass: no secrets in the repo (`git grep` for `postgres://` and `DATABASE_URL=` with values), `.env.local` is ignored.

Acceptance criteria:
- **M8.1** Every PRD §8 item except the Google one passes on the live URL.
- **M8.2** All tests pass; total test count and per-file counts reported.
- **M8.3** README is complete and shows the live URL.
- **M8.4** Repo contains PRD.md, FRD.md, DESIGN.md, AGENTS.md, CLAUDE.md, BUILD_PROMPT.md.

**"Your action needed" for this milestone must include:**
1. A 5-minute manual test script for me to run on my phone and laptop.
2. How to find the Stage 1 submission form on Zedu (announcements / announcements-project channel) and exactly what to submit: the live URL (and the repo URL `https://github.com/bhuchee/monkey-to-do` if asked).
3. A reminder to confirm the exact deadline on Zedu before submitting.
4. A short list of the P1 items we could do next if there's time left, in PRD order (Calendar → Categories → Google sign-in) — **do not start them without my approval.**

---

## Final rules (repeat of the non-negotiables)

- P0 only. Stop at every milestone and wait for "approved".
- Every endpoint has tests in the same milestone; `npm run check` green before every commit; never skip or weaken tests.
- Follow FRD for behaviour, DESIGN for visuals, AGENTS for process.
- No emoji anywhere. Lucide icons only. Tokens only.
- One Next.js app on Vercel + Neon. No separate backend, no extra libraries without asking.
- Never commit secrets. Never ask me to paste secrets into chat.
- Always tell me what I need to do, step by step, and what to send back.

**Start now with Milestone 1.**

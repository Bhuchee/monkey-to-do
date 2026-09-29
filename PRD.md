# Monkey TO-DO — Product Requirements Document (PRD)

| | |
|---|---|
| **Product** | Monkey TO-DO |
| **Owner** | Brian Ibekwe (PM) — GitHub `bhuchee` |
| **Repo** | `bhuchee/monkey-to-do` |
| **Context** | HNG Internship 15 — Stage 1 (AI Product Builder / Engineer) |
| **Status** | Approved for build — 29 Sep 2026 |
| **Deadline** | Submit live URL by **29 Sep 2026, 23:59 WAT** (confirm on Zedu) |
| **Related docs** | [FRD.md](./FRD.md) (what to build, exactly) · [DESIGN.md](./DESIGN.md) (how it looks) · [AGENTS.md](./AGENTS.md) (how the AI agent must work) |

---

## 1. Problem

People juggle tasks and loose thoughts across several apps: a to-do list here, a notes app there, a whiteboard somewhere else. Switching between them loses context, and most free to-do apps demand an account before you can try anything.

## 2. Solution

Monkey TO-DO is one focused workspace for **tasks** and **notes**, with two extra ways to see tasks: a **Kanban board** and (P1) a **calendar**. Anyone can start using it instantly in a private **guest workspace** — no sign-up — and (P1) sign in with Google to keep their data across devices.

## 3. Target users

| User | Need | What they judge us on |
|---|---|---|
| **HNG grader / mentor** (primary for today) | Open the live URL and verify tasks, notes and extra features work | Works first time, no login wall, looks professional, repo has AGENTS.md + tests |
| **Student / early-career professional** | Track assignments and personal tasks with deadlines | Fast capture, clear deadlines, overdue visibility |
| **Small team member / freelancer** | See work by stage and jot meeting notes | Kanban clarity, quick notes |

## 4. Goals and non-goals

### Goals (today)
1. Meet every HNG Stage 1 requirement: to-do app, notes, at least one extra feature, built with AI, deployed publicly, AGENTS.md with testing rules.
2. A grader can create a task within **10 seconds** of opening the URL — no sign-up.
3. Every API endpoint has automated tests that pass.
4. Looks like a professional product: consistent design system, icons (no emoji), real empty/loading/error states.

### Non-goals (not doing today)
- Email/password accounts, password reset, email sending.
- Collaboration, sharing, or multiple users on one workspace.
- Reminders / push notifications, recurring tasks, sub-tasks, file attachments.
- Native mobile apps (the web app must still work well on a phone).
- Offline mode.

## 5. Scope and priorities

Priorities are strict. **Do not start a P1 item until every P0 item is live and passing on the deployed URL.**

| ID | Feature | Priority | Notes |
|---|---|---|---|
| F-01 | App shell & navigation | **P0** | Sidebar (desktop) / bottom tabs (mobile) |
| F-02 | Guest workspace | **P0** | Private workspace per browser via cookie; no login |
| F-03 | Create task | **P0** | Title, description, priority, due date, status |
| F-04 | View task list | **P0** | Sorted, with overdue indicator |
| F-05 | Edit task | **P0** | All fields |
| F-06 | Delete task | **P0** | With confirmation |
| F-07 | Change status / complete | **P0** | Checkbox + status select |
| F-08 | Search & filter tasks | **P0** | Keyword, status, priority, due (overdue / today / next 7 days / no date) |
| F-09 | Notes | **P0** | Standalone section: create, list, search, edit (autosave), delete |
| F-10 | Kanban board | **P0** | To Do / In Progress / Done, drag to move |
| F-11 | Health check endpoint | **P0** | For deploy verification |
| F-12 | Calendar view | P1 | Month grid of tasks by due date |
| F-13 | Categories | P1 | Name + colour, assign to tasks, filter |
| F-14 | Google sign-in | P1 | Keeps guest data on sign-in |
| F-15 | Link notes to tasks | P2 | After submission |
| F-16 | Drag to reschedule on calendar | P2 | After submission |
| F-17 | Light/dark theme toggle | P2 | After submission (MVP is dark only) |

Full requirements and acceptance criteria for each ID are in [FRD.md](./FRD.md).

## 6. Key decisions

| Decision | Choice | Why |
|---|---|---|
| Architecture | **One Next.js app on Vercel** (pages + API route handlers) | One project, one deploy, no server sleeping, no cross-domain cookie problems. A separate backend (e.g. NestJS on Render) was rejected for today: two deploys, CORS/cookie issues, and Render's free plan sleeps (30–60 s cold start). |
| Database | **Neon Postgres** (free) via Vercel's Neon integration | Native Vercel integration sets `DATABASE_URL` automatically; serverless driver fits Vercel functions; real Postgres. |
| Auth | **Guest workspace first (P0), Google sign-in via Auth.js (P1)** | Graders can use the app instantly. Email/password + reset rejected: needs email service, hashing, tokens, extra screens — 2–3 hours we don't have. Every table has `user_id` from day one so Google sign-in adds on without schema changes. |
| Theme | Dark UI, banana-yellow accent | Approved palette — see [DESIGN.md](./DESIGN.md). |
| Build tool | Claude Code in the IDE, guided by AGENTS.md | HNG requires the app be coded with AI. |

Full stack list: [AGENTS.md §2](./AGENTS.md#2-tech-stack-fixed).

## 7. Build plan (today, WAT)

| By | Milestone | Features |
|---|---|---|
| 17:45 | Docs agreed, repo created with docs in root | — |
| 18:30 | **Skeleton live on Vercel** with Neon connected; `/api/health` returns ok | F-01 shell, F-11 |
| 19:15 | Guest workspace + task API with tests | F-02, F-03–F-07 API |
| 20:15 | Tasks UI complete (list, create, edit, delete, complete) | F-03–F-07 UI |
| 20:45 | Search & filter | F-08 |
| 21:30 | Notes (API + tests + UI) | F-09 |
| 22:15 | Kanban board | F-10 |
| 22:15–23:00 | P1 only if everything above is live and green: Calendar → Categories → Google sign-in | F-12, F-13, F-14 |
| **23:00** | **Code freeze.** Final deploy. Test the live URL against the checklist in §8. | — |
| **23:30** | **Submit live URL on Zedu.** | — |

If a milestone slips by more than 30 minutes, cut P1 entirely and protect the P0 list.

## 8. Release checklist (run on the live URL)

- [ ] Opening the URL in a private window lands on Tasks with no login prompt.
- [ ] Create, edit, complete and delete a task; refresh — changes persist.
- [ ] Overdue task shows the Overdue label.
- [ ] Search and each filter narrow the list correctly.
- [ ] Create, edit (autosave), search and delete a note; refresh — changes persist.
- [ ] Drag a card between Kanban columns; refresh — it stays moved.
- [ ] A second browser/private window sees **none** of the first window's data.
- [ ] `/api/health` returns `{"data":{"status":"ok","db":"ok"}}`.
- [ ] Works at phone width (375 px) with no horizontal scroll.
- [ ] `npm test` passes; repo contains PRD.md, FRD.md, DESIGN.md, AGENTS.md, CLAUDE.md.
- [ ] (If F-14 shipped) Google consent screen is **published to production**, not Testing.

## 9. Success metrics

| Metric | Target |
|---|---|
| Submission | Live URL submitted before 23:59 WAT |
| P0 acceptance criteria passing on the live URL | 100% |
| API endpoints with passing tests | 100% |
| Time from opening URL to first task created | ≤ 10 s |
| Console errors on any P0 screen | 0 |

## 10. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Time runs out | Miss deadline | Strict P0/P1 cut; deploy skeleton first; code freeze at 23:00 |
| Guest clears cookies / switches browser | Loses access to guest data | Guest banner says data lives in this browser; Google sign-in (P1) fixes it |
| Google consent screen left in Testing | Graders can't sign in | Checklist item; guest mode still works regardless |
| Neon free tier idle pause | ~0.5 s slower first request | Acceptable; show loading skeletons |
| Migration not applied on Vercel | Live app errors | `vercel-build` runs migrations before `next build` (AGENTS.md §9) |

## 11. Open questions

None blocking. Post-submission: decide whether to add F-15–F-17 and a separate backend if HNG later stages require one.

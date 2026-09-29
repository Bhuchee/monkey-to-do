# Monkey TO-DO — Functional Requirements Document (FRD)

| | |
|---|---|
| **Version** | 1.0 — 29 Sep 2026 |
| **Scope source** | [PRD.md §5](./PRD.md#5-scope-and-priorities) |
| **Look & feel** | [DESIGN.md](./DESIGN.md) |
| **Build rules** | [AGENTS.md](./AGENTS.md) |

This document is the single source of truth for **what** each feature does, **what data** it uses, **which endpoints** serve it and **which screen** shows it. If code and this document disagree, the code is wrong — or this document must be updated first, in the same commit.

**Contents:** 1. Conventions · 2. Data model · 3. API contract · 4. Screens · 5. Features and acceptance criteria · 6. Traceability matrix · 7. Out of scope

---

## 1. Conventions

- **Priority:** P0 = must ship today. P1 = only after all P0 is live. P2 = after submission.
- **Feature IDs** (`F-01`…) are permanent. Reference them in commits, tests and PRs.
- **Acceptance criteria IDs** are `F-xx.n` (e.g. `F-03.2`). Each one should be verifiable by a test or a manual check.
- **Dates:** `due_date` is a calendar date (no time, no timezone), sent as `YYYY-MM-DD`. "Today" and "overdue" are computed from the **user's local date**. Timestamps (`created_at` etc.) are UTC ISO 8601 strings.
- **JSON** uses `camelCase`. **Database** uses `snake_case`.

---

## 2. Data model

Postgres (Neon). Defined in Drizzle at `src/db/schema.ts`. All `id` columns are `uuid` with `gen_random_uuid()` default. All tables have `created_at` and `updated_at` (`timestamptz`, default `now()`; `updated_at` is set by the app on every update).

### 2.1 `users` — P0 (Google fields used from P1)

| Column | Type | Rules |
|---|---|---|
| `id` | uuid PK | For guests, equals the value of the `mtd_guest` cookie |
| `is_guest` | boolean | not null, default `true` |
| `google_id` | text | unique, null for guests (P1) |
| `email` | text | unique, null for guests (P1) |
| `name` | text | null (P1) |
| `image` | text | null (P1) |
| `created_at`, `updated_at` | timestamptz | |

### 2.2 `tasks` — P0

| Column | Type | Rules |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | uuid FK → `users.id` | not null, `ON DELETE CASCADE` |
| `title` | varchar(200) | not null; trimmed; 1–200 chars |
| `description` | text | not null, default `''`; max 5,000 chars |
| `status` | enum `task_status` (`todo`, `in_progress`, `done`) | not null, default `todo` |
| `priority` | enum `task_priority` (`low`, `medium`, `high`) | not null, default `medium` |
| `due_date` | date | null |
| `category_id` | uuid FK → `categories.id` | null, `ON DELETE SET NULL` (column added in P1 migration) |
| `completed_at` | timestamptz | null. Set to now when status becomes `done`; cleared when it leaves `done` |
| `created_at`, `updated_at` | timestamptz | |

Indexes: `(user_id, status)`, `(user_id, due_date)`.

### 2.3 `notes` — P0

| Column | Type | Rules |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | uuid FK → `users.id` | not null, `ON DELETE CASCADE` |
| `title` | varchar(200) | not null, default `''`; trimmed; 0–200 chars (UI shows "Untitled note" when empty) |
| `content` | text | not null, default `''`; max 20,000 chars; plain text |
| `created_at`, `updated_at` | timestamptz | |

Index: `(user_id, updated_at desc)`.

### 2.4 `categories` — P1

| Column | Type | Rules |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | uuid FK → `users.id` | not null, `ON DELETE CASCADE` |
| `name` | varchar(40) | not null; trimmed; 1–40 chars; unique per user (case-insensitive) |
| `color` | enum `category_color` (`gray`, `red`, `orange`, `yellow`, `green`, `blue`, `purple`) | not null, default `gray`. Hex values in [DESIGN.md §3.4](./DESIGN.md#34-category-colours-p1) |
| `created_at`, `updated_at` | timestamptz | |

### 2.5 Relationships

```
users 1 ──< tasks        (user_id)
users 1 ──< notes        (user_id)
users 1 ──< categories   (user_id)            P1
categories 1 ──< tasks   (category_id, null)  P1
```

**Ownership rule:** every row a user can read or change is found by `id` **and** `user_id`. A row that exists but belongs to someone else is treated as **not found (404)**.

---

## 3. API contract

All endpoints are Next.js route handlers under `src/app/api/`. All accept and return JSON.

### 3.1 Response envelope

Success:
```json
{ "data": <object | array> }
```
Error:
```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Title is required", "details": { "fieldErrors": { "title": ["Title is required"] } } } }
```

| HTTP | `code` | When |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Body or query fails validation, unknown fields, malformed JSON, empty PATCH body |
| 401 | `UNAUTHORIZED` | No valid guest cookie and no session |
| 404 | `NOT_FOUND` | Unknown route id, id not a valid UUID, or row belongs to another user |
| 409 | `CONFLICT` | Duplicate category name (P1) |
| 500 | `INTERNAL_ERROR` | Anything unexpected. Message is generic; details are logged server-side only |

`DELETE` success returns **204 No Content** with an empty body. `POST` success returns **201**.

### 3.2 Current user resolution

Every endpoint except `/api/health` and `/api/auth/*` calls `requireUser(request)`:

1. (P1) If there is a valid Auth.js session → that user.
2. Else if the `mtd_guest` cookie holds a valid UUID → upsert a `users` row with that id and `is_guest = true`, then return it. If a row with that id exists but `is_guest = false`, ignore the cookie.
3. Else → `401 UNAUTHORIZED`.

`src/middleware.ts` sets the `mtd_guest` cookie on **page** requests that lack one and have no Auth.js session: value `crypto.randomUUID()`, `HttpOnly`, `Secure` (in production), `SameSite=Lax`, `Path=/`, `Max-Age` 1 year. It sets the cookie on the response **and** forwards it on the incoming request so the first render already has it. The matcher **excludes** `/api/*`, `/_next/*` and static files — an API call with no cookie therefore gets 401 (F-02.3), because the browser always loads a page (and receives the cookie) before calling the API.

### 3.3 Object shapes

**Task**
```json
{
  "id": "uuid",
  "title": "Submit HNG Stage 1",
  "description": "",
  "status": "todo",
  "priority": "high",
  "dueDate": "2026-09-29",
  "categoryId": null,
  "completedAt": null,
  "createdAt": "2026-09-29T16:40:00.000Z",
  "updatedAt": "2026-09-29T16:40:00.000Z"
}
```
`categoryId` is always present (null until P1). `userId` is **never** returned.

**Note**
```json
{ "id": "uuid", "title": "Standup notes", "content": "…", "createdAt": "…", "updatedAt": "…" }
```

**Category (P1)**
```json
{ "id": "uuid", "name": "School", "color": "blue", "createdAt": "…", "updatedAt": "…" }
```

**Me**
```json
{ "id": "uuid", "isGuest": true, "name": null, "email": null, "image": null }
```

### 3.4 Endpoints

| # | Method & path | Pri | Purpose | Success |
|---|---|---|---|---|
| E-01 | `GET /api/health` | P0 | Liveness + DB check (`select 1`) | 200 `{data:{status:"ok",db:"ok"}}`; 503 `{data:{status:"degraded",db:"error"}}` if DB fails |
| E-02 | `GET /api/me` | P0 | Current user | 200 Me |
| E-03 | `GET /api/tasks` | P0 | List tasks (filters below) | 200 Task[] |
| E-04 | `POST /api/tasks` | P0 | Create task | 201 Task |
| E-05 | `GET /api/tasks/:id` | P0 | Get one task | 200 Task |
| E-06 | `PATCH /api/tasks/:id` | P0 | Update any task fields | 200 Task |
| E-07 | `DELETE /api/tasks/:id` | P0 | Delete task | 204 |
| E-08 | `GET /api/notes` | P0 | List notes (`q` filter) | 200 Note[] |
| E-09 | `POST /api/notes` | P0 | Create note | 201 Note |
| E-10 | `GET /api/notes/:id` | P0 | Get one note | 200 Note |
| E-11 | `PATCH /api/notes/:id` | P0 | Update note | 200 Note |
| E-12 | `DELETE /api/notes/:id` | P0 | Delete note | 204 |
| E-13 | `GET /api/categories` | P1 | List categories (by name) | 200 Category[] |
| E-14 | `POST /api/categories` | P1 | Create category | 201 Category / 409 |
| E-15 | `PATCH /api/categories/:id` | P1 | Rename / recolour | 200 Category / 409 |
| E-16 | `DELETE /api/categories/:id` | P1 | Delete; tasks keep existing with `categoryId: null` | 204 |
| E-17 | `GET/POST /api/auth/[...nextauth]` | P1 | Auth.js Google sign-in / sign-out / session | Managed by Auth.js |

### 3.5 Validation (Zod, in `src/lib/validation/`)

All object schemas are **strict** (unknown keys → 400). Strings are trimmed before length checks.

**Task create (`POST /api/tasks`)**

| Field | Required | Rule |
|---|---|---|
| `title` | yes | string, 1–200 after trim. Error: "Title is required" / "Title must be 200 characters or fewer" |
| `description` | no | string, ≤ 5,000; default `''` |
| `status` | no | `todo` \| `in_progress` \| `done`; default `todo` |
| `priority` | no | `low` \| `medium` \| `high`; default `medium` |
| `dueDate` | no | `YYYY-MM-DD` and a real calendar date, or `null` |
| `categoryId` | no (P1) | UUID of a category owned by the user, or `null`. Otherwise 400 "Category not found" |

**Task update (`PATCH /api/tasks/:id`)** — same fields, all optional, **at least one** required (else 400 "Nothing to update"). Status transitions are free (any → any); `completedAt` follows the rule in §2.2.

**Task list query (`GET /api/tasks`)** — all optional; invalid values → 400.

| Param | Values | Behaviour |
|---|---|---|
| `q` | string ≤ 100 | Case-insensitive match on `title` OR `description` |
| `status` | `todo` \| `in_progress` \| `done` | Exact match |
| `priority` | `low` \| `medium` \| `high` | Exact match |
| `due` | `overdue` \| `today` \| `week` \| `none` | `overdue`: `due_date < today` and `status != done`. `today`: `= today`. `week`: `today ≤ due_date ≤ today + 6 days`. `none`: `due_date is null` |
| `today` | `YYYY-MM-DD` | Client's local date, used by `due`. Defaults to the server's UTC date if omitted |
| `dueFrom`, `dueTo` | `YYYY-MM-DD` | Inclusive range on `due_date` (used by Calendar, P1) |
| `categoryId` | UUID | P1 |

Default sort (no sort param): not-done before done → `due_date` ascending, nulls last → priority `high, medium, low` → `created_at` descending. Maximum 500 rows returned.

**Note create / update** — `title` 0–200 (default `''`), `content` ≤ 20,000 (default `''`). Create accepts an empty body `{}`. Update needs at least one field.

**Note list query** — `q` ≤ 100, case-insensitive on `title` OR `content`. Sort `updated_at` descending. Max 500.

**Category create / update (P1)** — `name` 1–40, `color` enum. Duplicate name (case-insensitive) for the same user → 409 "A category with this name already exists".

**Path `:id`** — not a valid UUID → 404 (never let Postgres throw a cast error).

---

## 4. Screens

Layout, spacing and components are defined in [DESIGN.md](./DESIGN.md). Routes use the App Router.

| Route | Screen | Pri | Features |
|---|---|---|---|
| `/` | Redirects to `/tasks` | P0 | F-01 |
| `/tasks` | Task list with filter bar, "New task" button, task dialog | P0 | F-03–F-08 |
| `/board` | Kanban: To Do · In Progress · Done | P0 | F-10 |
| `/notes` | Notes list + editor (`/notes?id=<uuid>` selects a note) | P0 | F-09 |
| `/calendar` | Month grid + "Unscheduled" list | P1 | F-12 |
| App shell | Sidebar / bottom tabs, guest banner, (P1) sign-in button | P0 | F-01, F-02, F-14 |

Shared: **Task dialog** (create + edit) is one component used by `/tasks`, `/board` and `/calendar`.

---

## 5. Features and acceptance criteria

### F-01 App shell & navigation — P0
Persistent layout that gets users to every section.
- **F-01.1** Desktop (≥ 1024 px): left sidebar with logo and nav items Tasks, Board, Calendar (P1), Notes, each with a Lucide icon and label.
- **F-01.2** Mobile (< 768 px): bottom tab bar with the same items; no horizontal scroll at 375 px.
- **F-01.3** The active route is visibly highlighted and has `aria-current="page"`.
- **F-01.4** `/` redirects to `/tasks`.
- **F-01.5** Page `<title>` is `"<Section> · Monkey TO-DO"`.

### F-02 Guest workspace — P0
Anyone can use the app immediately with private data.
- **F-02.1** First visit sets an `mtd_guest` cookie as specified in §3.2 — no login screen, no prompt.
- **F-02.2** Two different browsers (or a normal and a private window) never see each other's tasks, notes or categories.
- **F-02.3** Any `/api/*` call (except health/auth) without a valid cookie or session returns 401.
- **F-02.4** While the user is a guest, the shell shows a dismissible banner: "You're in a guest workspace. Your data is saved in this browser." (P1 adds a "Sign in with Google to keep it" action.)
- **F-02.5** Accessing another user's task/note/category by id returns 404.

### F-03 Create task — P0
- **F-03.1** "New task" button on `/tasks` (and "Add task" in the Board's To Do column) opens the task dialog.
- **F-03.2** Dialog fields: Title (required, autofocused), Description, Status (default To Do; preset to the column when opened from Board), Priority (default Medium), Due date (optional), Category (P1).
- **F-03.3** Submitting with an empty title shows the inline error "Title is required" and does not call the API.
- **F-03.4** On success: dialog closes, the task appears in the list without a page reload, toast "Task created".
- **F-03.5** On API error: dialog stays open with the user's input intact; the server message is shown.
- **F-03.6** `Enter` in the title field submits; `Esc` closes.

### F-04 View task list — P0
- **F-04.1** `/tasks` shows the user's tasks in the default sort (§3.5).
- **F-04.2** Each row shows: completion checkbox, title, one-line description preview (if any), priority badge, due date chip (if any), status badge, and a "More" menu (Edit, Delete).
- **F-04.3** A task with `dueDate` before the user's local today and status not `done` shows an **Overdue** label in the danger colour, with an icon (not colour alone). Due today shows "Today".
- **F-04.4** Done tasks show a checked box and a struck-through, muted title.
- **F-04.5** Loading shows skeleton rows; an API error shows an error state with a "Try again" button; no tasks shows the empty state "No tasks yet" with a "New task" button.

### F-05 Edit task — P0
- **F-05.1** Clicking a task row (or More → Edit) opens the task dialog filled with the task's values.
- **F-05.2** Saving sends `PATCH` with only changed fields; the list updates without reload; toast "Task updated".
- **F-05.3** Validation and error behaviour match F-03.3 and F-03.5.

### F-06 Delete task — P0
- **F-06.1** More → Delete opens a confirmation dialog: "Delete this task? This can't be undone." with Cancel / Delete (danger button).
- **F-06.2** Confirming sends `DELETE`, removes the task from every view, toast "Task deleted".
- **F-06.3** Deleting an already-deleted task shows "Task not found" and refreshes the list.

### F-07 Change status / complete — P0
- **F-07.1** Ticking the checkbox sets status `done`; unticking sets `todo`. The UI updates optimistically and reverts with an error toast if the API fails.
- **F-07.2** Status can also be set to any value in the task dialog.
- **F-07.3** `completedAt` is set when a task becomes `done` and cleared when it leaves `done` (server-side).

### F-08 Search & filter tasks — P0
- **F-08.1** Filter bar on `/tasks`: search input, Status select (All, To Do, In Progress, Done), Priority select (All, High, Medium, Low), Due select (All, Overdue, Today, Next 7 days, No date), Category select (P1), and "Clear filters" (shown only when a filter is active).
- **F-08.2** Search is debounced 300 ms and matches title or description, case-insensitive.
- **F-08.3** Filters combine with AND.
- **F-08.4** Filter state is stored in the URL query (`/tasks?q=report&status=todo`) so refresh and sharing keep it.
- **F-08.5** The client sends its local `today` with every `due` filter.
- **F-08.6** No results with filters active shows "No tasks match your filters" with a "Clear filters" button.

### F-09 Notes — P0
A standalone section for free-form notes.
- **F-09.1** `/notes` desktop: two panes — list (left, 320 px) and editor (right). Mobile: list view, tapping a note opens the editor full-screen with a Back button.
- **F-09.2** "New note" creates an empty note immediately (`POST {}`), selects it and focuses the title.
- **F-09.3** List items show title (or "Untitled note"), first line of content, and relative updated time ("5 min ago"); sorted by most recently updated.
- **F-09.4** Search input filters by title or content (debounced 300 ms).
- **F-09.5** Editor: title input + plain-text content area. Changes **autosave** 800 ms after typing stops. A status reads "Saving…" then "Saved". On failure: "Couldn't save — retrying" and retry on next change; the text is never discarded.
- **F-09.6** Delete (icon button in the editor header) asks for confirmation, then removes the note and selects the next note or shows the empty state.
- **F-09.7** Empty state: "No notes yet" with a "New note" button. The selected note is reflected in the URL (`/notes?id=…`).

### F-10 Kanban board — P0
- **F-10.1** `/board` shows three columns — To Do, In Progress, Done — each with a task count in the header.
- **F-10.2** Cards show title, priority badge, due date chip (with Overdue rule from F-04.3) and category (P1). Within a column, cards sort by priority (high first) then due date (soonest first, none last).
- **F-10.3** Dragging a card to another column changes its status (`PATCH {status}`) with an optimistic update; on failure the card returns and an error toast shows. Works with mouse and touch.
- **F-10.4** Keyboard/mobile alternative: each card's More menu has "Move to → To Do / In Progress / Done", plus Edit and Delete.
- **F-10.5** Clicking a card opens the task dialog. "Add task" at the top of each column opens the dialog with that status preset.
- **F-10.6** On mobile the columns scroll horizontally inside the board area only (snap per column); the page itself does not scroll horizontally.
- **F-10.7** Board and task list read the same data: a change in one is visible in the other after navigation without reload.

### F-11 Health check — P0
- **F-11.1** `GET /api/health` needs no cookie, runs `select 1`, and returns per E-01.
- **F-11.2** Used after each deploy to confirm the app and database are connected.

### F-12 Calendar view — P1
- **F-12.1** `/calendar` shows a month grid (weeks start Monday) with Previous / Today / Next controls and the month name.
- **F-12.2** Fetches tasks with `dueFrom`/`dueTo` covering the visible grid. Each day cell lists up to 3 tasks (title + priority dot), then "+N more" which opens a popover with the full list.
- **F-12.3** Clicking a task opens the task dialog; clicking an empty area of a day opens "New task" with that due date preset.
- **F-12.4** Today's cell is highlighted; overdue, not-done tasks use the danger style; done tasks are struck through.
- **F-12.5** An "Unscheduled" panel lists tasks with no due date (desktop: right column; mobile: below the grid).
- **F-12.6** Mobile (< 768 px): an agenda list of the month's days that have tasks, instead of the grid.

### F-13 Categories — P1
- **F-13.1** Categories are managed from a "Manage categories" dialog (link under the Category select in the task dialog and in the filter bar): create, rename, recolour, delete.
- **F-13.2** Tasks can be assigned one category (or none) in the task dialog; the category shows as a coloured chip on list rows, board cards and calendar popovers.
- **F-13.3** Filter bar gets a Category select; URL param `categoryId`.
- **F-13.4** Deleting a category asks for confirmation and leaves its tasks uncategorised.
- **F-13.5** Duplicate names (case-insensitive) are rejected with "A category with this name already exists".

### F-14 Google sign-in — P1
- **F-14.1** The shell shows "Sign in with Google" (in the guest banner and the sidebar footer). Uses Auth.js with the Google provider, JWT session strategy, scopes `openid email profile` only.
- **F-14.2** On first Google sign-in, the current guest user row is **upgraded in place**: `is_guest=false`, `google_id`, `email`, `name`, `image` set. All guest tasks/notes/categories are kept with no copying.
- **F-14.3** If a user with that `google_id` already exists (e.g. second device), the guest's tasks, notes and categories are moved to the existing user (category name clashes: guest category is merged into the existing one), then the guest row is deleted.
- **F-14.4** On successful sign-in the `mtd_guest` cookie is deleted. A guest cookie pointing to a non-guest user is never accepted (§3.2).
- **F-14.5** Signed-in users see their avatar and name in the sidebar footer with a "Sign out" action. Signing out starts a fresh, empty guest workspace.
- **F-14.6** The Google OAuth consent screen is **published to production** before submission.

### F-15 – F-17 — P2 (after submission)
- **F-15 Link notes to tasks** — `note_tasks` join table; show linked notes on the task dialog and linked tasks in the note editor.
- **F-16 Drag to reschedule on calendar** — drop a task on a day to change `dueDate`.
- **F-17 Light/dark toggle** — light theme tokens + toggle; respects system preference.

---

## 6. Traceability matrix

Every P0/P1 feature mapped to its data, endpoints, screens/components and tests. Test files live in `tests/api/`.

| Feature | Pri | Tables | Endpoints | Screens / components | Tests |
|---|---|---|---|---|---|
| F-01 Shell & nav | P0 | — | — | `app/(app)/layout.tsx`, `components/layout/Sidebar`, `BottomNav` | Manual (release checklist) |
| F-02 Guest workspace | P0 | users | E-02 + all via `requireUser` | `middleware.ts`, `lib/session.ts`, `components/layout/GuestBanner` | `me.test.ts`; isolation + 401 cases in `tasks.test.ts`, `notes.test.ts` |
| F-03 Create task | P0 | tasks | E-04 | `/tasks`, `components/tasks/TaskDialog` | `tasks.test.ts` → create |
| F-04 View task list | P0 | tasks | E-03 | `/tasks`, `TaskList`, `TaskRow`, `DueChip` | `tasks.test.ts` → list, sort |
| F-05 Edit task | P0 | tasks | E-05, E-06 | `TaskDialog` | `tasks.test.ts` → get, update |
| F-06 Delete task | P0 | tasks | E-07 | `TaskRow` menu, `ConfirmDialog` | `tasks.test.ts` → delete |
| F-07 Status / complete | P0 | tasks | E-06 | `TaskRow` checkbox, `TaskDialog` | `tasks.test.ts` → completedAt rules |
| F-08 Search & filter | P0 | tasks | E-03 (`q`, `status`, `priority`, `due`, `today`) | `components/tasks/TaskFilters` | `tasks.test.ts` → filters |
| F-09 Notes | P0 | notes | E-08 – E-12 | `/notes`, `components/notes/NoteList`, `NoteEditor` | `notes.test.ts` |
| F-10 Kanban board | P0 | tasks | E-03, E-06 | `/board`, `components/board/Board`, `BoardColumn`, `TaskCard` | Covered by `tasks.test.ts` (status update); manual drag check |
| F-11 Health | P0 | — | E-01 | — | `health.test.ts` |
| F-12 Calendar | P1 | tasks | E-03 (`dueFrom`, `dueTo`) | `/calendar`, `components/calendar/MonthGrid`, `AgendaList`, `UnscheduledList` | `tasks.test.ts` → date range |
| F-13 Categories | P1 | categories, tasks.category_id | E-13 – E-16, E-03 (`categoryId`), E-04/E-06 | `components/categories/ManageCategoriesDialog`, `CategoryChip` | `categories.test.ts`; category cases in `tasks.test.ts` |
| F-14 Google sign-in | P1 | users (+ moves tasks, notes, categories) | E-17, E-02 | `auth.ts`, `components/layout/UserMenu`, `GuestBanner` | `auth-merge.test.ts` (upgrade + merge logic in `lib/account-merge.ts`) |

### Minimum test cases per endpoint

| Endpoint | Must cover |
|---|---|
| E-01 | 200 shape; no cookie needed |
| E-02 | 401 without cookie; 200 guest shape with cookie; creates user row on first call |
| E-03 | Empty list; own tasks only; each filter (`q`, `status`, `priority`, each `due` value); combined filters; default sort; invalid param → 400 |
| E-04 | 201 with defaults; all fields; missing/blank title → 400; title > 200 → 400; bad enum → 400; bad date (`2026-02-30`) → 400; unknown field → 400; 401 |
| E-05 | 200 own; 404 other user's; 404 invalid UUID; 404 unknown |
| E-06 | Partial update; empty body → 400; → `done` sets `completedAt`; leaving `done` clears it; `updatedAt` changes; 404 other user's |
| E-07 | 204; then GET → 404; 404 other user's |
| E-08 – E-12 | Same pattern as tasks: create with `{}`; length limits; `q` search; sort by `updatedAt`; isolation; 404s; 204 |
| E-13 – E-16 (P1) | CRUD; 409 duplicate (case-insensitive); delete leaves tasks with `categoryId: null`; isolation |

---

## 7. Out of scope (today)

Email/password auth, password reset, sharing/collaboration, reminders/notifications, recurring tasks, sub-tasks, attachments, rich-text/Markdown notes, manual ordering within Kanban columns, offline mode, pagination beyond 500 rows, analytics.

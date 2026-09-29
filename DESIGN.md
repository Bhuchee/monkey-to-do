# Monkey TO-DO — Design System (DESIGN.md)

| | |
|---|---|
| **Version** | 1.0 — 29 Sep 2026 |
| **Theme** | Dark only for MVP (light theme is F-17, P2) |
| **Stack** | Tailwind CSS v4 + shadcn/ui components + Lucide icons |
| **Related** | [FRD.md](./FRD.md) (screens and behaviour) · [AGENTS.md](./AGENTS.md) (rules the agent enforces) |

Every screen must look like it came from one product. When a situation isn't covered here, follow the closest existing pattern — **do not invent new colours, sizes, fonts or icon sets.**

---

## 1. Brand

**Name:** Monkey TO-DO — always written exactly like that (capital M, "TO-DO" uppercase with hyphen). In code/URLs: `monkey-to-do`.

**Personality:** focused, calm, quietly playful. Professional first; the playfulness lives only in the name, the banana accent and the logo mark — never in copy, emoji or animation.

**Logo:**
- **Mark:** Lucide `Banana` icon (20 px, stroke 2, colour `--brand-fg`) centred in a 32 × 32 px square, radius 8 px, background `--brand`.
- **Wordmark:** Inter 700, 16 px, next to the mark with 10 px gap: "Monkey" in `--text`, "TO-DO" in `--brand`.
- **Favicon:** the mark alone (`app/icon.svg`).
- Collapsed/mobile contexts use the mark alone with `aria-label="Monkey TO-DO"`.

---

## 2. Hard rules

1. **No emoji anywhere** — UI, copy, toasts, empty states, placeholders, seed data, commit-visible README screenshots. Use a Lucide icon instead.
2. **One icon set: Lucide** (`lucide-react`). No other icon libraries, no inline hand-drawn SVGs except the logo file.
3. **Colours only from the tokens in §3.** No raw hex values or Tailwind palette colours (`bg-yellow-400`, `text-gray-500`) in components.
4. **Colour is never the only signal.** Priority, status, overdue and errors always pair colour with an icon and/or text.
5. **Every interactive element has a visible focus state** (§7) and an accessible name (icon-only buttons need `aria-label` + tooltip).
6. **Every data view has four states designed:** loading, empty, error, populated (§6.8).
7. **Sentence case** for all UI text ("New task", not "New Task"). No exclamation marks.

---

## 3. Colour

### 3.1 Core tokens

All text/background pairs below meet **WCAG AA** (≥ 4.5:1 for text, ≥ 3:1 for UI boundaries). Ratios measured against `--bg` / `--surface`.

| Token | Hex | Use | Contrast |
|---|---|---|---|
| `--bg` | `#0E0F12` | App background | — |
| `--surface` | `#16181D` | Sidebar, cards, list rows, inputs, columns | — |
| `--surface-raised` | `#1E2128` | Dialogs, popovers, menus, hovered rows, kanban cards | — |
| `--border` | `#2A2E37` | Dividers, card outlines (decorative) | — |
| `--border-strong` | `#3A3F4A` | Hovered card outlines, table header divider | — |
| `--input-border` | `#636A77` | Form control borders (needs 3:1) | 3.3 : 1 on surface |
| `--text` | `#F2F3F5` | Primary text, headings | 17.3 / 16.0 |
| `--text-muted` | `#A1A7B3` | Secondary text, descriptions, timestamps, inactive nav | 7.9 / 7.4 |
| `--text-subtle` | `#7C828D` | Placeholders and disabled text only — **never on `--surface-raised`** | 5.0 / 4.6 |
| `--brand` | `#F5C542` | Banana yellow — primary buttons, active nav indicator, logo, focus ring, links | 11.8 / 11.0 |
| `--brand-hover` | `#FFD466` | Primary button hover | — |
| `--brand-pressed` | `#E0B032` | Primary button active | — |
| `--brand-fg` | `#1A1405` | Text/icons on `--brand` | 11.3 on brand |
| `--brand-soft` | `rgb(245 197 66 / 0.12)` | Active nav item background, selected note row, today cell | — |

**Use `--brand` sparingly:** one primary button per view, the active nav item, focus rings, today's date. If everything is yellow, nothing is.

### 3.2 Semantic tokens

| Token | Hex | Use | Contrast on bg / surface |
|---|---|---|---|
| `--danger` | `#F87171` | Error text, Overdue label, high priority, destructive icon | 6.9 / 6.4 |
| `--danger-solid` | `#B91C1C` | Destructive button background (white text, 6.5 : 1) | — |
| `--danger-soft` | `rgb(248 113 113 / 0.12)` | Error banners, overdue chip background | — |
| `--warning` | `#FB923C` | Medium priority, "Due today" | 8.5 / 7.9 |
| `--success` | `#4ADE80` | Done status, "Saved" indicator | 11.0 / 10.2 |
| `--info` | `#60A5FA` | In-progress status, informational toasts | 7.5 / 7.0 |
| `--neutral` | `#9CA3AF` | Low priority, To-do status | 7.6 / 7.0 |

Soft backgrounds for chips/badges: the semantic colour at **12 % opacity** (`--danger-soft` pattern), text in the full colour.

### 3.3 Priority and status mapping

| Value | Colour | Lucide icon | Label |
|---|---|---|---|
| Priority `high` | `--danger` | `SignalHigh` | High |
| Priority `medium` | `--warning` | `SignalMedium` | Medium |
| Priority `low` | `--neutral` | `SignalLow` | Low |
| Status `todo` | `--neutral` | `Circle` | To do |
| Status `in_progress` | `--info` | `CircleDot` | In progress |
| Status `done` | `--success` | `CircleCheck` | Done |
| Overdue | `--danger` | `CircleAlert` | Overdue |
| Due today | `--warning` | `CalendarClock` | Today |
| Due other | `--text-muted` | `Calendar` | `Mon 6 Oct` (or `6 Oct 2027` if another year) |

### 3.4 Category colours (P1)

Chip = colour at 12 % opacity background, full colour text and 8 px dot.

| Key | Hex |
|---|---|
| `gray` | `#9CA3AF` |
| `red` | `#F87171` |
| `orange` | `#FB923C` |
| `yellow` | `#F5C542` |
| `green` | `#4ADE80` |
| `blue` | `#60A5FA` |
| `purple` | `#C084FC` |

### 3.5 Implementation (Tailwind v4 + shadcn/ui)

Put this in `src/app/globals.css`. Components use the Tailwind names (`bg-surface`, `text-fg`, `text-fg-muted`, `border-input-border`, `bg-brand`, `text-brand-fg`, …) or the shadcn names below — never hex. Text colours are `fg-*` in Tailwind so they don't collide with shadcn's `muted` (a background).

```css
@import "tailwindcss";

:root {
  --bg: #0E0F12;
  --surface: #16181D;
  --surface-raised: #1E2128;
  --border: #2A2E37;
  --border-strong: #3A3F4A;
  --input-border: #636A77;
  --text: #F2F3F5;
  --text-muted: #A1A7B3;
  --text-subtle: #7C828D;
  --brand: #F5C542;
  --brand-hover: #FFD466;
  --brand-pressed: #E0B032;
  --brand-fg: #1A1405;
  --brand-soft: rgb(245 197 66 / 0.12);
  --danger: #F87171;
  --danger-solid: #B91C1C;
  --danger-soft: rgb(248 113 113 / 0.12);
  --warning: #FB923C;
  --success: #4ADE80;
  --info: #60A5FA;
  --neutral: #9CA3AF;

  /* shadcn/ui variable mapping — shadcn "accent" = hover surface, NOT our brand */
  --background: var(--bg);
  --foreground: var(--text);
  --card: var(--surface);
  --card-foreground: var(--text);
  --popover: var(--surface-raised);
  --popover-foreground: var(--text);
  --primary: var(--brand);
  --primary-foreground: var(--brand-fg);
  --secondary: var(--surface-raised);
  --secondary-foreground: var(--text);
  --muted: var(--surface);
  --muted-foreground: var(--text-muted);
  --accent: var(--surface-raised);
  --accent-foreground: var(--text);
  --destructive: var(--danger-solid);
  --input: var(--input-border);
  --ring: var(--brand);
  --radius: 0.5rem;

  color-scheme: dark;
}

@theme inline {
  --color-bg: var(--bg);
  --color-surface: var(--surface);
  --color-surface-raised: var(--surface-raised);
  --color-border: var(--border);
  --color-border-strong: var(--border-strong);
  --color-input-border: var(--input-border);
  --color-fg: var(--text);
  --color-fg-muted: var(--text-muted);
  --color-fg-subtle: var(--text-subtle);
  --color-brand: var(--brand);
  --color-brand-hover: var(--brand-hover);
  --color-brand-pressed: var(--brand-pressed);
  --color-brand-fg: var(--brand-fg);
  --color-brand-soft: var(--brand-soft);
  --color-danger: var(--danger);
  --color-danger-solid: var(--danger-solid);
  --color-danger-soft: var(--danger-soft);
  --color-warning: var(--warning);
  --color-success: var(--success);
  --color-info: var(--info);
  --color-neutral: var(--neutral);

  /* shadcn names */
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-input: var(--input);
  --color-ring: var(--ring);

  --font-sans: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
}

body {
  background: var(--bg);
  color: var(--text);
}
```

> When adding shadcn components, check each one uses these variables and adjust any hard-coded Tailwind palette classes it ships with.

---

## 4. Typography

**Font:** Inter via `next/font/google` (`variable: "--font-inter"`, subsets `latin`). No other fonts. Dates and counts use `tabular-nums`.

| Style | Size / line height | Weight | Use |
|---|---|---|---|
| Page title | 24 / 32 px | 600 | One per page ("Tasks", "Board", "Notes", "Calendar") |
| Section title | 18 / 28 px | 600 | Dialog titles, column headers |
| Body | 14 / 20 px | 400 | **Default UI text** — rows, inputs, buttons |
| Body strong | 14 / 20 px | 500 | Task titles, nav labels, button labels |
| Long text | 16 / 26 px | 400 | Note editor content only |
| Caption | 12 / 16 px | 500 | Badges, chips, timestamps, counts, helper text |

Don't use sizes outside this table. Truncate long titles with ellipsis on one line in lists and cards (full title in the dialog).

---

## 5. Layout and spacing

**Spacing scale (4 px base):** 4, 8, 12, 16, 20, 24, 32, 40, 48. Tailwind `1, 2, 3, 4, 5, 6, 8, 10, 12`. Nothing else.

**Radius:** 6 px — badges, chips, small buttons · 8 px — buttons, inputs, list rows, cards · 12 px — dialogs, popovers, board columns, panels · full — avatars, dots.

**Borders over shadows.** Surfaces are separated by `--border` 1 px lines. Only floating layers (dialog, popover, menu, toast) get a shadow: `0 16px 48px rgb(0 0 0 / 0.5)`.

**Breakpoints:** mobile `< 768 px` · tablet `768–1023 px` · desktop `≥ 1024 px`.

| Region | Desktop | Mobile |
|---|---|---|
| Sidebar | 240 px fixed, `--surface`, right border | Hidden |
| Bottom nav | — | 64 px + safe-area inset, `--surface`, top border, 4 items, icon over caption label |
| Page padding | 32 px | 16 px (bottom padding clears the nav) |
| Page header | Title left, primary action right, 24 px below | Same; primary action becomes icon + label, full width if it doesn't fit |
| Content width | Tasks: max 960 px · Board, Calendar: full width · Notes: full height two-pane | Single column |

**Tablet:** sidebar collapses to a 72 px icon rail (icons with tooltips).

**No horizontal page scroll at 375 px.** Board columns scroll inside their container only.

---

## 6. Components

Use shadcn/ui as the base (Button, Input, Textarea, Select, Dialog, AlertDialog, DropdownMenu, Popover, Tooltip, Checkbox, Badge, Skeleton, Sonner). Style them with the tokens above.

### 6.1 Buttons

| Variant | Style | Use |
|---|---|---|
| Primary | `bg-brand text-brand-fg`, hover `brand-hover`, active `brand-pressed` | One per view: "New task", "Save", "Create" |
| Secondary | `bg-surface-raised text-fg border border-border`, hover `border-border-strong` | "Cancel", secondary actions |
| Ghost | Transparent, `text-fg-muted`, hover `bg-surface-raised text-fg` | Toolbar actions, icon buttons, menu triggers |
| Danger | `bg-danger-solid text-white` | Confirm delete only |

Sizes: `sm` 32 px · `md` 36 px (default) · `lg` 40 px. Icon-only buttons are square (36 px) with `aria-label` and a tooltip. On mobile every tap target is at least **44 × 44 px**. Icon + label: 16 px icon, 8 px gap, icon first. Loading state: `LoaderCircle` spinning replaces the icon, button disabled, label unchanged.

### 6.2 Form controls

Height 36 px (40 px on mobile), `bg-surface`, 1 px `--input-border`, radius 8 px, 12 px horizontal padding, placeholder `--text-subtle`. Labels above the field, 14 px / 500, 8 px gap. Required fields: label followed by `*` in `--text-muted`. Error: border `--danger`, message below in 12 px `--danger` with `CircleAlert` 14 px, and `aria-invalid` + `aria-describedby`. Search inputs have a `Search` icon inside on the left.

### 6.3 Badges and chips

Height 22 px, radius 6 px, 12 px / 500, padding 0 8 px, 12 px icon with 4 px gap, soft background + full-colour text (§3.2). Used for priority, status, due date, category.

### 6.4 Task row (list)

`bg-surface`, 1 px `--border`, radius 8 px, padding 12 × 16 px, 8 px gap between rows; hover `bg-surface-raised`. Layout: checkbox · title (+ muted one-line description) · spacer · badges (category, priority, due) · status badge · More (`Ellipsis`) button. On mobile badges wrap below the title. Done: title `line-through text-fg-muted`.

### 6.5 Kanban

Column: `bg-surface`, radius 12 px, padding 12 px, min width 300 px (desktop: three equal columns). Header: status icon + name (Section title) + count caption + ghost "Add task" (`Plus`) button. Card: `bg-surface-raised`, 1 px `--border`, radius 8 px, padding 12 px; title (Body strong, max 2 lines) then a badge row. Dragging: card at 90 % opacity, `--brand` 1 px outline, `GripVertical` handle visible on hover (always visible on touch). Drop target column: `--brand-soft` background with dashed `--brand` border.

### 6.6 Notes

List pane: 320 px, `bg-surface`, right border; search at top, then "New note" (secondary, full width), then items (padding 12 px, title Body strong, preview 1 line muted, time caption). Selected item: `--brand-soft` background and 2 px left `--brand` bar. Editor: max width 720 px, title input borderless 20 / 28 px 600 weight, content textarea borderless Long text style, auto-growing. Header row: save status (caption: `LoaderCircle` "Saving…" / `Check` in `--success` "Saved" / `CircleAlert` in `--danger` "Couldn't save — retrying") and Delete ghost icon button.

### 6.7 Calendar (P1)

Grid of 7 columns, day cells min height 112 px, 1 px `--border` lines, day number caption top-left. Outside-month days: number `--text-subtle`. Today: number in a 24 px `--brand` circle with `--brand-fg` text. Task pills: 22 px, radius 6 px, `bg-surface-raised`, priority dot 6 px + truncated title. "+N more" caption link in `--text-muted`.

### 6.8 States

| State | Pattern |
|---|---|
| Loading | Skeletons matching the final layout (3–5 rows / 2 cards per column). No full-page spinners. |
| Empty | Centred: 40 px Lucide icon in a 64 px `--surface-raised` circle, `--text-muted` icon; title (Body strong); one-line description (muted); primary action. E.g. `ListTodo` "No tasks yet" · "Add your first task to get started." · [New task] |
| Filtered empty | `SearchX` "No tasks match your filters" · [Clear filters] (secondary) |
| Error | `CircleAlert` in `--danger`, "Something went wrong" + short cause, [Try again] (secondary) |
| Guest banner | Full-width strip above page header, `bg-surface-raised`, `UserRound` icon, muted text, dismiss `X` ghost button (dismissal remembered in `localStorage`, wrapped in try/catch) |

### 6.9 Dialogs, menus, toasts

- **Dialog:** `bg-surface-raised`, radius 12 px, max width 520 px, padding 24 px, title + close `X`; footer right-aligned: Secondary "Cancel" then Primary action. Mobile: full-width sheet from the bottom.
- **Confirm (AlertDialog):** title as a question ("Delete this task?"), one line of consequence, Cancel + Danger button naming the action ("Delete").
- **Menu:** `bg-surface-raised`, radius 8 px, items 32 px with 16 px icon; destructive item text `--danger` with `Trash2`.
- **Toast (Sonner):** bottom-right desktop, top-centre mobile; 4 s; success uses `Check` in `--success`, error `CircleAlert` in `--danger`. Short: "Task created", "Note deleted", "Couldn't update task. Try again."

---

## 7. Interaction and accessibility

- **Focus ring:** 2 px `--brand` outline with 2 px offset on `--bg` (`focus-visible` only). Never remove outlines without this replacement.
- **Keyboard:** everything reachable by Tab in visual order; `Esc` closes dialogs/menus; `Enter` submits forms; dialogs trap focus and return it to the trigger.
- **Screen readers:** icon-only buttons have `aria-label`; decorative icons have `aria-hidden="true"`; toasts use a polite live region; nav uses `<nav>` with `aria-current="page"`.
- **Motion:** hover/press 150 ms ease-out; dialogs/popovers 200 ms fade + 4 px slide; drag uses the library's default. Honour `prefers-reduced-motion: reduce` (no slides, instant transitions).
- **Contrast:** WCAG 2.2 AA minimum everywhere (verified in §3).

---

## 8. Iconography

Lucide only, `strokeWidth={1.75}`. Sizes: **16 px** inline/buttons/menus, **20 px** navigation, **14 px** inside badges and error messages, **40 px** empty states. Colour inherits text colour (`currentColor`) unless a semantic mapping (§3.3) applies.

| Meaning | Icon |
|---|---|
| Logo mark | `Banana` |
| Tasks (nav) | `ListTodo` |
| Board (nav) | `SquareKanban` |
| Calendar (nav) | `CalendarDays` |
| Notes (nav) | `NotebookPen` |
| New / add | `Plus` |
| Search | `Search` |
| No search results | `SearchX` |
| Clear filters | `FilterX` |
| More actions | `Ellipsis` |
| Edit | `Pencil` |
| Delete | `Trash2` |
| Move to (Board menu) | `ArrowRightLeft` |
| Drag handle | `GripVertical` |
| Close / dismiss | `X` |
| Back (mobile) | `ChevronLeft` |
| Previous / next month | `ChevronLeft` / `ChevronRight` |
| Saving / loading | `LoaderCircle` (spinning) |
| Saved / success | `Check` |
| Error / overdue | `CircleAlert` |
| Guest | `UserRound` |
| Sign in / out (P1) | `LogIn` / `LogOut` |
| Category (P1) | `Tag` |
| Unscheduled (P1) | `CalendarOff` |

Priority and status icons: §3.3.

---

## 9. Voice and copy

- **Sentence case**, short, plain words. Buttons are verbs: "New task", "Save changes", "Delete", "Try again".
- **No emoji, no exclamation marks, no jokes in UI copy.**
- **Errors** say what happened and what to do: "Couldn't save your note. We'll retry when you keep typing." Never show raw error codes or stack traces.
- **Dates:** `Mon 6 Oct`; relative times for notes: "Just now", "5 min ago", "Yesterday", then `6 Oct`.
- **Counts:** "3 tasks", "1 task".
- **Placeholders:** "Task title", "Add details (optional)", "Search tasks", "Search notes", "Start writing…".

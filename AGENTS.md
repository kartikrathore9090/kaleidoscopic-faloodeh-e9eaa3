# AGENTS.md

Guide for AI agents and developers working on **CampusCare**, a Campus Service Management System frontend.

> **Continue from [PLAN.md](./PLAN.md).** Milestone 1 (the full product UI on sample data) is done. Pick up the next unchecked milestone.

## Architecture

- **Framework:** TanStack Start (React 19 + Vite 7) with file-based routes in `src/routes`. `routeTree.gen.ts` is generated at build time, so never edit it.
- **Styling:** Tailwind CSS 4. All design tokens live in `src/styles.css`:
  - Semantic CSS variables (`--bg`, `--fg`, `--muted`, `--subtle`, `--line`, `--glass*`) are switched by the `.dark` class on `<html>`. They are exposed as Tailwind colors (`bg-bg`, `text-muted`, `border-line`, …).
  - Custom utilities: `glass`, `glass-strong`, `text-gradient`, `bg-brand`, `skeleton`. There are also the `.glow-card`, `.reveal` and `.grain` classes.
  - Keyframes: `fade-up`, `fade-in`, `scale-in`, `float`, `pulse-ring`, `shimmer`, `toast-in`.
- **Data layer:** this is client-side only for now.
  - `src/lib/types.ts` holds domain types that mirror the Java backend DTOs.
  - `src/lib/api.ts` is the single API surface. It uses `httpApi` when `VITE_API_BASE_URL` is set and `mockApi` otherwise. `mockApi` is backed by `localStorage` (`cc-mock-db-v1`) and seeded from `fixtures.ts`. The REST contract is documented at the top of the file.
  - `src/lib/fixtures.ts` holds **all** sample data. It is the only place stub data lives.
  - `src/lib/hooks.ts` provides `useAsync` (data, loading, error, reload, setData), `useDebounced` and `useReveal`.
  - `src/lib/directory.ts` provides `useDirectory()`, a shared, cached map from user id to user.
- **App state:** `src/lib/auth.tsx` (session in `localStorage`: `cc-token`, `cc-user`) and `src/lib/theme.tsx` (stored in `cc-theme`). An inline script in `__root.tsx` applies the theme before first paint.
- **Auth and role guard:** handled client-side in `AppShell` (`src/components/AppShell.tsx`). The `ACCESS` table maps route prefixes to allowed roles. Pages render a loading shell until the session hydrates.

## Key directories

```
src/
  routes/                 index (landing), login, register, app.tsx (layout → AppShell)
    app/student.tsx       student dashboard
    app/requests/new.tsx  create request form (?category= preselect)
    app/requests/$id.tsx  request details + timeline + actions
    app/staff.tsx         staff queue (list/board); admins see all assigned work
    app/admin/index.tsx   admin analytics, alerts, assignment queue
    app/admin/users.tsx   user management
  components/
    ui/                   design-system primitives (Button, GlassCard, Badge, Modal, Select/Menu, Toast, Skeleton, Counter, Field, States, Avatar)
    AppShell.tsx          sidebar, topbar, ⌘K search, notifications, user menu, PageHeader
    StatusTimeline.tsx    Open → Assigned → In Progress → Resolved → Closed stepper
    ActivityFeed.tsx, RequestRow.tsx, RequestActions.tsx (StatusModal/AssignModal), Filters.tsx, Charts.tsx, StatCard.tsx
  lib/                    types, api, fixtures, meta (labels/colours/helpers), hooks, auth, theme, directory
```

## Conventions

- Use the `@/` import alias (`@/lib/...`, `@/components/...`).
- Get status, priority, category and role labels and colours from `src/lib/meta.ts` (`STATUS_META`, `PRIORITY_META`, …). Never hardcode them.
- Every async screen handles all four states: a skeleton while loading, an `ErrorState` with retry, an `EmptyState`, and the content.
- Give feedback for every mutation through `useToast()`.
- Use `GlassCard` for surfaces. Pass `glow={false}` for large list containers.
- Animate only `transform` and `opacity`. Use staggered entry animations via inline `animation: fade-up … ${i*N}ms`.
- Make the smallest edit that does the job. Keep components in the existing style: Tailwind classes inline, `cn()` for conditionals.

## Non-obvious decisions

- The mock API adds artificial latency so skeleton loaders are visible, and it persists changes so demo flows survive reloads. Calling `resetMockData()` clears them.
- Fixture timestamps are relative to "now", so the sample data always looks fresh.
- The status transitions allowed per role are defined in `nextStatuses()` in `RequestActions.tsx`. Staff can go to In Progress or Resolved. Admins can pick any status. Students can confirm a fix (Closed) or reopen a request (Open).
- Assigning an Open request moves it to Assigned automatically, in both the mock API and the expected backend behaviour.

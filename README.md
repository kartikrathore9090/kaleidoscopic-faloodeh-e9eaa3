# CampusCare — Campus Service Management

CampusCare is a service desk for universities. Students report campus issues (broken lights, Wi‑Fi, leaks, access cards…), staff work a focused queue, and administrators get live analytics, SLA alerts, request assignment and user management. The interface uses a glassmorphism design with a teal/cyan and dark navy palette, plus dark and light modes.

## What's included

| Screen | Route | Highlights |
| --- | --- | --- |
| Landing page | `/` | Glass navbar, animated hero with a live request preview, bento features, interactive lifecycle, role tabs, animated counters |
| Sign in / Register | `/login`, `/register` | One-click demo roles, validation, password strength meter |
| Student dashboard | `/app/student` | Stats, latest active request with timeline, filterable request list, quick-report categories |
| New request | `/app/requests/new` | Category cards, building picker, priority with SLA targets, live preview, success modal |
| Request details | `/app/requests/:id` | Animated status timeline, activity feed with comments, resolution and rating, role-aware actions |
| Staff queue | `/app/staff` | List and board views, filters, search, sort, one-click Start and Resolve |
| Admin overview | `/app/admin` | Priority alerts, KPI cards, Chart.js trends, status donut, category bars, assignment queue, staff workload |
| User management | `/app/admin/users` | Role changes, deactivate and reactivate, invite users |

Shared building blocks: toasts, modals, dropdowns and selects, skeleton loaders, empty and error states, animated counters, a ⌘K search palette and a notifications menu.

## Demo accounts

While no backend is configured, the app uses realistic sample data saved in `localStorage`. Every sample account uses the password `campus123`:

- Student: `aisha@campus.edu`
- Staff: `marcus@campus.edu`
- Admin: `admin@campus.edu`

You can also switch roles from the user menu in the top-right corner.

## Tech stack

- React 19 + Vite 7 (via TanStack Start with file-based routing)
- Tailwind CSS 4 (custom glass utilities and theme tokens in `src/styles.css`)
- Chart.js + react-chartjs-2 for analytics
- lucide-react icons, with Bricolage Grotesque, Geist and Geist Mono fonts
- Deployed on Netlify

## Running locally

```bash
pnpm install
pnpm dev          # http://localhost:3000
# or, with Netlify emulation:
netlify dev
```

## Connecting the Java 17 + MongoDB backend

All data access goes through `src/lib/api.ts`. Set one environment variable and the mock layer is replaced by real REST calls:

```bash
VITE_API_BASE_URL=https://api.your-campus.edu
```

The REST contract the UI expects (endpoints, payloads and Bearer-token auth) is documented at the top of `src/lib/api.ts`. The domain types in `src/lib/types.ts` mirror the backend DTOs.

## Roadmap

See [PLAN.md](./PLAN.md) for the next milestones: backend integration, real authentication, attachments, real-time notifications and more.

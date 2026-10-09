# CampusCare roadmap

## ✅ Milestone 1: Product surface (done)
The full, polished UI runs on realistic sample data: landing page, auth screens, student dashboard, request form, request details with timeline, staff queue, admin analytics and user management. Dark and light mode are included. The data layer is isolated in `src/lib/api.ts` and `src/lib/fixtures.ts`.

## Milestone 2: Connect the Java 17 + MongoDB backend
- Implement the REST contract documented in `src/lib/api.ts` on the Spring Boot side. Collections: `users`, `requests` (with embedded `activity` and `resolution`).
- Set `VITE_API_BASE_URL` in Netlify environment variables, and configure CORS on the backend for the Netlify domain.
- Add server-side pagination to `GET /api/requests` and wire it into the list views.
- Move the admin trend chart from the `monthlyVolume` fixture to an `/api/analytics` endpoint.

## Milestone 3: Real authentication and authorization
- JWT issued by the backend (or campus SSO via OAuth/SAML). Add refresh tokens and handle expiry in `http()`.
- Enforce roles server-side. Keep the client `ACCESS` table in `AppShell` for UX only.
- Add password reset and email verification flows. The "Forgot?" link and the reset action are placeholders today.

## Milestone 4: Notifications and real-time updates
- Push status changes to students via WebSocket/SSE (or polling as a first step).
- Send email notifications on assignment and resolution.
- Persist read/unread state for the notifications menu.

## Milestone 5: Attachments and richer requests
- Photo upload on the request form and in comments, stored by the backend (e.g. GridFS or S3).
- Map or floor-plan location picker, plus duplicate detection for nearby open requests.

## Milestone 6: Operations depth
- A configurable SLA engine per category and priority, with escalation rules.
- Real CSV/PDF report export (the Export button is a placeholder today).
- Staff availability, shift schedules and auto-assignment suggestions.
- User settings page (profile and notification preferences).

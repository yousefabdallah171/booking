# Research: Consultation Booking Platform

**Feature**: 001-consultation-booking
**Date**: 2026-06-05

## Decision Log

---

### 1. Project Architecture — Frontend / Backend Split

**Decision**: Two separate applications: `frontend/` (Next.js 14) and `backend/` (Express.js).

**Rationale**: Separating concerns gives clear ownership boundaries — the frontend owns
all UI, auth (NextAuth), and rendering; the backend owns all business logic, Prisma,
email, payments, and external service integrations. Each app can be built, tested, and
deployed independently. The backend is a pure REST API that is framework-agnostic and
can be consumed by any future client (mobile app, CLI tool, etc.).

**Communication**: Next.js Server Actions and Server Components act as a BFF (Backend
For Frontend), making `fetch` calls to `http://backend:4000` inside Docker. This keeps
credentials and business logic out of the browser.

**Alternatives considered**:
- Next.js monolith with Server Actions: Tight coupling between UI and business logic;
  harder to test backend in isolation; Server Actions cannot be called from non-Next.js
  clients.
- Next.js + separate database access layer: Still couples the two in one deployment
  unit; does not achieve the same separation of concerns.

---

### 2. Backend Framework

**Decision**: Express.js 4.x with TypeScript (`tsx` for runtime).

**Rationale**: Express is the most widely understood Node.js framework, has minimal
overhead, and is straightforward to set up with TypeScript. All routes use Zod for
validation and a service layer for business logic — the same patterns used in the
previous Next.js Server Actions design. `tsx` provides fast TypeScript execution
without a separate compilation step in development.

**Alternatives considered**:
- Fastify: Slightly faster but less familiar; the performance delta is negligible for
  this traffic scale (1 admin, ~500 clients).
- NestJS: Comprehensive but heavyweight; introduces decorators, modules, and DI
  containers that add complexity not warranted by this scope.
- Hono: Modern and fast but the ecosystem is smaller and team familiarity is lower.

---

### 3. Auth Sharing Between Frontend and Backend

**Decision**: NextAuth.js v5 on the frontend issues JWTs signed with `AUTH_SECRET`.
The backend verifies these JWTs using the same `AUTH_SECRET` in `authMiddleware`.

**Rationale**: No additional auth infrastructure needed. The shared secret approach
is a standard pattern for BFF architectures. The frontend extracts the raw JWT from
the session cookie and forwards it as an `Authorization: Bearer` header to the backend.
The backend never handles Google OAuth or credential verification — that stays in NextAuth.

**Implementation**:
- `frontend/src/lib/api.ts` reads the session token via `auth()` (NextAuth server-side
  helper) and attaches it to every backend request.
- `backend/src/middleware/auth.middleware.ts` verifies the token using `jsonwebtoken`
  with `AUTH_SECRET` and attaches `req.user`.

**Alternatives considered**:
- Separate auth service (Auth0, Keycloak): Overkill for a single-admin app with
  ~500 clients. Adds cost and operational complexity.
- Backend-issued JWTs (separate login flow on backend): Requires duplicating the
  Google OAuth and credentials flow; inconsistent session management.
- API keys (no user session): Not suitable for a user-facing web app.

---

### 4. NextAuth.js Version

**Decision**: NextAuth.js v5 (auth.js)

**Rationale**: v5 has first-class Next.js 14 App Router support with native `auth()`
helper usable in Server Components, Server Actions, and middleware — eliminating the
need for `getServerSession()` workarounds. The `@auth/prisma-adapter` is NOT used on
the frontend since Prisma lives in the backend; NextAuth session data is stored as JWT
(stateless), not in the database.

**Alternatives considered**:
- NextAuth.js v4: Designed for Pages Router; App Router usage requires workarounds.
- Custom JWT + iron-session: More control but significant implementation overhead.

---

### 5. PostgreSQL Hosting

**Decision**: PostgreSQL container on VPS (Docker Compose `db` service).
For production, can switch to Neon serverless by changing `DATABASE_URL`.

**Rationale**: VPS deployment with Docker Compose naturally includes a PostgreSQL
container. The `DATABASE_URL` in `.env` makes it trivial to switch to Neon for
production without code changes.

**Alternatives considered**:
- Neon serverless (primary): Works well but adds an external dependency during
  development; local container is faster and offline-capable.
- Supabase: Adds unused features; higher vendor surface area.

---

### 6. Paymob Integration Approach

**Decision**: Standard three-step Paymob Hosted Payment Page flow implemented in
`backend/src/utils/paymob.ts`.

1. `POST https://accept.paymob.com/api/auth/tokens` → `token`
2. `POST https://accept.paymob.com/api/ecommerce/orders` → `order_id`
3. `POST https://accept.paymob.com/api/acceptance/payment_keys` → `payment_key`
4. Redirect: `https://accept.paymob.com/api/acceptance/iframes/{IFRAME_ID}?payment_token={payment_key}`

HMAC verification on webhook uses SHA-512 over alphabetically sorted field values.

**Rationale**: The only supported Paymob hosted payment flow. The backend handles this
entirely; the frontend only receives a redirect URL.

---

### 7. USD Exchange Rate in Reports

**Decision**: Store a configurable `usdExchangeRate` in `SystemConfig` table. Snapshot
the rate into `PaymentRecord.exchangeRateEgpUsd` at payment time. Reports use snapshotted
rate per transaction for historical accuracy.

**Rationale**: Eliminates dependency on live forex API; Youssef updates the rate manually
as needed.

---

### 8. Pending Slot Release — Cron Strategy

**Decision**: System crontab on VPS calls `GET /api/cron/release-pending` on the backend
every 5 minutes. Protected by `CRON_SECRET` header.

**Rationale**: No cloud scheduler needed. The VPS system crontab calls the backend endpoint
directly via `curl`. This is simpler and cheaper than Vercel Cron or Upstash QStash.

**Alternatives considered**:
- Vercel Cron: Tied to Vercel deployment; project now targets VPS.
- Upstash QStash: Extra dependency and cost for a simple sweep query.
- `node-cron` inside the Express process: Would work but ties scheduling to the
  Express process lifecycle; external HTTP call is more observable and restartable.

---

### 9. Thirty-Minute Reminder Cron

**Decision**: System crontab on VPS calls `GET /api/cron/send-reminders` every minute.
The handler queries confirmed bookings in a 29–31 minute window. `Booking.reminderSent`
flag prevents duplicate sends.

**Rationale**: Same as #8 — system crontab on VPS is simpler than a cloud scheduler.
The 2-minute window ensures reminders are sent even if a cron tick is slightly delayed.

---

### 10. Component Library

**Decision**: shadcn/ui (Radix UI primitives + Tailwind CSS) in `frontend/`.

**Rationale**: Components are copied into the project (no runtime dependency), fully
accessible (WCAG 2.1 AA via Radix), and trivially customizable with Tailwind.

---

### 11. State Machine Implementation

**Decision**: Pure conditional logic in `backend/src/services/booking.service.ts`.
Each function validates current status before transitioning and throws
`InvalidStateTransitionError` on invalid transitions.

**Rationale**: Only two transitions (`PENDING → CONFIRMED`, `PENDING → FAILED`). A
formal state machine library (XState) would be overkill.

---

### 12. Email Templates

**Decision**: React Email templates in `backend/src/emails/`; Resend SDK for delivery.

**Rationale**: React Email templates render to HTML strings that Resend accepts directly.
Email is a backend concern — the frontend never handles email sending. Templates are
TypeScript-native and can be previewed locally with the React Email dev server.

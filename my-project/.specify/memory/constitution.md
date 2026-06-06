<!--
  SYNC IMPACT REPORT
  ==================
  Version change: (unversioned template) → 1.0.0
  
  Modified principles:
  - All placeholders replaced with concrete principles
  
  Added sections:
  - I.   Code Quality & Architecture
  - II.  Testing Standards
  - III. User Experience Consistency
  - IV.  Performance
  - V.   Security
  - VI.  Booking & Payment Integrity
  - Technology Stack (new section replacing generic SECTION_2)
  - Development Workflow (new section replacing generic SECTION_3)
  - Governance

  Templates requiring updates:
  - ✅ .specify/templates/plan-template.md — Constitution Check gates aligned to 6 principles
  - ✅ .specify/templates/spec-template.md — no structural changes required; principle-driven
    constraints (Zod validation, service layer, test mapping) are encoded in this constitution
    and will be cited in future specs
  - ✅ .specify/templates/tasks-template.md — task structure compatible; Foundational phase
    must include env.ts, Zod schemas, service layer scaffolding per Principle I
  
  Deferred items:
  - None. All placeholders resolved.
-->

# Consultation Booking Platform Constitution

## Core Principles

### I. Code Quality & Architecture (NON-NEGOTIABLE)

All code MUST be written in TypeScript with `strict: true` enabled. The `any` type is
forbidden; use `unknown` with a type guard, a proper union type, or a Zod-inferred type
instead.

Every function and component MUST have a single, clearly defined responsibility. If a
function does two things, split it.

Server Actions and Route Handlers MUST validate all inputs with a Zod schema before any
database access. Validation failures MUST return structured errors, never throw
unhandled exceptions.

Prisma queries MUST NEVER appear inside React components. All database access goes
through a dedicated service or repository layer under `src/lib/services/` or
`src/lib/repositories/`. Raw SQL is permitted only when Prisma ORM cannot express the
query; raw SQL usage MUST be documented with a comment explaining why ORM was
insufficient.

All environment variables MUST be accessed exclusively through `src/lib/env.ts`, which
validates the process environment at startup using Zod. Direct `process.env` access in
application code is forbidden.

### II. Testing Standards (NON-NEGOTIABLE)

Every P0 feature — authentication, booking flow, Paymob webhook handler, and the
30-minute reminder cron job — MUST have integration tests before the feature is
considered complete.

The Paymob webhook handler MUST have unit tests covering at minimum: valid payload with
correct HMAC, invalid HMAC (must reject with HTTP 400), duplicate webhook on an already-
confirmed booking (must be idempotent), and failed payment status (must transition
booking to `failed`).

All tests MUST use Vitest. Database tests MUST run against a separate test database or
a Prisma mock; they MUST NOT share state with the development or production database.

Acceptance criteria defined in the PRD MUST map 1:1 to test cases. Any acceptance
criterion that cannot be expressed as an automated test MUST be rewritten until it can.
Untestable acceptance criteria are not accepted.

The CI pipeline MUST pass all tests before any pull request may be merged to `main`.
Bypassing CI (e.g., `--no-verify`, direct push to `main`) is forbidden.

### III. User Experience Consistency (NON-NEGOTIABLE)

All forms MUST validate on blur and on submit. Validation errors MUST be displayed
inline, directly below the relevant field. Alerts, toast notifications, or modal dialogs
MUST NOT be used for form validation errors.

Every async action — booking submit, payment redirect, admin save, slot creation — MUST
show a visible loading state. The triggering button MUST be disabled for the duration of
the pending operation.

Success feedback after every admin write action (create slot, block day, update settings)
MUST use a non-blocking toast notification. Destructive action confirmations are separate
from success toasts.

Empty states MUST always be handled explicitly with a descriptive message. A blank page
or empty list with no explanation is forbidden.

The booking calendar MUST reflect real-time slot availability. If a client selects a
slot that has become unavailable between fetch and submit, the system MUST return a
clear, user-friendly conflict message and refresh the calendar.

All destructive actions — blocking a day, deleting a slot — MUST require an explicit
confirmation prompt before execution. Confirmation MUST name the specific item being
destroyed.

### IV. Performance (ENFORCED)

Initial page load MUST be under 2 seconds on a 4G connection. Lighthouse CI MUST be
configured in GitHub Actions and MUST gate merges to `main` on this threshold.

All booking and admin API endpoints MUST respond in under 500ms at p95. Endpoints that
consistently exceed this threshold require profiling and optimization before shipping.

Calendar slot fetch and render MUST complete in under 1 second.

Paymob order creation and the subsequent redirect initiation MUST complete in under
1 second from the moment the user clicks the payment button.

The Prisma schema MUST define explicit indexes on `start_time`, `user_id`, and `status`
fields on all booking and slot models. Queries that cannot use an index on these fields
MUST be refactored.

N+1 queries are forbidden. All list views MUST use eager loading via Prisma `include`
to resolve related data in a single query.

### V. Security (NON-NEGOTIABLE)

Every route beyond the public landing page and login MUST require an authenticated
session. Next.js middleware MUST enforce this check at the edge before the request
reaches any route handler or page.

Admin routes (`/admin/*` and `/api/admin/*`) MUST enforce a `role === 'ADMIN'` check
on every request. Non-admin authenticated users MUST receive HTTP 403. Unauthenticated
requests MUST redirect to the login page (not 403).

The Paymob webhook endpoint MUST verify the HMAC signature on every inbound request.
Any request with a missing or mismatched HMAC MUST be rejected with HTTP 400 immediately,
before any business logic executes.

Passwords MUST be hashed with bcrypt at a minimum cost factor of 12 rounds. Lower cost
factors are forbidden even in test environments (use a separate hash strategy for tests
if speed is required).

No API keys, secrets, database URLs, or other sensitive values MUST ever be committed
to the repository. `.env*` files (except `.env.example`) MUST be listed in `.gitignore`.
Pre-commit hooks or CI checks SHOULD scan for accidental secret commits.

### VI. Booking & Payment Integrity (NON-NEGOTIABLE)

Booking status transitions MUST follow the defined state machine exclusively:
- `pending` → `confirmed` (triggered only by a successful Paymob webhook)
- `pending` → `failed` (triggered by a failed-payment webhook or the 5-minute
  pending-release cron job)

No other transitions are permitted. Code that directly sets a booking to `confirmed`
without a corresponding webhook event is forbidden.

Slot status transitions MUST follow this state machine exclusively:
- `available` → `booked` (triggered only when a booking reaches `confirmed`)
- `available` → `blocked` (triggered only by an explicit admin block action)

A slot MUST NEVER be double-booked. The database MUST enforce a unique constraint that
prevents two bookings referencing the same slot. Application-level checks alone are
insufficient.

Pending slots MUST be released automatically after a 5-minute timeout if no webhook is
received. A Vercel Cron Job MUST run at least every 5 minutes to sweep stale `pending`
bookings and transition them to `failed`, returning the slot to `available`.

Duplicate Paymob webhooks MUST be handled idempotently. Before processing any webhook,
the handler MUST read the current booking status. If the booking is already `confirmed`
or `failed`, the handler MUST return HTTP 200 without modifying any state.

## Technology Stack

- **Framework**: Next.js 14 App Router
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL via Prisma ORM
- **Auth**: NextAuth.js (credentials provider; bcrypt password hashing)
- **Payments**: Paymob (order creation API + HMAC-verified webhook)
- **Email**: Resend (transactional emails via React Email templates)
- **Scheduling**: Vercel Cron Jobs (pending-slot release, 30-minute reminders)
- **Testing**: Vitest (unit + integration); separate test database
- **CI/CD**: GitHub Actions (test gate + Lighthouse CI performance gate)
- **Deployment**: Vercel

**User Roles**:
- `ADMIN` — Youssef: manages calendar slots, views all bookings, blocks days
- `CLIENT` — Developer: browses available slots, books single sessions or packages,
  completes payment via Paymob

**Core Flows**:
1. Authentication (login / session management)
2. Calendar slot management (admin: create, block, delete slots)
3. Session booking — single session and package purchase
4. Paymob payment processing (order creation → redirect → HMAC webhook)
5. Confirmation email on booking success (Resend)
6. 30-minute reminder email before each session (Vercel Cron + Resend)

## Development Workflow

**Branch strategy**: Feature branches off `main`; all merges via pull request.

**CI gates** (all MUST pass before merge):
1. `vitest run` — all unit and integration tests pass
2. Lighthouse CI — initial page load < 2s on simulated 4G
3. TypeScript compiler — zero errors with `strict: true`
4. No secrets scan failure (if configured)

**Service layer rule**: Before writing a Prisma query, locate or create the appropriate
service file under `src/lib/services/`. The service file is the only place that imports
from `@prisma/client`.

**Environment variables rule**: Before adding a new env var, add it to:
1. `.env.example` (with a placeholder value, never the real value)
2. `src/lib/env.ts` (Zod schema + export)

**Acceptance criteria rule**: Before writing any feature code, ensure every acceptance
criterion in the spec has a corresponding test case file (even if the test body is a
pending stub). This enforces the PRD-to-test 1:1 mapping principle.

**Webhook development rule**: The Paymob webhook handler MUST be developed test-first.
Write unit tests for all four webhook cases (valid, invalid HMAC, duplicate, failed)
before implementing the handler.

## Governance

This constitution supersedes all other practices, conventions, and prior verbal
agreements for the Consultation Booking Platform. When a principle in this document
conflicts with any other guideline, this document takes precedence.

**Amendment procedure**:
1. Propose the amendment in a pull request that modifies this file.
2. Document the reason for the change and whether it is MAJOR, MINOR, or PATCH.
3. Update `CONSTITUTION_VERSION` and `LAST_AMENDED_DATE` accordingly.
4. Propagate changes to dependent templates as required by the Sync Impact Report.
5. The amendment takes effect when the pull request is merged to `main`.

**Versioning policy**:
- MAJOR — removal or backward-incompatible redefinition of an existing principle.
- MINOR — addition of a new principle or materially expanded guidance.
- PATCH — clarifications, wording fixes, or non-semantic refinements.

**Compliance review**: Every pull request description MUST include a Constitution Check
section confirming that the changes comply with all six core principles. Reviewers are
expected to verify this before approving.

**Version**: 1.0.0 | **Ratified**: 2026-06-05 | **Last Amended**: 2026-06-05

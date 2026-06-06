---
description: "Task list for Consultation Booking Platform implementation (frontend/backend split)"
---

# Tasks: Consultation Booking Platform

**Input**: Design documents from `specs/001-consultation-booking/`
**Prerequisites**: plan.md Ã¢Å“â€¦ spec.md Ã¢Å“â€¦ data-model.md Ã¢Å“â€¦ contracts/ Ã¢Å“â€¦ research.md Ã¢Å“â€¦ quickstart.md Ã¢Å“â€¦

**Architecture**: Two apps Ã¢â‚¬â€ `frontend/` (Next.js 14, port 3000) and `backend/` (Express.js, port 4000)

**Deployment target**: VPS (Docker Compose + Nginx + PostgreSQL container).

**Cron strategy**: System crontab on VPS calls `backend/` cron endpoints via `curl` with
`Authorization: Bearer $CRON_SECRET`. No external scheduler required.

**Tests**:
- Backend unit + integration tests: Vitest in `backend/tests/`
- Frontend E2E tests: Playwright in `frontend/tests/e2e/`

**Organization**: Tasks are grouped by phase. Phases 1Ã¢â‚¬â€œ2 are setup; phases 3Ã¢â‚¬â€œ9 implement
user stories; phase 10 is E2E testing.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1Ã¢â‚¬â€œUS6)
- All tasks include exact file paths relative to the app root (`frontend/` or `backend/`)

---

## Phase 1: Backend Setup

**Purpose**: Initialize the Express backend, Prisma, database, and tooling.

- [X] T001 Initialize `backend/` directory: create `backend/package.json` with Express, Prisma, Zod, Resend, React Email, bcryptjs, jsonwebtoken, tsx; set `"type": "module"` and `"packageManager": "pnpm@9.0.0"`
- [X] T002 [P] Create `backend/tsconfig.json` with `strict: true`, `module: NodeNext`, `moduleResolution: NodeNext`, path alias `@/*` Ã¢â€ â€™ `src/*`
- [X] T003 [P] Configure Vitest in `backend/vitest.config.ts` (node environment, path aliases); create `backend/tests/setup.ts` with test DB reset logic using `prisma migrate reset --force`
- [X] T004 [P] Create `backend/.env.example` with all required backend keys: `DATABASE_URL`, `DATABASE_URL_TEST`, `AUTH_SECRET`, `PAYMOB_API_KEY`, `PAYMOB_INTEGRATION_ID`, `PAYMOB_IFRAME_ID`, `PAYMOB_HMAC_SECRET`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `CRON_SECRET`, `ADMIN_EMAIL`, `ADMIN_INITIAL_PASSWORD`, `FRONTEND_URL`, `PORT`
- [X] T005 [P] Create `backend/src/lib/env.ts` with Zod schema validating all backend env vars from `.env.example`; export typed `env` object; no other file may use `process.env` directly
- [X] T006 Write full Prisma schema in `backend/prisma/schema.prisma` per `specs/001-consultation-booking/data-model.md` Ã¢â‚¬â€ all models, enums, indexes, `@unique` constraints, and NextAuth adapter models (Account, Session, VerificationToken)
- [X] T007 [P] Create Prisma client singleton in `backend/src/lib/prisma.ts` using global pattern to prevent multiple instances
- [ ] T008 Run `pnpm prisma migrate dev --name init` inside `backend/` to generate the initial migration in `backend/prisma/migrations/` *(requires running PostgreSQL)*
- [X] T009 [P] Write seed script in `backend/prisma/seed.ts`: ADMIN user (bcrypt 12 rounds, email from `env.ADMIN_EMAIL`), two `PackageTier` rows (6-session, 10-session), `SystemConfig` defaults (`SINGLE_SESSION_PRICE_EGP=0`, `USD_EXCHANGE_RATE=31.00`)
- [X] T010 [P] Create full `backend/` directory skeleton Ã¢â‚¬â€ create all empty dirs and `.gitkeep` stubs: `src/routes/`, `src/services/`, `src/middleware/`, `src/utils/`, `src/emails/`, `tests/unit/webhooks/`, `tests/integration/`, `cron/`
- [X] T011 Create `backend/cron/crontab.example` Ã¢â‚¬â€ system crontab entries: `*/5 * * * * curl -s -H "Authorization: Bearer $CRON_SECRET" http://localhost:4000/api/cron/release-pending` and `* * * * * curl -s -H "Authorization: Bearer $CRON_SECRET" http://localhost:4000/api/cron/send-reminders`; add VPS setup comment

**Checkpoint**: Backend skeleton ready with database schema and seed data

---

## Phase 2: Frontend Setup

**Purpose**: Initialize the Next.js frontend, Tailwind, shadcn/ui, auth, and tooling.

- [X] T012 Initialize `frontend/` directory: create `frontend/package.json` with Next.js 14, next-auth v5, next-themes, next-intl, React Hook Form, Zod, shadcn/ui deps, Playwright; set `"packageManager": "pnpm@9.0.0"`
- [X] T013 [P] Create `frontend/tsconfig.json` with `strict: true`, `moduleResolution: bundler`, path alias `@/*` Ã¢â€ â€™ `src/*`
- [X] T014 [P] Create `frontend/next.config.ts` with `output: "standalone"`, `serverExternalPackages: ["bcryptjs"]`, and next-intl plugin
- [X] T015 [P] Configure Tailwind CSS: `darkMode: ["class"]`, shadcn/ui content paths, CSS variables; `postcss.config.mjs`; `globals.css` with "Refined Cairo" design tokens (obsidian dark / parchment light / saffron gold)
- [X] T016 [P] Create `frontend/components.json` for shadcn/ui; `frontend/src/lib/utils.ts` with `cn()`; shadcn/ui components in `frontend/src/components/ui/`: Button, Input, Form, Label, Dialog, Toast/Toaster, Badge, Card, Select, Table
- [X] T017 [P] Create `frontend/.env.example` with all required frontend keys: `AUTH_SECRET`, `AUTH_URL`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `BACKEND_URL`, `NEXT_PUBLIC_APP_URL`
- [X] T018 [P] Create `frontend/src/lib/env.ts` with Zod schema validating all frontend env vars; export typed `env` object
- [X] T019 [P] Configure `frontend/playwright.config.ts`: `baseURL: http://localhost:3000`, Chromium only, `globalSetup`, HTML reporter
- [X] T020 [P] Create full `frontend/` directory skeleton under `[locale]` routing: `src/app/[locale]/(auth)/login/`, `src/app/[locale]/(client)/booking/`, `src/app/[locale]/(admin)/admin/`, `src/app/api/auth/[...nextauth]/`, `src/components/{booking,admin,shared}/`, `src/i18n/`, `messages/`, `tests/e2e/fixtures/`
- [X] T021 [P] Create `.github/workflows/ci.yml` with jobs: `backend-test`, `frontend-type-check`, `backend-type-check`, `e2e`
- [X] T022 [P] Add `.gitignore` at repo root covering both apps: `node_modules/`, `.env*.local`, `dist/`, `.next/`, `playwright/.auth/`, `playwright-report/`

**Checkpoint**: Both app skeletons ready with all tooling configured

---

## Phase 2.5: Design System, i18n, Dark/Light Mode

**Purpose**: Wire up "Refined Cairo" design system, next-intl (ar + en), RTL support, next-themes, impeccable.style docs.

- [X] T023A [P] Create `DESIGN.md` at repo root Ã¢â‚¬â€ "Refined Cairo" design tokens, typography, spacing, color system, component conventions, anti-patterns (impeccable.style format)
- [X] T023B [P] Create `PRODUCT.md` at repo root Ã¢â‚¬â€ brand voice, target users, tone, design anti-patterns for this product
- [X] T023C [P] Add `next-themes` and `next-intl` to `frontend/package.json`; run `pnpm install` in `frontend/`
- [X] T023D Update `frontend/next.config.ts` to wrap config with `createNextIntlPlugin` pointing to `./src/i18n/request.ts`
- [X] T023E [P] Create `frontend/src/i18n/routing.ts`: `defineRouting({ locales: ["ar", "en"], defaultLocale: "ar" })`
- [X] T023F [P] Create `frontend/src/i18n/request.ts`: next-intl server-side request config using `routing`
- [X] T023G [P] Create `frontend/messages/ar.json` Ã¢â‚¬â€ Arabic translation strings for all UI text
- [X] T023H [P] Create `frontend/messages/en.json` Ã¢â‚¬â€ English translation strings for all UI text
- [X] T023I Update `frontend/src/app/globals.css` with full "Refined Cairo" CSS custom properties (both light and dark mode tokens)
- [X] T023J Create `frontend/src/components/theme-provider.tsx` Ã¢â‚¬â€ next-themes `ThemeProvider` wrapper (class strategy, defaultTheme system)
- [X] T023K [P] Create `frontend/src/components/shared/ThemeToggle.tsx` Ã¢â‚¬â€ Sun/Moon icon button; reads/sets theme via `useTheme`
- [X] T023L [P] Create `frontend/src/components/shared/LanguageToggle.tsx` Ã¢â‚¬â€ AR/EN toggle using next-intl `useRouter` + `usePathname`
- [X] T023M Update `frontend/src/app/layout.tsx` Ã¢â‚¬â€ minimal root layout (html + body only, no locale/dir here)
- [X] T023N Create `frontend/src/app/[locale]/layout.tsx` Ã¢â‚¬â€ locale layout: sets `lang` + `dir` on html, wraps with `ThemeProvider`, loads DM Serif Display + IBM Plex Sans + Noto Naskh Arabic fonts
- [X] T023O Create `frontend/src/app/[locale]/page.tsx` Ã¢â‚¬â€ landing page stub with "Book a Session" CTA (i18n-aware)
- [X] T023P Create combined `frontend/middleware.ts` Ã¢â‚¬â€ chains next-intl middleware + NextAuth auth middleware

**Checkpoint**: Design system live Ã¢â‚¬â€ dark/light toggle works, AR/EN locale routing works, RTL correct

---

## Phase 3: Backend Core Infrastructure

**Purpose**: Auth middleware, shared utilities, and foundational backend services.

- [X] T023 Create `backend/src/middleware/auth.middleware.ts`: verify `Authorization: Bearer <jwt>` using `jsonwebtoken.verify(token, env.AUTH_SECRET)`; attach `req.user = { id, role }`; return 401 on missing or invalid token
- [X] T024 [P] Create `backend/src/middleware/admin.middleware.ts`: check `req.user.role === "ADMIN"`; return 403 if not
- [X] T025 [P] Create `backend/src/middleware/validate.middleware.ts`: factory function `validate(schema)` returning Express middleware that parses body with Zod, returns 400 with `fieldErrors` on failure
- [X] T026 [P] Create `backend/src/utils/paymob.ts`: `createAuthToken`, `registerOrder`, `requestPaymentKey`, `buildIframeRedirectUrl`, `verifyHmac` Ã¢â‚¬â€ all use `env` for secrets
- [X] T027 [P] Create `backend/src/utils/timezone.ts` (UTC Ã¢â€ â€ Cairo helpers) and `backend/src/utils/currency.ts` (`egpToUsd(amountEgp, rate)`)
- [X] T028 [P] Create `backend/src/services/pricing.service.ts`: `resolvePrice(userId)`, `setDefaultPrice`, `setPackageTierPrice`, `setClientCustomPrice`
- [X] T029 Create `backend/src/app.ts`: Express app with `cors({ origin: env.FRONTEND_URL })`, `express.json()`, health check `GET /health`, and all routers registered under `/api/*`
- [X] T030 Write integration test for auth middleware in `backend/tests/integration/auth.test.ts`: missing token Ã¢â€ â€™ 401, invalid token Ã¢â€ â€™ 401, valid CLIENT token Ã¢â€ â€™ passes, valid ADMIN token Ã¢â€ â€™ passes, CLIENT on admin route Ã¢â€ â€™ 403

**Checkpoint**: Backend auth and middleware layer fully tested

---

## Phase 4: Frontend Auth + API Client

**Purpose**: NextAuth setup, typed API client for calling the backend, and middleware.

- [X] T031 Create `frontend/src/lib/auth.ts`: NextAuth v5 config with GoogleProvider and CredentialsProvider; bcrypt password check calls the backend `POST /api/auth/verify-credentials`; jwt callback adds `user.role`; session callback exposes `session.user.role`
- [X] T032 Create `frontend/src/app/api/auth/[...nextauth]/route.ts` re-exporting `{ GET, POST }` from NextAuth handlers
- [X] T033 Create `frontend/src/lib/api.ts`: typed fetch wrapper that reads the session JWT via `auth()` (NextAuth server-side), attaches `Authorization: Bearer <jwt>` header, and calls `env.BACKEND_URL`; export typed functions for every backend endpoint
- [X] T034 Create `frontend/src/middleware.ts`: Edge auth + admin role enforcement per `contracts/api-routes.md` Ã¢â‚¬â€ public paths, admin paths, authenticated-only paths
- [X] T035 Create `frontend/src/app/(auth)/login/page.tsx`: Google OAuth sign-in button + email/password form; React Hook Form + Zod validation; inline errors below each field; loading state disables submit button
- [X] T036 [P] Create `frontend/src/app/layout.tsx` root layout: Inter font, `<Toaster />` provider, global CSS import
- [X] T037 [P] Create `frontend/src/app/page.tsx` public landing page: headline, Book a Session CTA (redirects authenticated users to `/booking`), Roadmap Package CTA; mobile-responsive

**Checkpoint**: Frontend auth flow works end-to-end with backend credential verification

---

## Phase 5: User Story 3 Ã¢â‚¬â€ Admin Manages Calendar (Priority: P1)

**Goal**: Youssef can create individual slots, generate bulk slots, block full days, and delete slots.

### Backend Ã¢â‚¬â€ US3

- [ ] T038 Create `backend/src/services/slot.service.ts`: `createSlot`, `generateSlots` (range Ã¢â€ â€™ hourly slots, skip overlaps), `blockDay`, `unblockDay`, `deleteSlot` (throws if slot has CONFIRMED booking), `getSlotsByDate`, `getAdminSlotsByDate`, `listBlockedDays`
- [ ] T039 [P] Create Zod schemas in `backend/src/routes/slots.routes.ts` inline: `CreateSlotSchema`, `GenerateSlotsSchema`, `BlockDaySchema`
- [ ] T040 Create `backend/src/routes/slots.routes.ts`: all slot endpoints from `contracts/rest-api.md` Ã¢â‚¬â€ GET `/api/slots`, GET `/api/slots/admin`, POST `/api/slots`, POST `/api/slots/generate`, DELETE `/api/slots/:id`, POST `/api/slots/block-day`, DELETE `/api/slots/block-day/:date`; apply `authMiddleware` and `adminMiddleware` where required

### Frontend Ã¢â‚¬â€ US3

- [ ] T041 [P] Create `frontend/src/components/shared/ConfirmDialog.tsx` (Radix Dialog naming the specific item) and `frontend/src/components/shared/EmptyState.tsx` (icon + heading + description props)
- [ ] T042 [P] Create `frontend/src/app/(admin)/admin/layout.tsx` with sidebar navigation: Calendar, Pricing, Bookings, Clients, Reports
- [ ] T043 [P] Create `frontend/src/components/admin/SlotManager.tsx`: slot list for selected date with status badges; delete button triggers `ConfirmDialog`; success toast on delete
- [ ] T044 [P] Create `frontend/src/components/admin/SlotGeneratorForm.tsx`: date picker, start/end time fields; Generate button with loading state; shows "N slots created, M skipped" on success
- [ ] T045 Create `frontend/src/app/(admin)/admin/calendar/page.tsx` composing `SlotManager` + `SlotGeneratorForm`; calls `api.getAdminSlots(date)` and `api.generateSlots(...)`; `EmptyState` when no slots for date
- [ ] T046 [P] Create `frontend/src/app/(admin)/admin/page.tsx`: today's confirmed session count and pending bookings count (fetched from backend)

**Checkpoint**: Admin can fully manage calendar Ã¢â‚¬â€ ready to build client booking on top

---

## Phase 6: User Story 1 Ã¢â‚¬â€ Client Books Single Session (Priority: P1)

**Goal**: Client selects a slot, pays via Paymob, receives confirmation email. Pending slots release after 5 minutes via cron.

### Backend Ã¢â‚¬â€ US1

- [ ] T047 Create `backend/src/services/booking.service.ts`: `createPendingBooking`, `confirmBooking` (PENDINGÃ¢â€ â€™CONFIRMED + slotÃ¢â€ â€™BOOKED), `failBooking` (PENDINGÃ¢â€ â€™FAILED + slotÃ¢â€ â€™AVAILABLE), `getClientBookings`, `getBookingByPaymobOrderId`; throw `InvalidStateTransitionError` on invalid transitions
- [ ] T048 [P] Create `backend/src/services/payment.service.ts`: `initSingleSessionPayment` (Paymob 3-step + creates PaymentRecord), `recordPaymentSuccess`, `recordPaymentFailure`
- [ ] T049 [P] Create `backend/src/services/email.service.ts`: `sendConfirmationEmail(booking)` and `sendReminderEmail(booking)` using Resend SDK
- [ ] T050 [P] Create React Email confirmation template in `backend/src/emails/confirmation.tsx`: booking date/time, session type, amount paid in EGP
- [ ] T051 [P] Create React Email reminder template in `backend/src/emails/reminder.tsx`: session time, meet link or "Meeting link coming soon" placeholder
- [ ] T052 Create `backend/src/routes/bookings.routes.ts`: POST `/api/bookings/single`, POST `/api/bookings/package-session`, GET `/api/bookings/my`, GET `/api/bookings/admin`, PATCH `/api/bookings/:id/meet-link`
- [ ] T053 Create `backend/src/routes/webhooks.routes.ts`: POST `/api/webhooks/paymob` Ã¢â‚¬â€ parse raw body Ã¢â€ â€™ verify HMAC (reject 400 on mismatch) Ã¢â€ â€™ idempotency check Ã¢â€ â€™ confirmBooking/failBooking Ã¢â€ â€™ sendConfirmationEmail Ã¢â€ â€™ 200
- [ ] T054 Create `backend/src/services/cron.service.ts`: `releasePendingBookings` (PENDING + createdAt < nowÃ¢Ë†â€™5min Ã¢â€ â€™ failBooking on each); `sendDueReminders` (CONFIRMED + reminderSent=false + startTime in 29Ã¢â‚¬â€œ31min window Ã¢â€ â€™ sendReminderEmail + reminderSent=true)
- [ ] T055 [P] Create `backend/src/routes/cron.routes.ts`: GET `/api/cron/release-pending` and GET `/api/cron/send-reminders` Ã¢â‚¬â€ verify `CRON_SECRET` header; delegate to cron.service
- [ ] T056 [P] Write unit tests for Paymob webhook in `backend/tests/unit/webhooks/paymob.test.ts`: (1) valid HMAC Ã¢â€ â€™ 200, (2) invalid HMAC Ã¢â€ â€™ 400 before any DB access, (3) duplicate on already-CONFIRMED Ã¢â€ â€™ 200 no state change, (4) `obj.success=false` Ã¢â€ â€™ FAILED
- [ ] T057 [P] Write integration test for single-session booking in `backend/tests/integration/booking.test.ts`: create slot Ã¢â€ â€™ POST /api/bookings/single Ã¢â€ â€™ verify PENDING Ã¢â€ â€™ simulate webhook success Ã¢â€ â€™ verify CONFIRMED + slot BOOKED + email triggered
- [ ] T058 [P] Write integration test for cron in `backend/tests/integration/cron.test.ts`: create PENDING booking backdated 6 min Ã¢â€ â€™ call releasePendingBookings Ã¢â€ â€™ verify FAILED + slot AVAILABLE
- [ ] T059 [P] Write integration test for webhook in `backend/tests/integration/webhook.test.ts`: POST to `/api/webhooks/paymob` with valid and invalid payloads; assert state transitions and response codes

### Frontend Ã¢â‚¬â€ US1

- [ ] T060 [P] Create `frontend/src/components/booking/BookingCalendar.tsx`: month-view highlighting available dates; navigate months; emit selected date
- [ ] T061 [P] Create `frontend/src/components/booking/SlotPicker.tsx`: list available slots for selected date; Confirm button with loading state; conflict message + refresh on `SLOT_UNAVAILABLE`
- [ ] T062 Create `frontend/src/app/(client)/booking/page.tsx` composing `BookingCalendar` + `SlotPicker`; calls `api.getAvailableSlots(date)` and `api.createSingleBooking(slotId)`; redirect to Paymob URL; `EmptyState` when no slots
- [ ] T063 [P] Create `frontend/src/app/(client)/layout.tsx`: client nav bar (Dashboard, Book a Session)
- [ ] T064 Create `frontend/src/app/(client)/dashboard/page.tsx`: upcoming CONFIRMED bookings with slot time, type badge, meet link; `EmptyState` when no bookings

**Checkpoint**: Core revenue flow complete Ã¢â‚¬â€ single-session booking works end-to-end

---

## Phase 7: User Story 2 Ã¢â‚¬â€ Client Purchases Roadmap Package (Priority: P2)

**Goal**: Client selects a package tier, submits intake form, pays, tracks sessions.

### Backend Ã¢â‚¬â€ US2

- [ ] T065 Create `backend/src/services/package.service.ts`: `createPendingPackage`, `confirmPackage`, `bookPackageSession` (verify ACTIVE + sessionsUsed < totalSessions Ã¢â€ â€™ CONFIRMED booking Ã¢â€ â€™ increment sessionsUsed Ã¢â€ â€™ COMPLETED if exhausted), `getActivePackage`
- [ ] T066 [P] Create `backend/src/routes/packages.routes.ts`: GET `/api/packages/tiers`, POST `/api/packages`, POST `/api/packages/book-session`
- [ ] T067 Extend `backend/src/routes/webhooks.routes.ts` to detect package payments (by `packageId` on `PaymentRecord`); on success call `package.service#confirmPackage`
- [ ] T068 Write integration test for package in `backend/tests/integration/package.test.ts`: create package Ã¢â€ â€™ webhook confirm Ã¢â€ â€™ verify ACTIVE Ã¢â€ â€™ bookPackageSession Ãƒâ€” 6 Ã¢â€ â€™ verify COMPLETED

### Frontend Ã¢â‚¬â€ US2

- [ ] T069 [P] Create `frontend/src/components/booking/IntakeForm.tsx`: 4-field form; blur + submit validation; inline errors (no alerts)
- [ ] T070 [P] Create `frontend/src/components/booking/PackageProgress.tsx`: `sessionsUsed / totalSessions` progress bar; `EmptyState` if no active package
- [ ] T071 Create `frontend/src/app/(client)/booking/package/page.tsx`: tier selection cards Ã¢â€ â€™ intake form Ã¢â€ â€™ Paymob redirect; loading state on payment initiation
- [ ] T072 Update `frontend/src/app/(client)/dashboard/page.tsx` to include `PackageProgress` for active package

**Checkpoint**: Package flow complete Ã¢â‚¬â€ both booking types fully functional

---

## Phase 8: User Story 4 Ã¢â‚¬â€ Admin Manages Pricing (Priority: P2)

**Goal**: Youssef sets default price, per-tier prices, and per-client overrides.

### Backend Ã¢â‚¬â€ US4

- [ ] T073 Create `backend/src/routes/pricing.routes.ts`: GET `/api/pricing`, PUT `/api/pricing/default`, PUT `/api/pricing/tier/:tierId`, PUT `/api/pricing/client/:clientId`; all [ADMIN] except GET /pricing

### Frontend Ã¢â‚¬â€ US4

- [ ] T074 [P] Create `frontend/src/components/admin/PricingPanel.tsx`: default price form; tier price list; client override section; inline validation + loading + success toast on each
- [ ] T075 Create `frontend/src/app/(admin)/admin/pricing/page.tsx` rendering `PricingPanel`; loads current prices via `api.getPricing()`
- [ ] T076 Verify `api.createSingleBooking()` and `api.createPackageBooking()` receive the `amountEgp` resolved by the backend's `pricing.service#resolvePrice(userId)` Ã¢â‚¬â€ this is internal to the backend; confirm via integration test

**Checkpoint**: Pricing fully configurable Ã¢â‚¬â€ correct amounts flow to Paymob

---

## Phase 9: User Story 5 Ã¢â‚¬â€ Admin Meet Links & Bookings View (Priority: P2)

**Goal**: Youssef views all bookings, enters Meet links, views clients and intake forms.

### Backend Ã¢â‚¬â€ US5

- [ ] T077 Create `backend/src/routes/clients.routes.ts`: GET `/api/clients`, GET `/api/clients/:id` Ã¢â‚¬â€ both [ADMIN]; eager-load bookings + packages + intake form

### Frontend Ã¢â‚¬â€ US5

- [ ] T078 [P] Create `frontend/src/components/admin/BookingsTable.tsx`: filterable table by status/type; status badges; `EmptyState`
- [ ] T079 [P] Create `frontend/src/components/admin/MeetLinkInput.tsx`: URL input + Save; inline URL validation; loading + success toast
- [ ] T080 [P] Create `frontend/src/components/admin/ClientsTable.tsx`: client list with name, email, booking count, active package badge
- [ ] T081 Create `frontend/src/app/(admin)/admin/bookings/page.tsx` composing `BookingsTable` + `MeetLinkInput` per CONFIRMED row
- [ ] T082 Create `frontend/src/app/(admin)/admin/clients/page.tsx` with `ClientsTable`
- [ ] T083 Create `frontend/src/app/(admin)/admin/clients/[id]/page.tsx`: client info, full booking history, package section with intake form responses
- [ ] T084 Verify `backend/src/services/cron.service.ts#sendDueReminders` reads `booking.meetLink` and passes it to `sendReminderEmail`; null meetLink renders placeholder in reminder template

**Checkpoint**: Admin has full operational visibility and can enter Meet links

---

## Phase 10: User Story 6 Ã¢â‚¬â€ Admin Monthly Reports (Priority: P3)

**Goal**: Youssef selects a month and sees revenue in EGP and USD, session count, top clients.

### Backend Ã¢â‚¬â€ US6

- [ ] T085 Create `backend/src/services/report.service.ts#getMonthlyReport`: aggregate CONFIRMED bookings in month; sum `totalRevenueEgp`, `totalRevenueUsd`; count sessions; group by userId for `topClients`; return zeros for empty month
- [ ] T086 Create `backend/src/routes/reports.routes.ts`: GET `/api/reports/monthly?year=&month=` Ã¢â‚¬â€ [ADMIN]; validate year Ã¢â€°Â¥ 2024 and month 1Ã¢â‚¬â€œ12

### Frontend Ã¢â‚¬â€ US6

- [ ] T087 [P] Create `frontend/src/components/admin/MonthlyReport.tsx`: month + year selects; stat cards; top clients table; `EmptyState` for no bookings
- [ ] T088 Create `frontend/src/app/(admin)/admin/reports/page.tsx` rendering `MonthlyReport`; defaults to current month

**Checkpoint**: Full reporting available Ã¢â‚¬â€ all user stories complete

---

## Phase 11: Polish, Docker & Deployment

**Purpose**: Final wiring, Dockerfiles, Nginx, and deployment readiness.

- [ ] T089 Create `frontend/Dockerfile`: multi-stage (deps Ã¢â€ â€™ builder Ã¢â€ â€™ runner); standalone Next.js output; `COPY --from=builder /app/.next/standalone ./`
- [ ] T090 Create `backend/Dockerfile`: multi-stage (deps Ã¢â€ â€™ builder Ã¢â€ â€™ runner); copy `dist/` and `node_modules/`; `CMD ["node", "dist/app.js"]`
- [ ] T091 Update `docker-compose.yml` to three services: `frontend` (build: ./frontend, port 3000, env BACKEND_URL=http://backend:4000), `backend` (build: ./backend, port 4000, depends_on db), `db` (image postgres:16-alpine, volume for data persistence)
- [ ] T092 [P] Update `docker-compose.override.yml` for dev: volume mounts for both apps (hot reload), `DATABASE_URL` pointing to `db` service, expose db port 5432
- [ ] T093 Create `nginx/nginx.conf`: route `/api/auth/*` Ã¢â€ â€™ frontend:3000; route `/api/*` Ã¢â€ â€™ backend:4000; route `/*` Ã¢â€ â€™ frontend:3000; add to `docker-compose.yml` as `nginx` service
- [ ] T094 Create `deploy/README.md`: VPS runbook Ã¢â‚¬â€ SSH Ã¢â€ â€™ git pull Ã¢â€ â€™ docker compose up Ã¢â€ â€™ prisma migrate deploy Ã¢â€ â€™ crontab install Ã¢â€ â€™ Certbot SSL
- [ ] T095 [P] Add Lighthouse CI to `.github/workflows/ci.yml`: assert `first-contentful-paint < 2000ms` on production frontend Docker build
- [ ] T096 [P] Add `pnpm type-check` steps for both apps to CI; run locally and resolve all TypeScript errors

**Checkpoint**: Both apps containerized and deployment-ready

---

## Phase 12: End-to-End Testing (Playwright)

**Purpose**: Verify every user story works end-to-end in a real browser.

**Prerequisite**: Phase 11 complete; Docker Compose stack running.
**Test runner**: `cd frontend && pnpm playwright test`

### E2E Setup

- [ ] TE001 [P] Complete `frontend/tests/e2e/global-setup.ts`: seed backend test data via `fetch` to backend API (admin user + 2 client users + 5 available slots for tomorrow); confirm runs with `pnpm playwright test --project=setup`
- [ ] TE002 [P] Confirm `frontend/tests/e2e/fixtures/auth.ts`: `adminPage` and `clientPage` fixtures save storage state to `playwright/.auth/`; add `playwright/.auth/` to `.gitignore`
- [ ] TE003 Add Playwright E2E job to `.github/workflows/ci.yml`: `docker compose up -d` Ã¢â€ â€™ wait for healthchecks Ã¢â€ â€™ `pnpm playwright test` Ã¢â€ â€™ upload `playwright-report/` on failure

### E2E Tests Ã¢â‚¬â€ Authentication

- [ ] TE004 [P] Complete `frontend/tests/e2e/auth.spec.ts` Ã¢â‚¬â€ 5 tests:
  - Unauthenticated `/booking` Ã¢â€ â€™ redirects to `/login`
  - Valid admin credentials Ã¢â€ â€™ lands on `/admin`
  - Wrong password Ã¢â€ â€™ inline error below password field
  - Unauthenticated `/admin` Ã¢â€ â€™ redirects to `/login`
  - CLIENT role on `/admin` Ã¢â€ â€™ 403 shown

### E2E Tests Ã¢â‚¬â€ US3: Admin Calendar

- [ ] TE005 Complete `frontend/tests/e2e/admin-calendar.spec.ts` Ã¢â‚¬â€ 6 tests:
  - Empty state shown with no slots for date
  - Create slot Ã¢â€ â€™ appears with Available badge
  - Generate 9 slots (09:00Ã¢â‚¬â€œ18:00) Ã¢â€ â€™ toast "9 slots created"
  - Block day Ã¢â€ â€™ ConfirmDialog names date Ã¢â€ â€™ no slots for that day
  - Delete slot Ã¢â€ â€™ ConfirmDialog names time Ã¢â€ â€™ success toast
  - Delete slot with CONFIRMED booking Ã¢â€ â€™ blocked with error

### E2E Tests Ã¢â‚¬â€ US1: Client Single Session

- [ ] TE006 Complete `frontend/tests/e2e/booking-single.spec.ts` Ã¢â‚¬â€ 5 tests:
  - Calendar shows highlighted available dates
  - Select date Ã¢â€ â€™ slot list within 1 second
  - Confirm slot Ã¢â€ â€™ loading Ã¢â€ â€™ redirected to `accept.paymob.com`
  - Stale slot conflict Ã¢â€ â€™ conflict message Ã¢â€ â€™ calendar refreshes
  - After CONFIRMED booking Ã¢â€ â€™ appears on `/dashboard`

### E2E Tests Ã¢â‚¬â€ US2: Roadmap Package

- [ ] TE007 Complete `frontend/tests/e2e/booking-package.spec.ts` Ã¢â‚¬â€ 5 tests:
  - Tier cards show name, sessions, price
  - Select tier Ã¢â€ â€™ intake form renders with 4 fields
  - Submit with empty `primaryGoal` Ã¢â€ â€™ inline error below field
  - Valid form Ã¢â€ â€™ redirected to `accept.paymob.com`
  - After package confirmed Ã¢â€ â€™ `/dashboard` shows "0 of N sessions completed"

### E2E Tests Ã¢â‚¬â€ US4: Admin Pricing

- [ ] TE008 [P] Complete `frontend/tests/e2e/admin-pricing.spec.ts` Ã¢â‚¬â€ 4 tests:
  - Pricing page loads default and tier prices
  - Update default price Ã¢â€ â€™ success toast Ã¢â€ â€™ persists on reload
  - Update tier price Ã¢â€ â€™ success toast Ã¢â€ â€™ persists
  - Assign client custom price Ã¢â€ â€™ override shown

### E2E Tests Ã¢â‚¬â€ US5: Admin Bookings & Meet Links

- [ ] TE009 Complete `frontend/tests/e2e/admin-bookings.spec.ts` Ã¢â‚¬â€ 5 tests:
  - Bookings table shows all bookings with status badges
  - Filter by CONFIRMED Ã¢â€ â€™ only confirmed rows
  - Enter Meet URL Ã¢â€ â€™ loading Ã¢â€ â€™ success toast Ã¢â€ â€™ persists on reload
  - Clients list shows name, email, booking count
  - Client detail shows session history + intake form

### E2E Tests Ã¢â‚¬â€ US6: Monthly Reports

- [ ] TE010 [P] Complete `frontend/tests/e2e/admin-reports.spec.ts` Ã¢â‚¬â€ 4 tests:
  - Report loads within 3 seconds
  - EGP and USD revenue cards visible
  - Empty month Ã¢â€ â€™ zeros + EmptyState (no error, no blank page)
  - Top clients ranked by booking count

### E2E Tests Ã¢â‚¬â€ Client Dashboard

- [ ] TE011 [P] Complete `frontend/tests/e2e/dashboard.spec.ts` Ã¢â‚¬â€ 5 tests:
  - No bookings Ã¢â€ â€™ EmptyState shown
  - CONFIRMED booking Ã¢â€ â€™ slot date/time + type visible
  - Meet link set Ã¢â€ â€™ shows in booking card
  - Active package Ã¢â€ â€™ PackageProgress shows "N of M sessions completed"
  - COMPLETED package Ã¢â€ â€™ not shown under active packages

### MCP Playwright Manual Smoke Tests

- [ ] TE012 **Manual smoke Ã¢â‚¬â€ Full single-session flow** (MCP Playwright Chrome):
  1. `browser_navigate` to `http://localhost:3000`
  2. Sign in as test client via credentials
  3. `browser_click` available slot on calendar
  4. Confirm Ã¢â€ â€™ assert redirect to `accept.paymob.com`
  5. Simulate webhook: `curl -X POST http://localhost:4000/api/webhooks/paymob -H "Content-Type: application/json" -d @tests/fixtures/webhook-success.json`
  6. `browser_navigate` to `/dashboard` Ã¢â€ â€™ assert CONFIRMED booking
  7. `browser_take_screenshot` for documentation

- [ ] TE013 **Manual smoke Ã¢â‚¬â€ Admin calendar + meet link** (MCP Playwright Chrome):
  1. Sign in as admin Ã¢â€ â€™ `/admin/calendar` Ã¢â€ â€™ generate slots for tomorrow
  2. Navigate to `/admin/bookings` Ã¢â€ â€™ find CONFIRMED booking from TE012
  3. Enter `https://meet.google.com/test-link-123` Ã¢â€ â€™ save
  4. Sign in as client Ã¢â€ â€™ `/dashboard` Ã¢â€ â€™ `browser_snapshot` assert meet link visible

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Backend Setup)**: No dependencies Ã¢â‚¬â€ start immediately
- **Phase 2 (Frontend Setup)**: No dependencies Ã¢â‚¬â€ parallel with Phase 1
- **Phase 3 (Backend Core)**: After Phase 1
- **Phase 4 (Frontend Auth)**: After Phase 2; needs backend running for credential verify
- **Phase 5 (US3 Admin Calendar)**: After Phase 3 Ã¢â‚¬â€ backend slots API; Phase 4 Ã¢â‚¬â€ frontend auth
- **Phase 6 (US1 Client Booking)**: After Phase 3; parallel with Phase 5
- **Phase 7 (US2 Package)**: After Phase 6 (reuses booking + payment + webhook)
- **Phase 8 (US4 Pricing)**: After Phase 3 (pricing.service already in Phase 3)
- **Phase 9 (US5 Bookings View)**: After Phase 6 + Phase 5
- **Phase 10 (US6 Reports)**: After Phase 6 (needs payment records)
- **Phase 11 (Polish + Docker)**: After all user story phases
- **Phase 12 (E2E)**: After Phase 11; test stubs already written

### Parallel Opportunities

- T001Ã¢â‚¬â€œT011 (Backend Setup) and T012Ã¢â‚¬â€œT022 (Frontend Setup): fully parallel
- T023Ã¢â‚¬â€œT030 (Backend Core): T024, T025, T026, T027, T028 parallel after T023
- T031Ã¢â‚¬â€œT037 (Frontend Auth): T033Ã¢â‚¬â€œT037 parallel after T031
- T047Ã¢â‚¬â€œT059 (US1 Backend): T048, T049, T050, T051 parallel after T047

---

## Notes

- [P] tasks = different files, no shared state Ã¢â‚¬â€ safe to run in parallel
- `AUTH_SECRET` MUST be identical in `frontend/.env.local` and `backend/.env.local`
- Never import from `@prisma/client` outside `backend/src/lib/` and `backend/src/services/`
- Frontend Server Actions call backend via `frontend/src/lib/api.ts` Ã¢â‚¬â€ never call Prisma directly from frontend
- Constitution-mandated P0 tests (T056Ã¢â‚¬â€œT059, T068) are non-optional
- Run `pnpm prisma db seed` after each migration reset in the backend test environment
- The `contracts/server-actions.md` file from the original design has been superseded by `contracts/rest-api.md`

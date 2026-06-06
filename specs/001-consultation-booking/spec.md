# Feature Specification: Consultation Booking Platform

**Feature Branch**: `001-consultation-booking`
**Created**: 2026-06-05
**Status**: Draft
**Input**: User description: "Build a consultation booking platform for a developer consultant named Youssef"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Client Books a Single Session (Priority: P1)

A developer visits the platform, signs in with Google or email/password, browses a
calendar showing only available 60-minute slots, selects a slot, and pays immediately
via Paymob. Upon payment success the slot is confirmed and the client receives a
confirmation email. Thirty minutes before the session, the client receives a reminder
email with the Google Meet link that Youssef has entered.

**Why this priority**: This is the core revenue flow and the primary reason the platform
exists. It must work end-to-end before anything else is built.

**Independent Test**: A test user can register, reach the calendar, select an available
slot, complete a simulated Paymob payment, and verify a confirmation email is sent and
the booking appears as confirmed — all without any admin action.

**Acceptance Scenarios**:

1. **Given** an unauthenticated user on the landing page, **When** they click "Sign in
   with Google", **Then** they are authenticated and redirected to the booking calendar.
2. **Given** an authenticated client on the calendar, **When** they view it, **Then**
   only slots with status `available` are shown; booked or blocked slots are hidden or
   shown as unavailable.
3. **Given** an authenticated client who selects an available slot, **When** they
   confirm and proceed to payment, **Then** the slot status changes to `pending` and the
   client is redirected to Paymob's hosted payment page.
4. **Given** a client on the Paymob payment page, **When** payment succeeds and Paymob
   sends a webhook, **Then** the booking status changes to `confirmed`, the slot status
   changes to `booked`, and the client receives a confirmation email within 2 minutes.
5. **Given** a pending booking with no Paymob webhook received, **When** 5 minutes
   elapse, **Then** the booking status changes to `failed` and the slot returns to
   `available`.
6. **Given** a confirmed booking, **When** Youssef enters a Google Meet URL for that
   booking, **Then** the client receives a reminder email containing that URL exactly
   30 minutes before the session start time.
7. **Given** a client who selects a slot that another client has just claimed, **When**
   they attempt to pay, **Then** they see a clear conflict message and the calendar
   refreshes to show current availability.

---

### User Story 2 — Client Purchases a Roadmap Package (Priority: P2)

A developer wants structured mentoring. They select the Roadmap Package option, fill an
intake form (current skill level, primary goal, expected outcomes, preferred timeline),
review the package price, and pay via Paymob. After payment, they can see their package
in their dashboard and track session progress (e.g. "3 of 6 sessions completed"). Each
individual session within the package behaves identically to a single-session booking
with respect to slot selection, confirmation email, and 30-minute reminder.

**Why this priority**: Packages are a higher-value offering and are explicitly required.
However, they depend on the P1 single-session infrastructure.

**Independent Test**: A test user can navigate to the package flow, submit a valid intake
form, complete a simulated payment, and see a package record in their dashboard showing
0 of N sessions completed — without any admin action.

**Acceptance Scenarios**:

1. **Given** an authenticated client on the booking page, **When** they choose "Roadmap
   Package", **Then** they are presented with available package tiers and their prices.
2. **Given** a client who has selected a package tier, **When** they proceed, **Then**
   they must complete an intake form before reaching payment. The form fields are:
   current skill level, primary goal, expected outcomes, and preferred timeline. All
   fields are required.
3. **Given** a client who has submitted a valid intake form, **When** they confirm the
   order, **Then** they are redirected to Paymob with the correct package price.
4. **Given** a successful Paymob webhook for a package payment, **When** processed,
   **Then** a package record is created with status `active`, the number of included
   sessions is set per the purchased tier, and the client receives a confirmation email.
5. **Given** a client with an active package in their dashboard, **When** they view it,
   **Then** they see tier name, total sessions, sessions completed, and remaining
   sessions (e.g. "3 of 6 completed").
6. **Given** a client with an active package booking a session, **When** they select a
   slot, **Then** the session is deducted from their package rather than charged
   separately.

---

### User Story 3 — Admin Manages the Calendar (Priority: P1)

Youssef logs in to the admin area and creates available time slots for clients to book.
He can add individual slots, generate multiple slots from a time range (e.g. 9 am–6 pm
splits into hourly 60-minute slots), and block entire days so no slots appear for
clients.

**Why this priority**: Without admin-managed slots there is nothing for clients to book.
This is a co-P1 with Story 1.

**Independent Test**: An admin user can log in, create a set of slots for a given day,
verify they appear in the client-facing calendar, block a day and verify no slots appear
for that day, and delete a slot.

**Acceptance Scenarios**:

1. **Given** an admin on the calendar management page, **When** they add an individual
   slot with a specific date and time, **Then** that slot appears in the client calendar
   with status `available`.
2. **Given** an admin who selects a date and specifies a start time, end time, and
   interval (60 minutes), **When** they generate slots, **Then** all non-overlapping
   hourly slots within the range are created with status `available`.
3. **Given** an admin who blocks a specific date, **When** the block is saved, **Then**
   no `available` slots are shown to clients for that date.
4. **Given** an admin viewing an existing slot, **When** they delete it (and confirm the
   destructive action), **Then** the slot is removed and no longer visible to clients.
5. **Given** an admin attempting to delete a slot that has a `confirmed` booking,
   **When** they attempt deletion, **Then** the action is blocked with a clear error
   message.

---

### User Story 4 — Admin Manages Pricing (Priority: P2)

Youssef sets a default single-session price, sets package prices per tier (each tier has
its own fixed price, not calculated by multiplying a per-session rate), and can assign
custom prices to specific clients that override defaults.

**Why this priority**: Pricing must be configurable before any payment can flow correctly,
but exact prices can be seeded at deployment.

**Acceptance Scenarios**:

1. **Given** an admin on the pricing page, **When** they update the default single-
   session price, **Then** all new single-session bookings use the updated price.
2. **Given** an admin managing package tiers, **When** they set a price for a named tier
   (e.g. "6-session package"), **Then** clients selecting that tier see and pay that
   exact price.
3. **Given** an admin assigning a custom price to a specific client, **When** that
   client books a single session or package, **Then** they are charged the custom price
   instead of the default.

---

### User Story 5 — Admin Manages Meet Links and Views Bookings (Priority: P2)

Youssef views all bookings in the admin area, sees booking status, and enters a Google
Meet URL for each confirmed booking. He also views all clients, their session history,
and intake form responses.

**Acceptance Scenarios**:

1. **Given** an admin on the bookings page, **When** they view it, **Then** they see all
   bookings with client name, session date/time, booking type (single/package), status,
   and payment amount.
2. **Given** an admin viewing a confirmed booking, **When** they enter a Google Meet URL,
   **Then** the URL is saved and will be included in the 30-minute reminder email.
3. **Given** an admin on the clients page, **When** they click on a client, **Then** they
   see that client's full session history and, for package clients, their intake form
   responses.

---

### User Story 6 — Admin Views Monthly Reports (Priority: P3)

Youssef views a monthly report showing total revenue in EGP and USD separately, total
session count, and the top clients by booking volume for that month.

**Acceptance Scenarios**:

1. **Given** an admin on the reports page, **When** they select a month and year, **Then**
   they see: total revenue in EGP, total revenue in USD, total confirmed sessions for the
   month, and a ranked list of clients by number of confirmed bookings.
2. **Given** an admin viewing the report, **When** a month has no bookings, **Then** the
   report shows zero values with a descriptive empty-state message rather than an error.

---

### Edge Cases

- What happens when a client attempts to book a slot that becomes unavailable between
  page load and payment submission? → Conflict message + calendar refresh (covered in US1
  Scenario 7).
- What happens if Paymob sends the same webhook twice? → Idempotent handler: if booking
  is already `confirmed` or `failed`, no state change occurs.
- What happens if no Google Meet URL has been entered when the 30-minute reminder cron
  fires? → The reminder email is still sent, but the Meet link section is omitted or
  replaced with a placeholder message ("Meeting link coming soon").
- What happens if a client with an active package tries to book more sessions than
  remaining? → Booking is blocked with a message indicating zero remaining sessions.
- What happens if a package payment fails? → No package record is created; the client
  sees a failure message and is invited to retry.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow clients to authenticate via Google OAuth and via
  email/password.
- **FR-002**: The system MUST display only `available` slots on the client-facing
  calendar; `booked` and `blocked` slots MUST NOT be selectable.
- **FR-003**: The system MUST support two booking types: Single Session (one 60-minute
  slot, paid immediately) and Roadmap Package (minimum 6 sessions, single upfront
  payment, intake form required before payment).
- **FR-004**: The system MUST integrate with Paymob for payment processing; all payments
  are initiated by redirecting the client to Paymob's hosted payment page.
- **FR-005**: The system MUST send a confirmation email to the client after every
  successful payment (single session or package).
- **FR-006**: The system MUST send an automated reminder email to the client 30 minutes
  before each confirmed session; the email MUST include the Google Meet URL if one has
  been set.
- **FR-007**: The system MUST prevent a slot from being booked by more than one client;
  a unique database-level constraint MUST enforce this.
- **FR-008**: The system MUST release pending bookings (and their slots) after a
  5-minute timeout if no successful payment webhook is received.
- **FR-009**: The system MUST handle duplicate Paymob webhooks idempotently.
- **FR-010**: Admin MUST be able to add individual calendar slots and generate multiple
  slots from a time range with a configurable interval.
- **FR-011**: Admin MUST be able to block entire days so no `available` slots are shown
  to clients.
- **FR-012**: Admin MUST be able to delete slots that are not associated with a
  `confirmed` booking.
- **FR-013**: Admin MUST be able to set a default single-session price, set per-tier
  package prices (fixed, not calculated), and assign custom prices per client.
- **FR-014**: Admin MUST be able to manually enter a Google Meet URL for each confirmed
  booking.
- **FR-015**: Admin MUST be able to view all bookings with status, all clients with
  session history and intake form responses, and all payment records.
- **FR-016**: Admin MUST be able to view monthly reports showing revenue in EGP and USD
  separately, session counts, and top clients by booking volume.
- **FR-017**: Clients with an active package MUST see a dashboard view showing sessions
  completed vs. total sessions in the package.

### Key Entities

- **User**: An authenticated person. Roles: `ADMIN` or `CLIENT`. Has display name, email,
  avatar URL (for Google), and an optional custom price override.
- **Slot**: A 60-minute time block created by the admin. Statuses: `available`, `booked`,
  `blocked`.
- **Booking**: A client's reservation of a slot. Statuses: `pending`, `confirmed`,
  `failed`. Belongs to a User and a Slot. May belong to a Package.
- **Package**: A bundle of sessions purchased by a client. Has a tier, total session
  count, sessions used, and status (`active`, `completed`). Has one IntakeForm.
- **IntakeForm**: Answers to the pre-package questionnaire. Fields: current skill level,
  primary goal, expected outcomes, preferred timeline. One per Package.
- **Price**: Configuration record. Types: `single_session_default`, `package_tier`,
  `client_override`. Stores amount and currency.
- **PaymentRecord**: The result of a Paymob transaction. Stores Paymob order ID,
  amount, currency, status, and raw webhook payload (for audit).
- **BlockedDay**: A date blocked by admin. Prevents slot creation and hides existing
  slots for that date.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new client can complete a full single-session booking — from landing page
  through payment confirmation — in under 5 minutes without any action from Youssef.
- **SC-002**: A new client can complete a Roadmap Package purchase — including intake form
  — in under 7 minutes without any action from Youssef.
- **SC-003**: Confirmation emails are delivered within 2 minutes of a successful payment.
- **SC-004**: Reminder emails are sent within 1 minute of the 30-minute-before trigger.
- **SC-005**: The calendar reflects current slot availability; a stale slot conflict is
  detected and surfaced to the client rather than resulting in a silent double-booking.
- **SC-006**: Youssef performs zero WhatsApp messages for booking, payment, or meeting-
  link coordination after the platform goes live.
- **SC-007**: Monthly revenue reports for a given month are available within 3 seconds
  of selection.
- **SC-008**: All admin write actions (slot creation, pricing update, Meet link entry)
  complete and reflect updated state within 2 seconds.

## Assumptions

- All sessions are 60 minutes in duration. Variable session durations are out of scope
  for v1.
- All sessions are held via Google Meet. The Meet link is entered manually by Youssef;
  automatic creation is out of scope for v1.
- Payment currency is EGP by default. USD revenue is displayed in reports using a
  configurable exchange rate or a rate recorded at payment time; the exact rate-recording
  mechanism will be determined during implementation planning.
- Package tiers (e.g., "6-session", "10-session") and their prices are pre-defined by
  Youssef in the admin pricing panel; clients cannot negotiate or propose custom tiers.
- The minimum package size is 6 sessions. The exact set of available tiers is configured
  by Youssef; the system supports multiple tiers.
- There is exactly one admin account (Youssef). Multi-admin support is out of scope.
- Email delivery is handled by Resend (transactional email service). Delivery failures
  are logged but do not block booking confirmation.
- Rescheduling, cancellation, and refunds are explicitly out of scope for v1.
- Native mobile apps, multi-language support, and automatic Google Meet link generation
  are explicitly out of scope for v1.
- The platform is accessed via web browser only. Responsive design for mobile browsers
  is in scope; a native app is not.
- Time zones: all slots are stored in UTC; the client-facing calendar displays times in
  the client's local browser timezone. The admin calendar displays times in Youssef's
  local timezone (Cairo, EET).

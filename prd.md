# Consultation Booking Platform — Product Requirements Document

---

## Section 1 — Project Identity

| Field1              | Value                                                      |
|--------------------|------------------------------------------------------------|
| Project Name       | Consultation Booking Platform                              |
| Project ID         | PRD-001                                                    |
| Version            | v1.0                                                       |
| Status             | Draft                                                      |
| Priority           | High                                                       |
| Created Date       | 2026-06-05                                                 |
| Last Updated       | 2026-06-05                                                 |
| Owner              | Youssef                                                    |
| Team Members       | Frontend Dev / Backend Dev / Designer / QA                 |
| Tech Stack         | Next.js (App Router) · PostgreSQL · Prisma · NextAuth.js · Paymob API · Resend · BullMQ · Redis |
| Repository         | [TBD]                                                      |
| Git Branch Prefix  | NNN-feature-name                                           |
| PRD File Path      | docs/PRD.md                                                |

---

## Section 2 — Problem & Purpose

### Problem Statement
Youssef currently operates his developer consultation service entirely through WhatsApp. Scheduling, pricing negotiation, payment collection, and meeting link distribution are all handled manually. This process is unscalable, error-prone, and consumes significant time that should be directed toward delivering consultations.

### Project Purpose
The Consultation Booking Platform replaces all manual WhatsApp-based operations with a self-service web application. Clients book sessions, submit intake forms, and complete payments without requiring direct involvement from Youssef. Youssef manages his calendar, pricing, and client base through a dedicated admin dashboard.

### Business Value
- Eliminates manual scheduling and follow-up overhead
- Enables asynchronous payment collection at any time
- Creates a professional client-facing experience
- Provides full financial and booking visibility through reporting

### Opportunity
The consultation market for developers is growing. A professional booking system positions Youssef's service as a credible product rather than a freelance side arrangement, enabling higher conversion rates and repeat bookings.

---

## Section 3 — Goals & Objectives

### Primary Goal
Deliver a fully operational consultation booking platform that allows clients to independently discover available slots, book sessions or packages, complete payment via Paymob, and receive automated confirmations and meeting links — all without manual intervention from Youssef.

### Objectives
1. Enable clients to register via Google or Email and access the booking calendar within 2 minutes of landing on the site.
2. Support two booking types: Single Session (1 hour) and Roadmap Package (minimum 6 sessions) with configurable pricing.
3. Process payments exclusively through Paymob with confirmation emails sent immediately upon successful payment.
4. Deliver Google Meet links to clients via email 30 minutes before each session without manual action.
5. Provide Youssef with a real-time admin dashboard displaying bookings, client details, payment history, and monthly revenue reports.

### Success Definition
The platform is considered successful when:
- Clients can complete a booking end-to-end without contacting Youssef directly.
- Zero manual WhatsApp messages are required for booking, payment, or meeting link delivery.
- Youssef can manage his full calendar, pricing, and client list from the admin dashboard.

### Non-Goals
- Automatic refund processing
- Multi-language support
- Native mobile application
- Zoom integration (Meet links are added manually by admin)
- Rescheduling or cancellation by clients

---

## Section 4 — Scope

### In Scope
- User authentication via Google OAuth and Email/Password (NextAuth.js)
- Public landing page with call-to-action
- Client-facing booking calendar showing available slots only
- Single Session booking flow with Paymob payment
- Roadmap Package booking flow with intake form and Paymob payment
- Booking confirmation emails to client and admin
- Automated email with Google Meet link sent 30 minutes before session (BullMQ + Redis scheduled jobs)
- Admin calendar management: manual slot creation, time-range auto-split, full-day blocking
- Admin pricing controls: session price, package price, custom price per client
- Admin manual entry of Google Meet link per booking
- Admin dashboard: bookings overview, client list, payment history
- Admin reports: monthly revenue, session count, top clients
- Client dashboard: upcoming and past sessions, package progress
- Currency support: EGP and USD

### Out of Scope
- Automatic refunds
- Native mobile app (iOS / Android)
- Multi-language interface
- Zoom or automated Meet link generation
- Client-initiated rescheduling or cancellation
- Marketplace or third-party integrations

### Assumptions
- Youssef has an active Paymob merchant account before launch.
- Google Meet links are created manually by Youssef and added to the admin dashboard.
- Email delivery is handled by Resend or Nodemailer connected to a verified sending domain.
- The platform will be hosted on a VPS (Ubuntu/Debian) controlled by Youssef, managed via PM2 or Docker.

### Constraints
- Payment gateway is limited to Paymob; no alternative processors in v1.
- No client-side cancellation or rescheduling logic in v1.
- Google Meet links must be entered manually by the admin; no Google Calendar API integration.

### Dependencies
- Paymob API availability and merchant onboarding completion
- Resend or SMTP provider setup and domain verification
- BullMQ + Redis configuration for reminder job scheduling
- NextAuth.js Google OAuth credentials configuration

---

## Section 5 — Users & Personas

### Primary Users

#### Persona 1 — Developer Client (Booker)
| Attribute     | Detail                                                                 |
|---------------|------------------------------------------------------------------------|
| Name          | Developer Client                                                       |
| Role          | Software developer seeking career or technical guidance                |
| Goal          | Book a consultation session or roadmap package and receive structured mentorship without friction |
| Pain Point    | No self-service way to see availability, pay, or get meeting details — currently requires WhatsApp coordination |
| Tech Level    | Medium to High                                                         |
| Frequency     | 1–6 sessions per engagement                                            |
| Success       | Books a session in under 5 minutes, receives confirmation and meeting link automatically |

#### Persona 2 — Admin (Youssef)
| Attribute     | Detail                                                                 |
|---------------|------------------------------------------------------------------------|
| Name          | Youssef                                                                |
| Role          | Consultation provider and platform owner                               |
| Goal          | Manage all bookings, pricing, and clients from a single dashboard without manual messaging |
| Pain Point    | Every booking, payment confirmation, and meeting link is currently sent manually via WhatsApp |
| Tech Level    | High                                                                   |
| Frequency     | Daily                                                                  |
| Success       | Zero WhatsApp messages required; full financial and booking visibility available at all times |

---

## Section 6 — MoSCoW Feature Prioritization

### Must Have — P0

| ID       | Feature                        | Status | Description                                                                 | Assigned To    | Sprint |
|----------|--------------------------------|--------|-----------------------------------------------------------------------------|----------------|--------|
| P0-F001  | User Authentication            | TODO   | Google OAuth and Email/Password login via NextAuth.js                       | Backend Dev    | 1      |
| P0-F002  | Booking Calendar (Client View) | TODO   | Display available slots only; client selects slot and booking type          | Frontend Dev   | 1      |
| P0-F003  | Single Session Booking         | TODO   | Client selects a slot, confirms 1-hour session, proceeds to Paymob checkout | Full Stack     | 2      |
| P0-F004  | Roadmap Package Booking        | TODO   | Client selects package (min 6 sessions), fills intake form, pays via Paymob | Full Stack     | 2      |
| P0-F005  | Paymob Payment Integration     | TODO   | Process payments in EGP or USD; confirm booking only on successful payment  | Backend Dev    | 2      |
| P0-F006  | Confirmation Email             | TODO   | Send booking confirmation email to client and admin immediately after payment | Backend Dev  | 2      |
| P0-F007  | Admin Calendar Management      | TODO   | Admin adds slots manually or by time range; admin blocks full days          | Full Stack     | 1      |
| P0-F008  | Admin Pricing Control          | TODO   | Admin sets session price, package price, and custom price per client        | Backend Dev    | 1      |
| P0-F009  | Admin Meet Link Entry          | TODO   | Admin manually adds Google Meet link to each booking from the dashboard     | Frontend Dev   | 3      |
| P0-F010  | 30-Minute Reminder Email       | TODO   | Automated email with Meet link sent to client 30 minutes before session     | Backend Dev    | 3      |

### Should Have — P1

| ID       | Feature                        | Status | Description                                                                 | Assigned To    | Sprint |
|----------|--------------------------------|--------|-----------------------------------------------------------------------------|----------------|--------|
| P1-F001  | Admin Bookings Dashboard       | TODO   | List of all bookings with status, client name, type, date, and payment info | Frontend Dev   | 3      |
| P1-F002  | Admin Clients List             | TODO   | Full client directory with session history and payment totals               | Full Stack     | 3      |
| P1-F003  | Admin Revenue Reports          | TODO   | Monthly revenue, total sessions, and top clients by booking count           | Backend Dev    | 4      |
| P1-F004  | Client Session Dashboard       | TODO   | Client view: upcoming sessions, past sessions, package progress indicator   | Frontend Dev   | 3      |
| P1-F005  | Intake Form (Package Flow)     | TODO   | Pre-payment form capturing goals, current level, and expected outcomes      | Frontend Dev   | 2      |

### Must Have — P0 (Added)

| ID       | Feature                             | Status | Description                                                                               | Assigned To  | Sprint |
|----------|-------------------------------------|--------|-------------------------------------------------------------------------------------------|--------------|--------|
| P0-F011  | Admin Package Session Scheduling    | TODO   | Admin assigns available slots to unscheduled PackageSession records from the dashboard    | Full Stack   | 3      |

### Could Have — P2

| ID       | Feature                        | Status | Description                                                                             | Assigned To  | Sprint |
|----------|--------------------------------|--------|-----------------------------------------------------------------------------------------|--------------|--------|
| P2-F001  | Admin In-App Notifications     | TODO   | In-app alert for new bookings and unscheduled package sessions                          | Backend Dev  | TBD    |
| P2-F002  | Bulk Slot Generation           | TODO   | Admin sets recurring weekly availability schedule                                       | Backend Dev  | TBD    |
| P2-F003  | ConsultationSession Notes      | TODO   | Admin adds notes, homework, and feedback to each `ConsultationSession` record           | Full Stack   | TBD    |
| P2-F004  | Audit Log Viewer               | TODO   | Admin views `AuditLog` table in dashboard: who changed what and when                   | Frontend Dev | TBD    |
| P2-F005  | Availability Rules (V2 Prep)   | TODO   | Replace static slots with `AvailabilityRule` + `AvailabilityException` dynamic generation | Backend Dev | TBD    |

### Won't Have — P3

| ID       | Feature                        | Status  | Description                              | Assigned To | Sprint |
|----------|--------------------------------|---------|------------------------------------------|-------------|--------|
| P3-F001  | Automatic Refunds              | SKIPPED | Deferred to v2                           | —           | —      |
| P3-F002  | Mobile Application             | SKIPPED | Native iOS/Android app deferred to v2    | —           | —      |
| P3-F003  | Multi-Language Support         | SKIPPED | Deferred to v2                           | —           | —      |
| P3-F004  | Zoom / Auto Meet Generation    | SKIPPED | Meet links added manually in v1          | —           | —      |
| P3-F005  | Client Rescheduling/Cancel     | SKIPPED | No self-service changes in v1            | —           | —      |
| P3-F006  | Promo / Coupon System          | SKIPPED | Schema supports it (Price date ranges); logic deferred to v2 | — | —  |
| P3-F007  | Multi-role Admin (RBAC)        | SKIPPED | `permissions` field reserved on User; full RBAC deferred to v2 | — | — |

---

## Section 7 — Functional Requirements

---

### P0-F001 — User Authentication

**Description:** Clients authenticate using Google OAuth or Email/Password. Admin access is role-protected and accessible only to Youssef's account.

**User Story:** As a developer client, I want to log in with my Google account or email so that I can access the booking calendar and manage my sessions securely.

**Trigger:** User clicks "Book a Consultation" on the landing page or navigates to `/login`.

**Pre-conditions:** User has a valid Google account or a registered email address.

**Post-conditions:** User is authenticated, session is created, and user is redirected to the booking calendar.

**Main Flow:**
1. User lands on `/login` page.
2. User selects "Continue with Google" or enters email and password.
3. System authenticates via NextAuth.js.
4. On success, system creates or retrieves user record in the database.
5. User is redirected to `/book`.

**Alternate Flows:**
- A1: Email not registered → System displays "No account found. Please register." with link to registration.
- A2: Google OAuth fails → System displays "Authentication failed. Please try again." with retry option.
- A3: Wrong password → System displays inline error "Incorrect password" after 1 failed attempt; locks account after 5 failed attempts for 15 minutes.

**Acceptance Criteria:**
- [ ] User can log in with Google OAuth in one click.
- [ ] User can register and log in with email and password.
- [ ] Failed login attempts display inline error messages.
- [ ] Account locks after 5 consecutive failed login attempts.
- [ ] Admin route `/admin` is inaccessible to non-admin users (returns 403).
- [ ] Session persists across page refreshes.

---

### P0-F002 — Booking Calendar (Client View)

**Description:** Authenticated clients view a calendar displaying only available (unbooked) time slots. Blocked days and fully booked slots are not selectable.

**User Story:** As a developer client, I want to see which time slots are available so that I can choose a convenient time for my session.

**Trigger:** Authenticated user navigates to `/book`.

**Pre-conditions:** User is authenticated. Admin has added at least one available slot.

**Post-conditions:** User selects a slot and is directed to choose session type.

**Main Flow:**
1. System fetches all slots with status `available` from the database.
2. Calendar renders with available slots highlighted.
3. User clicks an available slot.
4. System prompts user to choose booking type: Single Session or Package.
5. User proceeds to the relevant booking flow.

**Alternate Flows:**
- A1: No slots available → Calendar displays empty state message: "No sessions available at this time. Check back soon."
- A2: Slot becomes unavailable during browsing → On selection, system returns error "This slot was just booked. Please choose another."

**Acceptance Criteria:**
- [ ] Only slots with status `available` are clickable.
- [ ] Blocked days render as non-selectable with a visual indicator.
- [ ] Fully booked slots are visually distinct from available slots.
- [ ] Calendar displays slots in the client's local timezone.
- [ ] Empty state message appears when no slots exist.
- [ ] Concurrent booking conflict is handled with a clear error message.

---

### P0-F003 — Single Session Booking

**Description:** Client selects a single 1-hour slot and completes payment via Paymob. Booking is confirmed only upon successful payment.

**User Story:** As a developer client, I want to book a single 1-hour consultation and pay immediately so that my slot is reserved and I receive a confirmation.

**Trigger:** User selects "Single Session" after choosing a slot on the calendar.

**Pre-conditions:** User is authenticated. Slot is available. Paymob integration is active.

**Post-conditions:** `Order` created → `paid` → `confirmed`. `Booking` record linked to `Order`. `Payment` + `Transaction` records saved (immutable). Slot set to `booked`. Confirmation emails sent. Reminder job enqueued in BullMQ.

**Main Flow:**
1. User selects a slot and chooses "Single Session."
2. System displays booking summary: date, time, duration (1 hour), price (EGP or USD as configured).
3. User clicks "Proceed to Payment."
4. System renders an inline payment form (card number, expiry, CVV) hosted on the platform — no redirect or iframe.
5. User enters card details and clicks "Pay Now."
6. Backend calls Paymob API in sequence:
   a. `POST /api/auth/tokens` → obtain `auth_token`.
   b. `POST /api/ecommerce/orders` with `auth_token`, amount, and currency → obtain `order_id`.
   c. `POST /api/acceptance/payment_keys` with `auth_token`, `order_id`, billing data, and `integration_id` → obtain `payment_key`.
   d. `POST https://accept.paymob.com/api/acceptance/payments/pay` with `payment_key` and encrypted card data → receives immediate transaction response.
7. Paymob also sends a webhook `POST` to `/api/payments/webhook`.
8. System verifies HMAC signature on the webhook payload.
9. HMAC verified + `success: true` → dispatches `booking.paid` event (listeners: LockSlot, CreateOrder, ScheduleReminderJob, LogAudit).
10. `booking.confirmed` event dispatched (listeners: SendConfirmationEmail client + admin, TrackAnalytics).
11. User is shown `/booking/success` with booking details.

**Alternate Flows:**
- A1: Card declined or payment fails → System displays inline error: "Payment was not completed. Your slot has not been reserved." Slot remains available.
- A2: Webhook not received within 5 minutes → Slot remains in `pending` state; BullMQ job releases it after timeout.
- A3: Paymob API unreachable → System displays "Payment service is currently unavailable. Please try again later."
- A4: `payment_key` request fails (invalid billing data) → System returns a 422 with field-level validation errors before card entry.

**Acceptance Criteria:**
- [ ] Payment form is rendered inline on the platform — no redirect to Paymob and no iframe.
- [ ] Booking summary displays correct price in configured currency before card entry.
- [ ] All three Paymob API calls (auth token → order → payment key) succeed before card data is submitted.
- [ ] Card data is transmitted to Paymob using their encrypted card payload format — raw PAN is never stored server-side.
- [ ] Slot status changes to `booked` only after a verified successful Paymob webhook.
- [ ] Confirmation email is sent to client within 60 seconds of successful payment.
- [ ] Confirmation email is sent to admin within 60 seconds of successful payment.
- [ ] Failed payment does not create a confirmed booking record.
- [ ] Pending slots are released after 5-minute timeout if webhook is not received.

---

### P0-F004 — Roadmap Package Booking

**Description:** Client purchases a package of 6 or more sessions. The purchase (Order + Package) is decoupled from the individual scheduled sessions (PackageSession). The client selects only the **first session slot** at checkout; the admin schedules remaining sessions afterward in coordination with the client. Before payment, the client completes an intake form.

**Session Scheduling Design Decision:**
> The client selects the first session slot during checkout. Remaining `N−1` sessions are `PackageSession` records with `status: unscheduled`. The admin creates and assigns slots to these records from the admin dashboard after the package is purchased. This is the simplest V1 model that avoids requiring 6+ simultaneous available slots and allows Youssef to plan the roadmap schedule after reviewing the intake form.

**User Story:** As a developer client, I want to purchase a roadmap package, book my first session immediately, and have Youssef schedule the remaining sessions based on my intake goals.

**Trigger:** User selects "Roadmap Package" after choosing a slot on the calendar.

**Pre-conditions:** User is authenticated. Admin has configured package pricing (`Product` + `Price` rows exist). At least 1 available slot exists.

**Post-conditions:** `Order` created. `Package` created. `IntakeForm` saved. First `PackageSession` assigned to selected slot. Remaining `PackageSession` records created as `unscheduled`. Payment confirmed. Confirmation emails sent.

**Main Flow:**
1. User selects "Roadmap Package."
2. System displays available package tiers (e.g., 6 sessions, 10 sessions) with pricing from `Product`/`Price` tables.
3. User selects a package tier.
4. System renders the intake form: current skill level, primary goal, expected outcomes, preferred timeline.
5. User completes and submits intake form (all fields required).
6. System displays the booking calendar; user selects their first session slot.
7. System displays checkout summary: package tier, total sessions, first session date/time, total price.
8. User proceeds to payment (Paymob direct API flow — same as P0-F003).
9. On verified `booking.confirmed` event:
   - `Order` status → `confirmed`
   - `Package` record created linked to `Order`
   - `IntakeForm` saved linked to `Package`
   - `PackageSession` #1 created with `status: scheduled`, linked to selected slot
   - `PackageSession` #2–N created with `status: unscheduled`, no slot assigned yet
   - Slot for session #1 set to `booked`
   - Reminder job scheduled for session #1
   - Confirmation email sent to client and admin
10. User is shown `/booking/success` with first session details and a note that Youssef will schedule remaining sessions.

**Alternate Flows:**
- A1: Intake form has empty required fields → Inline validation errors; user cannot proceed to slot selection.
- A2: Payment fails → Intake form data retained in session state; user can retry without re-filling.
- A3: Admin has not configured package pricing → Package option hidden from flow.
- A4: Selected slot becomes unavailable during checkout → Error: "This slot was just booked. Please choose another time."

**Acceptance Criteria:**
- [ ] Intake form requires all four fields; form cannot proceed with any field empty.
- [ ] User selects exactly one slot (first session) during checkout; remaining sessions are unscheduled.
- [ ] `Package` record is created separate from `Order`; progress is computed from `PackageSession` statuses, not a stored counter.
- [ ] `N−1` `PackageSession` records are created with `status: unscheduled` immediately after payment confirmation.
- [ ] Package pricing comes from the `Price` table, not per-session multiplication.
- [ ] Custom pricing (if set by admin for this client via `CustomPrice`) overrides default package price.
- [ ] Intake form responses are stored linked to `Package` and visible to admin in the client detail view.
- [ ] Admin can see unscheduled sessions on the admin bookings dashboard and assign slots to them.
- [ ] Client dashboard shows "1 of N sessions scheduled" until admin assigns remaining slots.

---

### P0-F005 — Paymob Payment Integration

**Description:** All payments are processed through Paymob's direct API — no iframe, no hosted checkout redirect. The entire payment UI is rendered inline on the platform. The system supports EGP and USD. Booking confirmation is triggered exclusively by a verified Paymob webhook.

**User Story:** As a developer client, I want to pay for my booking securely by entering my card directly on the platform so that my session is confirmed without leaving the page.

**Trigger:** User clicks "Proceed to Payment" on the booking summary page.

**Pre-conditions:** Paymob merchant account is active. `PAYMOB_API_KEY`, `PAYMOB_INTEGRATION_ID`, and `PAYMOB_HMAC_SECRET` are set in server environment variables. Paymob integration type is **Online Card (API)**, not iframe or hosted.

**Post-conditions:** Payment processed via Paymob API. Webhook received and verified. Booking status updated. Slot locked.

**Paymob API Call Sequence:**

| Step | Call | Endpoint | Purpose |
|------|------|----------|---------|
| 1 | POST | `https://accept.paymob.com/api/auth/tokens` | Exchange `api_key` for a short-lived `auth_token` |
| 2 | POST | `https://accept.paymob.com/api/ecommerce/orders` | Register an order; receive `order_id` and `paymob_order_id` |
| 3 | POST | `https://accept.paymob.com/api/acceptance/payment_keys` | Generate a `payment_key` (token) tied to this order, integration ID, billing data, and amount |
| 4 | POST | `https://accept.paymob.com/api/acceptance/payments/pay` | Submit encrypted card data with `payment_key`; receive immediate transaction response |

**Main Flow:**
1. Server calls Step 1 (auth) → receives `auth_token`.
2. Server calls Step 2 (order) with `auth_token`, `amount_cents` (integer, EGP or USD), and `currency` → receives `order_id`.
3. Server calls Step 3 (payment key) with `auth_token`, `order_id`, `integration_id`, `amount_cents`, `currency`, and billing data (name, email, phone, country) → receives `payment_key`.
4. `payment_key` is returned to the frontend.
5. Frontend renders an inline card form (card number, expiry MM/YY, CVV, cardholder name).
6. On submit, frontend calls Paymob JS SDK or backend proxy to submit card data + `payment_key` to Step 4.
7. Step 4 returns an immediate `success` / `failure` status and transaction object.
8. Paymob also sends a `POST` webhook to `/api/payments/webhook` with the full transaction payload.
9. Server verifies HMAC signature: `HMAC-SHA512(concatenated_fields, PAYMOB_HMAC_SECRET)`.
10. If `success: true` and HMAC verified → booking updated to `confirmed`, slot set to `booked`.
11. If `success: false` and HMAC verified → failure logged; booking remains `pending`; slot released.

**Billing Data Fields (sent in Step 3):**
- `first_name`, `last_name` — from authenticated user profile
- `email` — from authenticated user profile
- `phone_number` — stored on user record (required for Paymob)
- `country` — `EG` (default) or configured per client
- `city`, `street`, `floor`, `apartment`, `building`, `postal_code` — use placeholder values if not collected (`NA`)

**Alternate Flows:**
- A1: Auth token request fails (invalid API key) → Return 500; log error; show "Payment service configuration error."
- A2: Order registration fails → Return 502; slot not locked; show "Unable to initiate payment. Please try again."
- A3: Payment key request fails → Return 502; show "Unable to initiate payment. Please try again."
- A4: Card declined (Step 4 returns `success: false`) → Show inline error from Paymob response message; slot stays available.
- A5: Webhook HMAC mismatch → Reject with 400; log event; no booking update.
- A6: Duplicate webhook → Check `booking.status === confirmed`; ignore silently; return 200.
- A7: `payment_key` expired (10-minute TTL) → Return 422 with message "Payment session expired. Please start over."

**Acceptance Criteria:**
- [ ] No redirect to Paymob and no iframe is used at any point in the payment flow.
- [ ] All four Paymob API calls execute server-side; card data is never stored or logged on our servers.
- [ ] `payment_key` is generated fresh for every payment attempt.
- [ ] HMAC signature is verified on every incoming webhook using `PAYMOB_HMAC_SECRET`.
- [ ] Booking status is updated to `confirmed` only on a verified `success: true` webhook.
- [ ] Duplicate webhooks do not create duplicate bookings or trigger duplicate emails.
- [ ] Payment amount in cents stored in database matches the `amount_cents` sent to Paymob.
- [ ] Both EGP and USD are supported; currency selection is preserved through all four API calls.
- [ ] Failed card submission shows a user-facing error inline; slot remains available for rebooking.
- [ ] All Paymob API calls and webhook events are logged with request/response bodies (excluding raw card data).

---

### P0-F006 — Confirmation Email

**Description:** Upon successful payment, the system sends a booking confirmation email to the client and a notification email to the admin.

**User Story:** As a developer client, I want to receive a confirmation email immediately after booking so that I have a record of my reservation.

**Trigger:** Paymob webhook received with `success: true`.

**Main Flow:**
1. System confirms booking in database.
2. System triggers email job via Resend or Nodemailer.
3. Client email sent: booking date, time, type (single/package), amount paid, session count (if package).
4. Admin email sent: client name, booking date, time, type, amount paid.
5. Both emails delivered within 60 seconds.

**Acceptance Criteria:**
- [ ] Client receives confirmation email within 60 seconds of payment success.
- [ ] Admin receives notification email within 60 seconds of payment success.
- [ ] Confirmation email contains: date, time, session type, amount paid.
- [ ] Email is sent from a verified domain.
- [ ] Failed email delivery is logged and retried once.

---

### P0-F007 — Admin Calendar Management

**Description:** Admin (Youssef) manages slot availability. Slots can be added manually one at a time, generated automatically from a time range, or blocked by full day.

**User Story:** As the admin, I want to control which time slots are available for booking so that clients can only book when I am actually available.

**Trigger:** Admin navigates to `/admin/calendar`.

**Main Flow:**
1. Admin views calendar with current slot statuses.
2. To add a slot manually: admin selects date and time, clicks "Add Slot," slot is saved with status `available`.
3. To generate from time range: admin selects a date, sets start time (e.g., 09:00) and end time (e.g., 18:00), sets interval (e.g., 60 minutes), clicks "Generate." System creates hourly slots for that date.
4. To block a day: admin selects a date, clicks "Block Day." All existing available slots for that day are set to `blocked`; no new slots can be created for that date.

**Alternate Flows:**
- A1: Admin tries to block a day that has a confirmed booking → System warns: "This date has confirmed bookings. Blocking will hide new slots but will not cancel existing bookings."
- A2: Time range generates zero slots (invalid range) → System displays validation error inline.

**Acceptance Criteria:**
- [ ] Admin can add a single slot by selecting date and time.
- [ ] Admin can generate slots from a time range with configurable interval.
- [ ] Admin can block an entire day; blocked days show no available slots to clients.
- [ ] Confirmed bookings are not affected by day-blocking.
- [ ] Admin can delete available (unbooked) slots.
- [ ] Calendar UI reflects changes immediately without page reload.

---

### P0-F008 — Admin Pricing Control

**Description:** Admin sets the default price for single sessions and package tiers. Admin can also assign a custom price to a specific client that overrides the default.

**User Story:** As the admin, I want to control pricing for all session types and set custom prices for specific clients so that I have full flexibility over what each client pays.

**Main Flow:**
1. Admin navigates to `/admin/pricing`.
2. Admin sets single session price (EGP and/or USD).
3. Admin sets package prices per tier (e.g., 6 sessions = 5,000 EGP, 10 sessions = 8,000 EGP).
4. To set custom price: admin opens client record, clicks "Set Custom Price," enters override value, saves.
5. System stores custom price linked to client ID and session type.
6. When that client initiates a booking, system uses custom price instead of default.

**Acceptance Criteria:**
- [ ] Default single session price is configurable from the admin dashboard.
- [ ] Package prices are configurable per tier independently (not calculated by multiplication).
- [ ] Custom price per client overrides default price for that client only.
- [ ] Price changes take effect immediately for all new bookings.
- [ ] Price changes do not affect already-confirmed bookings.
- [ ] Both EGP and USD can be configured independently.

---

### P0-F009 — Admin Meet Link Entry

**Description:** After a booking is confirmed, the admin creates a `Meeting` record for that booking from the admin dashboard. Meeting details are stored in a dedicated `Meeting` entity (not on the `Booking` row), enabling future support for Zoom, Teams, and recording URLs without schema changes.

**User Story:** As the admin, I want to add a Google Meet link to each confirmed booking so that the automated reminder email can include the correct link.

**Main Flow:**
1. Admin navigates to `/admin/bookings`.
2. Admin locates a confirmed `Booking` or `PackageSession` with no `Meeting` record (visually flagged).
3. Admin clicks "Add Meeting Link," enters the join URL, selects provider (`google_meet` / `zoom` / `teams`), clicks "Save."
4. System creates a `Meeting` record: `referenceId = booking.id`, `referenceType = booking`, `provider`, `joinUrl`.
5. `AuditLog` entry written: `meet_link.added`, entityType `Meeting`, actorId = admin.
6. Reminder job worker fetches `Meeting` record by `referenceId` when building the reminder email.

**Alternate Flows:**
- A1: Admin saves an invalid URL → System validates HTTPS URL format; shows inline error; `Meeting` record not created.
- A2: Reminder job fires before `Meeting` record exists → Email sent with fallback: "Your host will share the meeting link shortly."

**Acceptance Criteria:**
- [ ] Admin creates a `Meeting` record (not a field on `Booking`) for any confirmed booking.
- [ ] System validates that `joinUrl` is a valid HTTPS URL before saving.
- [ ] Meeting details are displayed in the booking detail view after saving.
- [ ] Reminder job reads from the `Meeting` table, not from `Booking.meetLink`.
- [ ] Admin can update the `joinUrl` after initial entry; audit log captures the before/after.
- [ ] If no `Meeting` record exists at reminder time, fallback message is sent.

---

### P0-F010 — 30-Minute Reminder Email

**Description:** At the moment a booking is confirmed, a BullMQ delayed job is enqueued with a delay of `(sessionStartTime − 30 minutes − now)`. When the job fires, it sends the client an email with the Google Meet link. There is no polling cron.

**User Story:** As a developer client, I want to receive an email with the meeting link 30 minutes before my session so that I can join without searching for the information.

**Trigger:** `booking.confirmed` event fires → `ScheduleReminderJob` listener enqueues a BullMQ delayed job. Job ID stored in `Booking.reminderJobId`.

**Why delayed jobs instead of polling:**
A polling cron that queries "sessions in the next 25–35 minutes" grows O(N) with booking volume. A delayed job fires exactly once per booking, at the right time, regardless of booking count. It also allows job cancellation when a booking is cancelled — the job is removed by its stored ID.

**Main Flow:**
1. Booking confirmed → `ScheduleReminderJob` listener enqueues BullMQ job with `delay = sessionStartTime − 30min − Date.now()`.
2. `Booking.reminderJobId` is set to the BullMQ job ID.
3. At fire time, worker picks up the job.
4. Worker fetches the booking; checks `reminderSent = false` and `status = confirmed` (guards against stale jobs).
5. Worker fetches associated `Meeting` record for the join URL.
6. Worker sends reminder email: session date/time, join URL (or fallback message if no `Meeting` record exists).
7. Worker sets `Booking.reminderSent = true` and logs a `Notification` record.

**Cancellation Path:**
If a booking is cancelled before the reminder fires, the `booking.cancelled` event listener calls `bullmq.remove(booking.reminderJobId)` to prevent the job from firing.

**Acceptance Criteria:**
- [ ] Reminder job is enqueued immediately when `booking.confirmed` fires — not by a cron.
- [ ] `Booking.reminderJobId` is stored and used for job cancellation.
- [ ] Worker guards against firing on already-cancelled bookings.
- [ ] Reminder email is sent within 2 minutes of the 30-minute threshold (BullMQ precision).
- [ ] Reminder email contains the join URL from the `Meeting` record if present.
- [ ] `reminderSent` flag is set to `true` after dispatch; duplicate sends are impossible.
- [ ] A `Notification` record is written for every reminder attempt (success or failure).
- [ ] Failed reminder delivery is retried once via BullMQ retry config; failure logged.

---

### P1-F001 — Admin Bookings Dashboard

**Description:** Admin views all bookings in a filterable list with key details.

**User Story:** As the admin, I want to see all bookings in one place so that I can track upcoming sessions and manage Meet link entry efficiently.

**Main Flow:**
1. Admin navigates to `/admin/bookings`.
2. System displays paginated list of all bookings sorted by date descending.
3. Each row shows: client name, session type, date/time, payment status, Meet link status.
4. Admin can filter by date range, session type, or payment status.
5. Admin clicks a booking to view full details and add/edit Meet link.

**Acceptance Criteria:**
- [ ] All confirmed and pending bookings are listed.
- [ ] Admin can filter bookings by date range.
- [ ] Admin can filter by session type (Single / Package).
- [ ] Bookings without a Meet link are visually flagged.
- [ ] Pagination handles more than 50 bookings without performance degradation.

---

### P1-F002 — Admin Clients List

**Description:** Admin views all registered clients with their session history and payment totals.

**User Story:** As the admin, I want to see a full list of clients and their booking history so that I can identify repeat clients and review any client's engagement.

**Main Flow:**
1. Admin navigates to `/admin/clients`.
2. System displays list of all clients: name, email, total sessions booked, total amount paid, registration date.
3. Admin clicks a client to view detailed session history and intake form responses (if package client).

**Acceptance Criteria:**
- [ ] All clients who have completed at least one booking appear in the list.
- [ ] Client detail view shows all past and upcoming sessions.
- [ ] Intake form responses are visible in the client detail view for package clients.
- [ ] Total amount paid is calculated correctly from all confirmed bookings.

---

### P1-F003 — Admin Revenue Reports

**Description:** Admin views aggregated financial and usage reports.

**User Story:** As the admin, I want to see monthly revenue and session counts so that I can track business performance over time.

**Main Flow:**
1. Admin navigates to `/admin/reports`.
2. System displays: monthly revenue chart (EGP and USD), total sessions per month, top 5 clients by booking count.
3. Admin can select month range to filter data.

**Acceptance Criteria:**
- [ ] Monthly revenue is calculated from confirmed bookings only.
- [ ] Revenue is displayed separately for EGP and USD.
- [ ] Session count reflects only completed or upcoming confirmed sessions.
- [ ] Top clients list is sorted by booking count descending.
- [ ] Data updates in real time as new bookings are confirmed.

---

### P1-F004 — Client Session Dashboard

**Description:** Authenticated clients view their upcoming and past sessions, and track package progress.

**User Story:** As a developer client, I want to see all my sessions in one place so that I can track my upcoming appointments and review my history.

**Main Flow:**
1. Client navigates to `/dashboard`.
2. System displays upcoming sessions (next sessions sorted by date) and past sessions.
3. For package clients, system displays a progress bar: "X of N sessions completed."

**Acceptance Criteria:**
- [ ] Upcoming sessions are listed in chronological order.
- [ ] Past sessions are listed in reverse chronological order.
- [ ] Package progress bar shows accurate count (e.g., "3 of 6 sessions completed").
- [ ] Each session row shows: date, time, type, and Meet link (if available and within 24 hours of session).

---

### P1-F005 — Intake Form (Package Flow)

**Description:** Before proceeding to checkout for a package, the client completes a structured intake form.

**User Story:** As a developer client, I want to describe my goals and current level before booking a package so that Youssef can prepare a relevant roadmap for me.

**Fields:**
- Current skill level (dropdown: Junior / Mid / Senior)
- Primary goal (text area, required)
- Expected outcomes (text area, required)
- Preferred timeline (dropdown: 1 month / 2 months / 3 months / Flexible)

**Acceptance Criteria:**
- [ ] All four fields are required; form cannot be submitted with any field empty.
- [ ] Selected skill level and timeline values are stored exactly as selected.
- [ ] Intake form data is linked to the package booking record.
- [ ] Admin can read intake form responses in the client detail view.
- [ ] Intake form renders before the checkout step, not after.

---

## Section 8 — Non-Functional Requirements

### Performance
- Page load time (initial): < 2 seconds on a 4G connection
- API response time (booking endpoints): < 500ms under normal load
- Calendar rendering (slot fetch and display): < 1 second
- Paymob redirect initiation: < 1 second from user click

### Security
- All routes except landing page and login require authenticated session
- Admin routes enforce role check (`role: ADMIN`); return 403 for non-admin requests
- All form inputs validated server-side before database write
- Paymob webhooks verified via HMAC signature on every request
- Passwords hashed with bcrypt (minimum 12 rounds)
- All data in transit encrypted via TLS 1.3
- Database at rest encrypted with AES-256
- Environment variables never exposed to client-side code

### Availability
- Target uptime: 99.9% monthly
- Paymob webhook endpoint must remain available 24/7

### Scalability
- Platform must handle up to 500 concurrent users without degradation in v1
- Database queries use indexed fields on `start_time`, `user_id`, `status`

### Accessibility
- WCAG 2.1 Level AA compliance for all public-facing and client-facing pages

### Compatibility
- Supported browsers: Chrome 100+, Safari 15+, Firefox 100+, Edge 100+
- Desktop-first responsive design; mobile browsers supported but not optimized in v1

### Data and Compliance
- User data stored in PostgreSQL with access limited to authenticated sessions
- No user data shared with third parties beyond Paymob (payment processing) and email provider
- Intake form data treated as private and accessible to admin only
- Financial records (`Payment`, `Transaction`) are immutable append-only; no UPDATE or DELETE on these tables
- All other entities use soft deletes (`deletedAt`); hard deletes are never performed in application code

### Audit and Traceability
- Every admin mutation (slot create/block/delete, price change, Meet link add/edit, custom price set) writes an `AuditLog` row
- `AuditLog` stores: actorId, action string, entityType, entityId, before (JSON snapshot), after (JSON snapshot), ipAddress, createdAt
- `AuditLog` is append-only; admin cannot delete audit entries

### Observability
- Structured JSON logging on all API routes
- Error rate monitoring: alert triggered if error rate exceeds 1% over a 5-minute window
- BullMQ job execution logged with success/failure and job ID per run
- Email delivery status logged per message with a corresponding `Notification` record
- Domain event dispatch logged with event name and listener outcomes

---

## Section 9 — Technical Architecture

### Frontend Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** React Server Components + Client Components as needed
- **Calendar UI:** Custom implementation or react-big-calendar / date-fns

### Backend Stack
- **Framework:** Next.js API Routes (App Router Route Handlers)
- **Language:** TypeScript
- **ORM:** Prisma
- **Auth:** NextAuth.js v5 (Google OAuth + Email/Password with Credentials provider)

### Database Architecture
- **Primary Database:** PostgreSQL
- **Cache / Job Queue:** Redis (BullMQ for reminder jobs, webhook retry, job scheduling)

#### Architectural Principles Applied to Schema

| Principle | Decision |
|-----------|----------|
| Soft deletes everywhere | All entities carry `deletedAt TIMESTAMP NULL`; nothing is hard-deleted |
| Immutable financial records | Payment and Transaction rows are append-only; amounts stored in cents as integers |
| Denormalization avoided | Package progress is computed (`COUNT completed sessions`), never stored as a counter |
| Domain separation | Order (purchase intent) is decoupled from Booking/PackageSession (scheduled time) |
| Audit trail from day one | `AuditLog` captures every admin action with before/after JSON |
| Status lifecycle is explicit | Every status transition is defined; no implicit states |
| Extensible role system | `role` field on User uses a string enum; maps to a `permissions` JSON field for V2 RBAC |
| Event-driven side effects | All post-payment actions (email, slot lock, reminder scheduling) are dispatched as domain events, not inline webhook code |

#### Entity Reference

**Users & Auth**
- `User` — id, email, name, phone, role (`USER` | `ADMIN`), permissions (JSON, for V2), deletedAt, createdAt, updatedAt
- *(V2)* `Role`, `Permission`, `UserRole` — RBAC tables; schema slots reserved but not implemented in V1

**Availability (V1 — Slot-based)**
- `Slot` — id, startTime, endTime, durationMinutes, status (`available` | `booked` | `blocked`), deletedAt, createdAt
- *(V2 migration path)* `AvailabilityRule` + `AvailabilityException` replace static slots with dynamic generation (Calendly model); schema change documented for V2 but not implemented

**Orders & Bookings (separated by concern)**
- `Order` — id, userId, type (`single` | `package`), status (`pending` | `paid` | `confirmed` | `completed` | `cancelled` | `refunded` | `no_show`), amountCents (integer), currency (`EGP` | `USD`), deletedAt, createdAt
- `Booking` — id, orderId, slotId, status (mirrors Order status), reminderSent, reminderJobId (BullMQ job ID for cancellation), deletedAt, createdAt
- `Package` — id, orderId, totalSessions, intakeFormId, deletedAt, createdAt
- `PackageSession` — id, packageId, slotId, sessionNumber, status (`scheduled` | `completed` | `cancelled` | `no_show`), deletedAt, createdAt

> **Why PackageSession is separate from Booking:** Each session in a package needs independent state — it can be rescheduled, completed, or marked no-show without affecting the parent package purchase. `Package` represents the purchase; `PackageSession` represents each scheduled occurrence.

**Meetings (decoupled from Booking)**
- `Meeting` — id, referenceId (polymorphic: bookingId or packageSessionId), referenceType (`booking` | `package_session`), provider (`google_meet` | `zoom` | `teams`), joinUrl, hostUrl, recordingUrl (nullable), deletedAt, createdAt

> **Why Meeting is separate:** When Zoom or Teams support is added, or when recording URLs are stored, the Booking row does not need to change. The Meeting entity owns all conferencing metadata.

**Payments & Transactions (append-only financial ledger)**
- `Payment` — id, orderId, paymobOrderId, paymobTransactionId, amountCents (integer), currency, exchangeRate (decimal, stored at time of transaction), baseAmountCents (integer, EGP equivalent for unified reporting), status (`pending` | `paid` | `failed` | `refunded`), createdAt *(no deletedAt — financial records are immutable)*
- `Transaction` — id, paymentId, type (`charge` | `refund`), status, amountCents, paymobResponsePayload (JSON), createdAt *(immutable)*

> **Why store exchangeRate:** USD payments must be recorded with the rate at transaction time. Recalculating from live rates later produces incorrect historical reports.

**Pricing (product-based)**
- `Product` — id, type (`single_session` | `package_6` | `package_10`), name, deletedAt, createdAt
- `Price` — id, productId, amountCents, currency, validFrom, validTo (nullable = currently active), deletedAt, createdAt
- `CustomPrice` — id, userId, productId, amountCents, currency, deletedAt, createdAt

> **Why Product/Price instead of PricingConfig:** Promo codes, seasonal pricing, and bundles all become rows in `Price` with date ranges, not branches in application logic.

**Intake**
- `IntakeForm` — id, userId, packageId, skillLevel, primaryGoal, expectedOutcomes, preferredTimeline, createdAt

**Consultation Outcomes (V1 schema reserved, V2 populated)**
- `ConsultationSession` — id, referenceId (bookingId or packageSessionId), referenceType, notes, homeworkAssigned, status (`pending` | `completed`), createdAt

**Notifications**
- `Notification` — id, userId, type (`confirmation` | `reminder` | `admin_alert`), channel (`email` | `sms` | `push`), status (`pending` | `sent` | `failed`), payload (JSON), scheduledAt, sentAt, retryCount, createdAt

> Emails in V1 are sent directly. This entity exists to give every outbound message a trackable record. In V2, it becomes the queue source.

**Audit**
- `AuditLog` — id, actorId (userId of admin), action (string, e.g. `slot.blocked`, `price.updated`, `meet_link.added`), entityType, entityId, before (JSON), after (JSON), ipAddress, createdAt *(immutable)*

#### Booking Status Lifecycle

```
pending
  └─► paid (payment received, webhook verified)
        └─► confirmed (slot locked, emails sent)
              ├─► completed (session took place)
              ├─► no_show (client did not attend)
              └─► cancelled
                    └─► refunded (V2)
```

Transitions that skip states (e.g., payment fails → back to available slot) are handled by the event system, not inline webhook code.

#### Domain Event Architecture

All post-payment side effects are dispatched as named domain events. No endpoint directly calls email, slot, or notification logic.

| Event | Listeners |
|-------|-----------|
| `booking.paid` | LockSlot, CreateConfirmedOrder, ScheduleReminderJob, LogAudit |
| `booking.confirmed` | SendConfirmationEmail (client), SendConfirmationEmail (admin), TrackAnalytics |
| `reminder.due` | SendReminderEmail (client) |
| `booking.cancelled` | ReleaseSlot, CancelReminderJob, LogAudit |
| `admin.action` | WriteAuditLog |

Events are dispatched via a lightweight in-process event bus in V1 (e.g., Node.js `EventEmitter` abstraction). In V2, this becomes a proper queue (BullMQ events or a message broker).

#### Reminder Scheduling Design

Reminders are **not** triggered by a polling cron. At the moment a booking is confirmed, a BullMQ delayed job is enqueued with a delay of `(sessionStartTime − 30 minutes − now)`. The job ID is stored in `Booking.reminderJobId`. If the booking is cancelled, the job is removed by ID before it fires.

This scales to any number of bookings without the cron query growing proportionally.

### Auth and Authorization Design
- NextAuth.js handles session management with JWT strategy
- Session includes `userId`, `role` (`USER` | `ADMIN`), and `permissions` (JSON, empty in V1)
- Middleware in `middleware.ts` protects `/admin/*` routes; returns 403 for non-admin
- API routes check `session.user.role === 'ADMIN'` before admin operations
- `permissions` field is reserved for V2 RBAC (assistant, accountant, support roles) — schema carries it from day one so adding new roles requires no migration

### Infrastructure and Deployment
- **Hosting:** VPS (Ubuntu 22.04 LTS) — managed by Youssef; Nginx as reverse proxy
- **Process Management:** PM2 (Next.js server process + BullMQ worker process) or Docker Compose
- **CI/CD:** GitHub Actions — lint, type-check, build, and SSH deploy on push to `main`
- **Job Queue:** BullMQ + Redis — repeatable jobs for reminder scheduling, webhook retry
- **Email Provider:** Resend (recommended) or Nodemailer with SMTP
- **Environment Management:** `.env` file on VPS (not committed to repo); injected via GitHub Actions secrets on deploy
- **SSL:** Let's Encrypt via Certbot on Nginx

### External Integrations
- **Paymob:** Direct API integration (4-step flow: auth token → order → payment key → card pay); webhook listener at `POST /api/payments/webhook`; no iframe, no hosted redirect
- **Resend / SMTP:** Transactional email delivery for confirmation and reminder emails
- **Google OAuth:** Authentication provider via NextAuth.js

---

## Section 10 — Implementation Phases

### Phase 1 — Foundation (Weeks 1–2)

**Goal:** Authentication, database schema, admin calendar management, and pricing control operational.

**Tasks:**
- [ ] Initialize Next.js 14 project with TypeScript and Tailwind CSS
- [ ] Set up PostgreSQL database and configure Prisma
- [ ] Define and migrate full database schema (all entities)
- [ ] Implement NextAuth.js with Google OAuth and Email/Password providers
- [ ] Build admin role enforcement middleware
- [ ] Build admin calendar management UI: manual slot add, time-range generation, day blocking
- [ ] Build admin pricing configuration UI: session price, package prices
- [ ] Build landing page with "Book a Consultation" CTA
- [ ] Provision VPS, configure Nginx reverse proxy, and set up SSL with Let's Encrypt
- [ ] Deploy to VPS staging environment using PM2 or Docker Compose
- [ ] Set up `.env` with all external service credentials on staging VPS

**Validation:** Admin can log in, add/block calendar slots, and set pricing. VPS staging environment accessible over HTTPS.

---

### Phase 2 — Core Booking and Payment (Weeks 3–4)

**Goal:** Client booking flow end-to-end: calendar view, session selection, intake form, Paymob payment, confirmation emails.

**Tasks:**
- [ ] Build client-facing booking calendar (available slots only)
- [ ] Build single session booking flow: slot selection → summary → Paymob redirect
- [ ] Build intake form UI and validation for package booking
- [ ] Build roadmap package booking flow: slot selection → intake form → summary → Paymob redirect
- [ ] Integrate Paymob API: 4-step direct API flow (auth token → order → payment key → card pay)
- [ ] Build inline card payment form (no redirect, no iframe)
- [ ] Implement Paymob webhook listener at `/api/payments/webhook` with HMAC verification
- [ ] Implement booking confirmation logic (status update on webhook)
- [ ] Implement confirmation email (client + admin) via Resend/Nodemailer
- [ ] Build `/booking/success` and `/booking/failed` pages

**Validation:** Client can complete a full booking with payment; confirmation emails received by both client and admin.

---

### Phase 3 — Admin Dashboard and Client Dashboard (Weeks 5–6)

**Goal:** Full admin visibility into bookings, clients, and payments. Client session management. Reminder system active.

**Tasks:**
- [ ] Build admin bookings list with filters (date range, type, payment status)
- [ ] Build booking detail view with Meet link entry field
- [ ] Build admin clients list with session history and intake form view
- [ ] Implement admin custom pricing per client
- [ ] Build client session dashboard (upcoming + past sessions + package progress)
- [ ] Implement 30-minute reminder email using BullMQ repeatable job on VPS worker
- [ ] Add `reminderSent` flag update after email dispatch
- [ ] Test reminder email with real booking on staging

**Validation:** Admin can view all bookings, add Meet links, and view client details. Reminder emails are delivered 30 minutes before sessions.

---

### Phase 4 — Reports, Hardening, and Launch (Weeks 7–8)

**Goal:** Revenue reports operational. Full QA pass. Production deployment.

**Tasks:**
- [ ] Build admin reports page: monthly revenue, session count, top clients
- [ ] Implement EGP and USD revenue separation in reports
- [ ] Full end-to-end QA: booking flow, payment, emails, reminders, admin operations
- [ ] Security audit: verify all routes protected, webhook HMAC, input validation
- [ ] Performance testing: verify page load < 2s, API < 500ms
- [ ] Set up structured logging and error rate monitoring
- [ ] Configure production environment variables
- [ ] Deploy to production
- [ ] Smoke test all critical flows in production

**Validation:** All 17 PRD sections verified against live production. Zero WhatsApp messages required for any booking operation.

---

## Section 11 — User Flows and Edge Cases

### User Flow — Client Booking (Single Session)
1. Client opens landing page at `/`
2. Client clicks "Book a Consultation"
3. System redirects to `/login`
4. Client authenticates with Google or Email
5. System redirects to `/book` (calendar view)
6. Client views available slots on calendar
7. Client clicks an available slot
8. System prompts: "Single Session" or "Roadmap Package"
9. Client selects "Single Session"
10. System displays booking summary with price in selected currency
11. Client clicks "Proceed to Payment"
12. System runs Paymob 3-step server-side flow (auth → order → payment key) and returns `payment_key` to frontend
13. Client sees inline card form; enters card number, expiry, CVV, and cardholder name
14. Client submits card form; system calls Paymob card pay endpoint with encrypted card data + `payment_key`
15. Paymob also sends webhook to `/api/payments/webhook`
16. System verifies webhook HMAC → dispatches `booking.paid` then `booking.confirmed` domain events
17. Event listeners: slot locked, `Order` confirmed, reminder job enqueued, emails sent
18. Client is shown `/booking/success` inline (no external redirect)
19. At `sessionStartTime − 30min`, BullMQ delayed job fires → client receives reminder email with join URL from `Meeting` record

### User Flow — Client Booking (Roadmap Package)
1. Steps 1–8 same as single session
2. Client selects "Roadmap Package"
3. System displays available package tiers with pricing
4. Client selects a tier (e.g., 6 sessions)
5. System renders intake form
6. Client fills in: skill level, primary goal, expected outcomes, preferred timeline
7. Client submits intake form (all fields validated)
8. System displays checkout summary: package tier, total sessions, total price
9. Client clicks "Proceed to Payment"
10. Steps 12–19 same as single session (inline card form, Paymob direct API); package record created with 0/N progress

### User Flow — Admin Daily Operations
1. Admin navigates to `/admin/login`
2. Admin authenticates
3. Admin lands on dashboard overview: today's bookings, month-to-date revenue
4. Admin navigates to `/admin/calendar` to add or block slots for upcoming days
5. Admin navigates to `/admin/bookings` to view confirmed bookings
6. Admin identifies bookings missing a Meet link (visually flagged)
7. Admin clicks booking, adds Google Meet URL, saves
8. Admin navigates to `/admin/reports` to review monthly performance
9. Admin navigates to `/admin/pricing` to adjust rates if needed

### Edge Cases

| Condition | System Behavior | User Feedback |
|-----------|-----------------|---------------|
| Slot booked by another user during checkout | Webhook rejects second booking; slot marked `booked` | "This slot was just booked. Please choose another time." |
| Invalid intake form submission | Server-side validation rejects request | Inline error messages per field; form not submitted |
| Paymob webhook HMAC mismatch | Request rejected with 400; event logged | No action triggered; no booking confirmed |
| Reminder cron runs before Meet link added | Email sent without Meet link | "Your host will share the meeting link shortly." |
| Network failure during payment redirect | Client remains on summary page | "Unable to connect to payment service. Please try again." |
| Client tries to access `/admin` | Middleware intercepts; returns 403 | Redirect to `/` with no error message |
| Duplicate Paymob webhook received | System checks `booking.status === confirmed`; ignores duplicate | No action; duplicate silently discarded |
| Empty booking calendar | No slots fetched | "No sessions available at this time. Check back soon." |
| Custom price not configured for client | System uses default pricing | No visible difference to client |
| Admin enters invalid URL for Meet link | URL format validation fails | Inline error: "Please enter a valid HTTPS URL." |

### API Design (High Level)

| Method | Endpoint                          | Description                              |
|--------|-----------------------------------|------------------------------------------|
| POST   | /api/auth/[...nextauth]           | NextAuth.js authentication handler       |
| GET    | /api/slots                        | Fetch all available slots (client view)  |
| POST   | /api/admin/slots                  | Create slot (admin only)                 |
| DELETE | /api/admin/slots/:id              | Delete available slot (admin only)       |
| POST   | /api/admin/slots/block-day        | Block entire day (admin only)            |
| POST   | /api/bookings                     | Create booking and initiate payment      |
| GET    | /api/bookings/my                  | Get current user's bookings              |
| POST   | /api/payments/webhook             | Paymob webhook receiver                  |
| GET    | /api/admin/bookings               | Get all bookings (admin only)            |
| PUT    | /api/admin/bookings/:id/meet-link | Add Meet link to booking (admin only)    |
| GET    | /api/admin/clients                | Get all clients (admin only)             |
| GET    | /api/admin/clients/:id            | Get client details (admin only)          |
| GET    | /api/admin/reports                | Get revenue and session reports          |
| GET    | /api/admin/pricing                | Get current pricing config               |
| PUT    | /api/admin/pricing                | Update pricing config                    |
| POST   | /api/admin/pricing/custom         | Set custom price for a client            |

### UX Rules
- All form fields validate on blur and on submit; errors displayed inline below the field
- Loading spinners shown on all async actions (booking submit, payment redirect, admin save)
- Success feedback shown after every admin save action (toast notification)
- Error states show actionable messages, not generic "something went wrong"
- All destructive actions (block day, delete slot) require a confirmation prompt
- Booking calendar refreshes automatically after slot selection to prevent stale data

---

## Section 12 — Success Metrics and KPIs

| Category   | Metric                          | Target                     | Measurement Method                     | Owner   |
|------------|---------------------------------|----------------------------|-----------------------------------------|---------|
| Business   | Monthly booking revenue         | > 0 in week 1 post-launch  | Sum of confirmed payments in reports    | Youssef |
| Business   | WhatsApp messages for bookings  | = 0 within 30 days         | Manual tracking by Youssef              | Youssef |
| Product    | Booking completion rate         | > 70% of started sessions  | (Confirmed bookings / Initiated) × 100  | PM      |
| Product    | Intake form completion rate     | > 90% of package flows     | (Submitted forms / Package starts) × 100 | PM    |
| Product    | Reminder email delivery rate    | > 99%                      | Email provider delivery logs            | Dev     |
| Technical  | API response time               | < 500ms (p95)              | Server-side response time logging       | Dev     |
| Technical  | Page load time                  | < 2s (4G)                  | Lighthouse CI in GitHub Actions         | Dev     |
| Technical  | Webhook processing error rate   | < 0.1%                     | Webhook endpoint error logs             | Dev     |
| Technical  | Platform uptime                 | > 99.9% monthly            | VPS uptime monitoring (e.g., UptimeRobot) | Dev   |
| Satisfaction | First booking time-to-complete | < 5 minutes                | Session duration from login to success page | PM |

**Tracking Tool:** PostHog (product analytics) + structured server logs on VPS (via PM2 log rotation or Docker logging driver)
**Review Frequency:** Weekly for first month post-launch; monthly thereafter
**Review Owner:** Youssef

---

## Section 13 — Timeline and Milestones

- **Start Date:** 2026-06-05
- **Target Launch Date:** 2026-07-31
- **Total Duration:** 8 weeks

| Milestone             | Description                                              | Due Date   | Status  | Owner   |
|-----------------------|----------------------------------------------------------|------------|---------|---------|
| Kickoff               | Project setup, repo initialized, environments configured | 2026-06-05 | TODO    | Youssef |
| PRD Approved          | PRD v1.0 reviewed and signed off                         | 2026-06-06 | TODO    | Youssef |
| Phase 1 Done          | Auth, schema, admin calendar, and pricing operational    | 2026-06-19 | TODO    | Dev     |
| Phase 2 Done          | Full booking flow with Paymob and emails working         | 2026-07-03 | TODO    | Dev     |
| Phase 3 Done          | Admin dashboard, client dashboard, reminders active      | 2026-07-17 | TODO    | Dev     |
| Phase 4 Done          | Reports, full QA, security audit complete                | 2026-07-28 | TODO    | Dev     |
| Beta Launch           | Staging tested with real Paymob sandbox credentials      | 2026-07-29 | TODO    | Youssef |
| Public Launch         | Production deployment; first real booking accepted       | 2026-07-31 | TODO    | Youssef |

---

## Section 14 — Risk Register

| ID  | Description                                       | Likelihood | Impact | Score | Mitigation                                                                 | Owner   |
|-----|---------------------------------------------------|------------|--------|-------|----------------------------------------------------------------------------|---------|
| R01 | Paymob onboarding delayed before launch           | Medium     | High   | 6     | Begin Paymob merchant application on day 1; use sandbox for testing        | Youssef |
| R02 | Paymob webhook reliability issues                 | Low        | High   | 3     | Implement pending-state timeout and retry logic; log all webhook events    | Dev     |
| R03 | Scope creep adding v2 features to v1              | High       | Medium | 6     | Enforce MoSCoW strictly; no P3 features implemented without PRD change     | Youssef |
| R04 | Cron job missing reminder window                  | Medium     | Medium | 4     | Set 5-minute cron interval with 25–35-minute query window; log every run   | Dev     |
| R05 | Admin forgets to add Meet link before reminder    | High       | Medium | 6     | Dashboard flags bookings missing Meet link; fallback message in email      | Youssef |
| R06 | Email delivery failures (Resend/SMTP)             | Low        | High   | 3     | Implement retry logic; log delivery status; monitor bounce rate            | Dev     |
| R07 | Key developer unavailability mid-project          | Low        | High   | 3     | Document all architecture decisions; code reviewed and commented           | Dev     |
| R08 | Concurrent booking conflicts on same slot         | Medium     | High   | 6     | Database-level unique constraint on `booked` slots; optimistic locking     | Dev     |

*Score = Likelihood × Impact (High=3, Medium=2, Low=1)*

---

## Section 15 — Stakeholders and Approvals

### Stakeholders

| Name    | Role                       | Involvement                                               | Contact |
|---------|----------------------------|-----------------------------------------------------------|---------|
| Youssef | Product Owner / Admin User | Final decision authority; approves all scope changes      | [TBD]   |
| Dev     | Full Stack Developer        | Implements all features; responsible for technical design | [TBD]   |
| QA      | Quality Assurance           | Tests all flows against acceptance criteria               | [TBD]   |

### Approval Gates

| Gate                   | Approver | Required By | Status  |
|------------------------|----------|-------------|---------|
| PRD v1.0 Approval      | Youssef  | 2026-06-06  | Pending |
| Phase 1 Sign-off       | Youssef  | 2026-06-19  | Pending |
| Phase 2 Sign-off       | Youssef  | 2026-07-03  | Pending |
| Phase 3 Sign-off       | Youssef  | 2026-07-17  | Pending |
| Beta Launch Approval   | Youssef  | 2026-07-29  | Pending |
| Production Go/No-Go    | Youssef  | 2026-07-31  | Pending |

---

## Section 16 — References and Links

| Resource               | Link / Location         |
|------------------------|-------------------------|
| Design Files           | [TBD]                   |
| Repository             | [TBD]                   |
| API Documentation      | [TBD]                   |
| Architecture Diagram   | [TBD]                   |
| Staging Environment    | [TBD]                   |
| Production Environment | [TBD]                   |
| CI/CD Pipeline         | [TBD]                   |
| Monitoring Dashboard   | [TBD]                   |
| Related PRDs           | None (v1 — initial PRD) |
| Slack Channel          | [TBD]                   |
| Meeting Notes          | [TBD]                   |
| Paymob Documentation   | https://docs.paymob.com |
| NextAuth.js Docs       | https://authjs.dev      |
| Prisma Docs            | https://prisma.io/docs  |
| Resend Docs            | https://resend.com/docs |

---

## Section 17 — Revision History

| Version | Date       | Author  | Changes                                                                                              |
|---------|------------|---------|------------------------------------------------------------------------------------------------------|
| v1.0    | 2026-06-05 | Youssef | Initial PRD created                                                                                  |
| v1.1    | 2026-06-05 | Youssef | Replaced Vercel hosting with VPS (Nginx + PM2); replaced Vercel Cron with BullMQ; rewrote Paymob integration to use direct 4-step API (no iframe, no hosted redirect) |
| v1.2    | 2026-06-05 | Youssef | Architecture hardening: redesigned DB schema (Order/PackageSession separation, Meeting entity, Product/Price pricing, immutable Payment/Transaction, AuditLog, soft deletes); added domain event system; replaced polling cron with BullMQ delayed jobs; clarified package session scheduling flow; expanded booking status lifecycle; added RBAC skeleton and permissions field |
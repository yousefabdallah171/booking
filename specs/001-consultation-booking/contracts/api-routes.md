# API Routes Contract: Consultation Booking Platform

**Feature**: 001-consultation-booking
**Date**: 2026-06-05

These are the special HTTP routes that handle third-party callbacks and scheduled jobs.
They live in the **backend** (`backend/src/routes/`) and are registered in `backend/src/app.ts`.

All standard business routes (slots, bookings, packages, pricing, clients, reports)
are documented in [rest-api.md](rest-api.md).

---

## Authentication Architecture

**Frontend** (`frontend/src/app/api/auth/[...nextauth]/route.ts`):
- Handled entirely by NextAuth.js v5.
- Providers: `GoogleProvider` (CLIENT sign-in) + `CredentialsProvider` (ADMIN + email/password).
- Session strategy: JWT (signed with `AUTH_SECRET`).
- The `jwt` callback adds `user.role` to the token; `session` callback exposes `session.user.role`.

**Backend** (`backend/src/middleware/auth.middleware.ts`):
- Reads `Authorization: Bearer <jwt>` header on every protected route.
- Verifies the JWT using the same `AUTH_SECRET` (shared secret).
- Attaches `req.user = { id: string, role: "ADMIN" | "CLIENT" }`.
- Returns HTTP 401 if token is missing or invalid.

---

## Webhook Routes (`backend/src/routes/webhooks.routes.ts`)

### `POST /api/webhooks/paymob` — [PUBLIC]

Receives payment status callbacks from Paymob.

**Request**:
```json
{
  "obj": {
    "id": 123456789,
    "order": { "id": 987654321 },
    "amount_cents": 150000,
    "currency": "EGP",
    "success": true
  },
  "hmac": "abc123..."
}
```

**Processing order** (strictly enforced):
1. Parse raw body as JSON
2. Verify HMAC — compute SHA-512 HMAC using `PAYMOB_HMAC_SECRET`; reject HTTP 400 on mismatch
3. Look up `PaymentRecord` by `paymobOrderId = obj.order.id`
4. **Idempotency check**: if status is already `SUCCESS` or `FAILED`, return HTTP 200 immediately
5. If `obj.success === true`:
   - `PaymentRecord.status = SUCCESS`; store `rawWebhook`
   - Transition `Booking.status = CONFIRMED`; `Slot.status = BOOKED` (single session)
   - OR confirm `Package` (package payment)
   - Send confirmation email via `email.service.ts`
6. If `obj.success === false`:
   - `PaymentRecord.status = FAILED`; store `rawWebhook`
   - `Booking.status = FAILED`; `Slot.status = AVAILABLE`

**Responses**:
- `200 OK` — processed (or already processed idempotently)
- `400 Bad Request` — HMAC mismatch or malformed payload
- `500 Internal Server Error` — unexpected error (Paymob will retry)

**Security**: No session required. HMAC verification is the sole security mechanism.
Raw body must be read before JSON parsing to verify HMAC correctly.

---

## Cron Routes (`backend/src/routes/cron.routes.ts`)

All cron routes require `Authorization: Bearer {CRON_SECRET}` header.
Missing or invalid secret → HTTP 401.

Triggered by system crontab on VPS:
```
*/5 * * * * curl -s -H "Authorization: Bearer $CRON_SECRET" http://localhost:4000/api/cron/release-pending
* * * * *   curl -s -H "Authorization: Bearer $CRON_SECRET" http://localhost:4000/api/cron/send-reminders
```

### `GET /api/cron/release-pending`

**Processing**:
1. Verify `CRON_SECRET` header
2. Call `cron.service.ts#releasePendingBookings()`
3. Query: `Booking` where `status = PENDING` AND `createdAt < now - 5 minutes`
4. For each: `status = FAILED`; linked `Slot.status = AVAILABLE`

**Response**:
```json
{ "released": 3 }
```

---

### `GET /api/cron/send-reminders`

**Processing**:
1. Verify `CRON_SECRET` header
2. Call `cron.service.ts#sendDueReminders()`
3. Query: `Booking` where `status = CONFIRMED` AND `reminderSent = false`
   AND `slot.startTime` between `now + 29min` and `now + 31min`
4. For each:
   - Send reminder email via `email.service.ts#sendReminderEmail()`
   - `Booking.reminderSent = true`
   - If `meetLink` is null → send with "Meeting link will be shared soon" placeholder

**Response**:
```json
{ "sent": 2 }
```

---

## Frontend Middleware (`frontend/src/middleware.ts`)

**Runtime**: Edge (Next.js middleware)

Evaluates every request before it reaches any page or API route.

| Path Pattern | Rule |
|---|---|
| `/` | Public — landing page |
| `/login` | Public — auth page |
| `/api/auth/**` | Public — NextAuth handles auth |
| `/admin/**` | Requires session with `role === ADMIN`; non-admin → HTTP 403; unauthenticated → redirect `/login` |
| `/**` (all others) | Requires any authenticated session; unauthenticated → redirect `/login` |

**Implementation**:
```typescript
// frontend/src/middleware.ts
import { auth } from "@/lib/auth"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  const publicPaths = ["/", "/login", "/api/auth"]
  if (publicPaths.some(p => pathname.startsWith(p))) return

  if (pathname.startsWith("/admin")) {
    if (!session) return Response.redirect(new URL("/login", req.url))
    if (session.user.role !== "ADMIN") return new Response("Forbidden", { status: 403 })
    return
  }

  if (!session) return Response.redirect(new URL("/login", req.url))
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
```

---

## Backend Express App Setup (`backend/src/app.ts`)

```typescript
import express from "express"
import cors from "cors"
import slotsRouter from "./routes/slots.routes"
import bookingsRouter from "./routes/bookings.routes"
import packagesRouter from "./routes/packages.routes"
import pricingRouter from "./routes/pricing.routes"
import clientsRouter from "./routes/clients.routes"
import reportsRouter from "./routes/reports.routes"
import webhooksRouter from "./routes/webhooks.routes"
import cronRouter from "./routes/cron.routes"

const app = express()

app.use(cors({ origin: process.env.FRONTEND_URL }))
app.use(express.json())

app.use("/api/slots",     slotsRouter)
app.use("/api/bookings",  bookingsRouter)
app.use("/api/packages",  packagesRouter)
app.use("/api/pricing",   pricingRouter)
app.use("/api/clients",   clientsRouter)
app.use("/api/reports",   reportsRouter)
app.use("/api/webhooks",  webhooksRouter)
app.use("/api/cron",      cronRouter)

export default app
```

---

## Cron Schedule (VPS System Crontab)

File: `backend/cron/crontab.example`

```cron
# Install on VPS: crontab cron/crontab.example
# Requires CRON_SECRET env var to be set in the shell environment

# Release pending bookings older than 5 minutes (every 5 min)
*/5 * * * * curl -s -H "Authorization: Bearer $CRON_SECRET" http://localhost:4000/api/cron/release-pending >> /var/log/cron.log 2>&1

# Send 30-minute session reminders (every 1 min)
* * * * * curl -s -H "Authorization: Bearer $CRON_SECRET" http://localhost:4000/api/cron/send-reminders >> /var/log/cron.log 2>&1
```

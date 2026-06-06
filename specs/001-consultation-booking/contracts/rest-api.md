# REST API Contract: Consultation Booking Platform

**Feature**: 001-consultation-booking
**Date**: 2026-06-05
**Base URL**: `http://backend:4000` (Docker internal) / `https://api.yourdomain.com` (prod)

All endpoints:
1. Accept and return `application/json`
2. Validate request bodies with Zod schemas before any DB call
3. Use `authMiddleware` to verify the NextAuth JWT in `Authorization: Bearer <jwt>`
4. Return typed JSON responses — never throw unhandled errors to the client

---

## Common Response Shapes

```typescript
// Success
{ success: true, data: T }

// Validation error
{ success: false, error: "Validation failed", fieldErrors: Record<string, string[]> }

// Auth error
{ success: false, error: "Unauthorized" }   // HTTP 401
{ success: false, error: "Forbidden" }       // HTTP 403

// Business logic error
{ success: false, error: string, code?: string }

// Not found
{ success: false, error: "Not found" }       // HTTP 404
```

---

## Authentication

All routes require `Authorization: Bearer <nextauth-jwt>` unless marked **[PUBLIC]**.
The backend verifies the JWT with the shared `AUTH_SECRET` and attaches
`req.user = { id: string, role: "ADMIN" | "CLIENT" }`.

Routes marked **[ADMIN]** additionally require `req.user.role === "ADMIN"`.

---

## Slots

### `GET /api/slots` — Get available slots for a date

**Auth**: Any authenticated user

**Query params**:
```
date: string   // "YYYY-MM-DD"
```

**Response 200**:
```json
{
  "success": true,
  "data": {
    "slots": [
      { "id": "...", "startTime": "2026-06-10T09:00:00Z", "endTime": "2026-06-10T10:00:00Z" }
    ]
  }
}
```

- Returns only `AVAILABLE` slots
- Excludes slots on `BlockedDay` dates

---

### `GET /api/slots/admin` — [ADMIN] Get all slots for a date (all statuses)

**Auth**: ADMIN

**Query params**: `date: string`

**Response 200**:
```json
{
  "success": true,
  "data": {
    "slots": [
      { "id": "...", "startTime": "...", "endTime": "...", "status": "AVAILABLE" }
    ]
  }
}
```

---

### `POST /api/slots` — [ADMIN] Create a single slot

**Auth**: ADMIN

**Body**:
```json
{ "startTime": "2026-06-10T09:00:00Z" }
```

**Response 201**:
```json
{
  "success": true,
  "data": { "slot": { "id": "...", "startTime": "...", "endTime": "...", "status": "AVAILABLE" } }
}
```

**Error codes**: `SLOT_OVERLAP`, `SLOT_IN_PAST`, `DAY_BLOCKED`

---

### `POST /api/slots/generate` — [ADMIN] Bulk generate slots from a time range

**Auth**: ADMIN

**Body**:
```json
{
  "date": "2026-06-10",
  "startTime": "09:00",
  "endTime": "18:00",
  "intervalMinutes": 60
}
```

**Response 200**:
```json
{
  "success": true,
  "data": { "created": 9, "skipped": 0 }
}
```

- Skips overlapping slots silently
- Skips slots on blocked days

---

### `DELETE /api/slots/:id` — [ADMIN] Delete a slot

**Auth**: ADMIN

**Response 200**: `{ "success": true }`

**Error codes**: `HAS_CONFIRMED_BOOKING` (HTTP 409)

---

### `POST /api/slots/block-day` — [ADMIN] Block a full day

**Auth**: ADMIN

**Body**:
```json
{ "date": "2026-06-15", "reason": "Holiday" }
```

**Response 201**:
```json
{
  "success": true,
  "data": { "blockedDay": { "id": "...", "date": "2026-06-15", "reason": "Holiday" } }
}
```

---

### `DELETE /api/slots/block-day/:date` — [ADMIN] Unblock a day

**Auth**: ADMIN

**Response 200**: `{ "success": true }`

---

## Bookings

### `POST /api/bookings/single` — Create a single-session booking

**Auth**: CLIENT

**Body**:
```json
{ "slotId": "..." }
```

**Response 201**:
```json
{
  "success": true,
  "data": {
    "bookingId": "...",
    "paymobRedirectUrl": "https://accept.paymob.com/api/acceptance/iframes/..."
  }
}
```

**Processing**:
1. Re-validate slot is `AVAILABLE`
2. Create `Booking` with `status: PENDING`
3. Create `PaymentRecord` with `status: PENDING`
4. Run Paymob 3-step flow → return redirect URL
5. On Paymob failure: rollback, return `PAYMENT_INIT_FAILED`

**Error codes**: `SLOT_UNAVAILABLE`, `PAYMENT_INIT_FAILED`

---

### `POST /api/bookings/package-session` — Book a slot from an active package

**Auth**: CLIENT

**Body**:
```json
{ "slotId": "...", "packageId": "..." }
```

**Response 201**:
```json
{
  "success": true,
  "data": { "bookingId": "..." }
}
```

- Creates `Booking` with `status: CONFIRMED` directly (no payment)
- Increments `Package.sessionsUsed`; marks COMPLETED if exhausted

**Error codes**: `SLOT_UNAVAILABLE`, `PACKAGE_EXHAUSTED`, `PACKAGE_NOT_ACTIVE`

---

### `GET /api/bookings/my` — Get client's upcoming bookings + active package

**Auth**: CLIENT

**Response 200**:
```json
{
  "success": true,
  "data": {
    "upcomingBookings": [
      {
        "id": "...",
        "slotStartTime": "...",
        "slotEndTime": "...",
        "type": "SINGLE",
        "meetLink": null
      }
    ],
    "activePackage": {
      "id": "...",
      "tierName": "6-Session Package",
      "totalSessions": 6,
      "sessionsUsed": 2,
      "sessionsRemaining": 4
    }
  }
}
```

- Only returns `CONFIRMED` bookings with `startTime > now`

---

### `GET /api/bookings/admin` — [ADMIN] Get all bookings with filters

**Auth**: ADMIN

**Query params** (all optional):
```
status?: "PENDING" | "CONFIRMED" | "FAILED"
type?: "SINGLE" | "PACKAGE"
clientId?: string
month?: string   // "YYYY-MM"
```

**Response 200**:
```json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "id": "...",
        "clientName": "...",
        "clientEmail": "...",
        "slotStartTime": "...",
        "slotEndTime": "...",
        "type": "SINGLE",
        "status": "CONFIRMED",
        "amountEgp": 1500,
        "meetLink": null
      }
    ]
  }
}
```

---

### `PATCH /api/bookings/:id/meet-link` — [ADMIN] Set Google Meet URL

**Auth**: ADMIN

**Body**:
```json
{ "meetLink": "https://meet.google.com/abc-defg-hij" }
```

**Response 200**:
```json
{
  "success": true,
  "data": { "booking": { "id": "...", "meetLink": "https://meet.google.com/abc-defg-hij" } }
}
```

- Booking must have `status: CONFIRMED`
- `meetLink` must be a valid URL

---

## Packages

### `GET /api/packages/tiers` — Get active package tiers

**Auth**: Any authenticated user

**Response 200**:
```json
{
  "success": true,
  "data": {
    "tiers": [
      { "id": "...", "name": "6-Session Package", "sessions": 6, "priceEgp": 9000 }
    ]
  }
}
```

---

### `POST /api/packages` — Create a package booking

**Auth**: CLIENT

**Body**:
```json
{
  "tierId": "...",
  "intakeForm": {
    "skillLevel": "Intermediate",
    "primaryGoal": "Get a job as a senior dev",
    "expectedOutcomes": "Portfolio project + resume",
    "preferredTimeline": "3 months"
  }
}
```

**Response 201**:
```json
{
  "success": true,
  "data": {
    "packageId": "...",
    "paymobRedirectUrl": "https://accept.paymob.com/..."
  }
}
```

**Processing**:
1. Verify tier is active
2. Create `Package` (`status: ACTIVE`, `sessionsUsed: 0`)
3. Create `IntakeForm`
4. Create `PaymentRecord`
5. Run Paymob flow → return redirect URL
6. On Paymob failure: rollback package + intake form

---

## Pricing

### `GET /api/pricing` — [ADMIN] Get current pricing

**Auth**: ADMIN

**Response 200**:
```json
{
  "success": true,
  "data": {
    "defaultPriceEgp": 1500,
    "tiers": [
      { "id": "...", "name": "6-Session Package", "sessions": 6, "priceEgp": 9000 }
    ]
  }
}
```

---

### `PUT /api/pricing/default` — [ADMIN] Set default single-session price

**Auth**: ADMIN

**Body**: `{ "amountEgp": 1500 }`

**Response 200**:
```json
{ "success": true, "data": { "newPrice": 1500 } }
```

- Upserts `SystemConfig` key `SINGLE_SESSION_PRICE_EGP`

---

### `PUT /api/pricing/tier/:tierId` — [ADMIN] Set package tier price

**Auth**: ADMIN

**Body**: `{ "priceEgp": 9000 }`

**Response 200**:
```json
{ "success": true, "data": { "tier": { "id": "...", "name": "...", "priceEgp": 9000 } } }
```

---

### `PUT /api/pricing/client/:clientId` — [ADMIN] Set client custom price

**Auth**: ADMIN

**Body**: `{ "amountEgp": 1200 }` or `{ "amountEgp": null }` (removes override)

**Response 200**: `{ "success": true }`

---

## Clients (Admin)

### `GET /api/clients` — [ADMIN] List all clients

**Auth**: ADMIN

**Response 200**:
```json
{
  "success": true,
  "data": {
    "clients": [
      { "id": "...", "name": "...", "email": "...", "bookingCount": 3, "activePackage": true }
    ]
  }
}
```

---

### `GET /api/clients/:id` — [ADMIN] Get client detail

**Auth**: ADMIN

**Response 200**:
```json
{
  "success": true,
  "data": {
    "client": {
      "id": "...",
      "name": "...",
      "email": "...",
      "customPriceEgp": null,
      "bookings": [
        { "id": "...", "slotStartTime": "...", "type": "SINGLE", "status": "CONFIRMED", "amountEgp": 1500 }
      ],
      "packages": [
        {
          "id": "...",
          "tierName": "6-Session Package",
          "totalSessions": 6,
          "sessionsUsed": 2,
          "status": "ACTIVE",
          "intakeForm": {
            "skillLevel": "...",
            "primaryGoal": "...",
            "expectedOutcomes": "...",
            "preferredTimeline": "..."
          }
        }
      ]
    }
  }
}
```

---

## Reports

### `GET /api/reports/monthly` — [ADMIN] Get monthly revenue report

**Auth**: ADMIN

**Query params**:
```
year: number    // >= 2024
month: number   // 1-12
```

**Response 200**:
```json
{
  "success": true,
  "data": {
    "report": {
      "totalRevenueEgp": 45000,
      "totalRevenueUsd": 1451.61,
      "totalConfirmedSessions": 30,
      "topClients": [
        { "clientName": "...", "clientEmail": "...", "bookingCount": 6 }
      ]
    }
  }
}
```

- Only counts `CONFIRMED` bookings in the given month
- Empty month returns zeros and `topClients: []`

---

## Pricing Resolution (Internal)

The backend `pricing.service.ts` exposes `resolvePrice(userId)`:
1. If `User.customPriceEgp` is set → use that
2. Otherwise → use `SystemConfig.SINGLE_SESSION_PRICE_EGP`

This is called internally by `POST /api/bookings/single` and `POST /api/packages` to
determine the `amountEgp` passed to Paymob. It is not an HTTP endpoint.

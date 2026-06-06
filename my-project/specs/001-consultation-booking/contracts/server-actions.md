# Server Actions Contract: Consultation Booking Platform

**Feature**: 001-consultation-booking
**Date**: 2026-06-05

All Server Actions are defined in `src/lib/actions/`. Every action:
1. Validates input with a Zod schema before any database call
2. Verifies the caller's session via `auth()` (NextAuth v5)
3. Delegates all DB operations to the appropriate service in `src/lib/services/`
4. Returns a typed result object (never throws to the client)

---

## Client Actions

### `src/lib/actions/booking.actions.ts`

#### `getAvailableSlots(date: string): Promise<SlotResult>`

Fetch all `AVAILABLE` slots for a given calendar date.

```typescript
// Input
{ date: string }  // ISO date string "YYYY-MM-DD"

// Output (success)
{
  success: true,
  slots: Array<{
    id: string,
    startTime: string,   // ISO datetime UTC
    endTime: string      // ISO datetime UTC
  }>
}

// Output (error)
{ success: false, error: string }
```

- Requires authenticated session (CLIENT or ADMIN)
- Filters out slots on `BlockedDay` dates
- Filters out `BOOKED` and `BLOCKED` slots

---

#### `createSingleBooking(input): Promise<BookingResult>`

Reserve an available slot and initiate a Paymob payment for a single session.

```typescript
// Input (validated with Zod)
{ slotId: string }

// Output (success)
{
  success: true,
  paymobRedirectUrl: string,  // full Paymob iframe URL with payment_token
  bookingId: string
}

// Output (error)
{ success: false, error: string, code?: "SLOT_UNAVAILABLE" | "PAYMENT_INIT_FAILED" }
```

- Requires authenticated CLIENT session
- Checks slot status is `AVAILABLE` (re-validates at the moment of booking)
- Creates `Booking` with `status: PENDING`
- Creates `PaymentRecord` with `status: PENDING`
- Calls `paymob.ts#createPaymentRedirectUrl()` to get the redirect URL
- On Paymob API failure: rolls back booking creation, returns `PAYMENT_INIT_FAILED`

---

#### `getMyDashboard(): Promise<DashboardResult>`

Fetch the authenticated client's upcoming confirmed bookings and active package.

```typescript
// Output (success)
{
  success: true,
  upcomingBookings: Array<{
    id: string,
    slotStartTime: string,
    slotEndTime: string,
    type: "SINGLE" | "PACKAGE",
    meetLink: string | null
  }>,
  activePackage: {
    id: string,
    tierName: string,
    totalSessions: number,
    sessionsUsed: number,
    sessionsRemaining: number
  } | null
}
```

- Requires authenticated CLIENT session
- Only returns `CONFIRMED` bookings with `startTime > now`

---

### `src/lib/actions/package.actions.ts`

#### `getPackageTiers(): Promise<TiersResult>`

Fetch all active package tiers for the client to select from.

```typescript
// Output (success)
{
  success: true,
  tiers: Array<{
    id: string,
    name: string,
    sessions: number,
    priceEgp: number
  }>
}
```

- Requires authenticated CLIENT session
- Returns only tiers with `isActive: true`

---

#### `createPackageBooking(input): Promise<PackageBookingResult>`

Submit intake form and initiate a Paymob payment for a Roadmap Package.

```typescript
// Input (validated with Zod)
{
  tierId: string,
  intakeForm: {
    skillLevel: string,       // min 1 char, max 500 chars
    primaryGoal: string,      // min 1 char, max 1000 chars
    expectedOutcomes: string, // min 1 char, max 1000 chars
    preferredTimeline: string // min 1 char, max 500 chars
  }
}

// Output (success)
{
  success: true,
  paymobRedirectUrl: string,
  packageId: string
}

// Output (error)
{ success: false, error: string, fieldErrors?: Record<string, string[]> }
```

- Requires authenticated CLIENT session
- Verifies tier is active
- Creates `Package` with `status: ACTIVE` and `sessionsUsed: 0`
- Creates `IntakeForm` linked to the package
- Creates `PaymentRecord` with `status: PENDING`
- On Paymob failure: rolls back package + intake form creation

---

#### `bookPackageSession(input): Promise<BookingResult>`

Book a single slot from an active package (no new payment required).

```typescript
// Input (validated with Zod)
{ slotId: string, packageId: string }

// Output (success)
{
  success: true,
  bookingId: string
}

// Output (error)
{
  success: false,
  error: string,
  code?: "SLOT_UNAVAILABLE" | "PACKAGE_EXHAUSTED" | "PACKAGE_NOT_ACTIVE"
}
```

- Requires authenticated CLIENT session
- Verifies package belongs to the caller
- Verifies package `status: ACTIVE` and `sessionsUsed < totalSessions`
- Verifies slot is `AVAILABLE`
- Creates `Booking` with `status: CONFIRMED` directly (no payment step — already paid)
- Increments `Package.sessionsUsed`; transitions package to `COMPLETED` if exhausted
- Transitions slot to `BOOKED`

---

## Admin Actions

### `src/lib/actions/admin/slot.actions.ts`

#### `adminCreateSlot(input): Promise<SlotResult>`

```typescript
// Input
{ startTime: string }  // ISO datetime

// Output
{ success: true, slot: { id, startTime, endTime, status } }
| { success: false, error: string }
```

- Requires ADMIN session
- Validates `startTime` is in the future and does not overlap an existing slot
- Sets `endTime = startTime + 60 minutes`

---

#### `adminGenerateSlots(input): Promise<SlotsResult>`

```typescript
// Input
{
  date: string,        // "YYYY-MM-DD"
  startTime: string,   // "HH:MM" (24h)
  endTime: string,     // "HH:MM" (24h)
  intervalMinutes: 60  // v1 fixed at 60
}

// Output
{
  success: true,
  created: number,   // count of slots actually created
  skipped: number    // count skipped due to overlap
}
| { success: false, error: string }
```

- Requires ADMIN session
- Skips slots that would overlap with existing slots (does not error on overlap)
- Skips slots on `BlockedDay` dates

---

#### `adminBlockDay(input): Promise<BlockResult>`

```typescript
// Input
{ date: string, reason?: string }

// Output
{ success: true, blockedDay: { id, date, reason } }
| { success: false, error: string }
```

- Requires ADMIN session

---

#### `adminDeleteSlot(slotId: string): Promise<DeleteResult>`

```typescript
// Output
{ success: true }
| { success: false, error: string, code?: "HAS_CONFIRMED_BOOKING" }
```

- Requires ADMIN session
- Blocks deletion if the slot has a `CONFIRMED` booking

---

### `src/lib/actions/admin/pricing.actions.ts`

#### `adminSetDefaultPrice(input): Promise<PriceResult>`

```typescript
// Input
{ amountEgp: number }  // positive decimal

// Output
{ success: true, newPrice: number }
| { success: false, error: string }
```

- Upserts `SystemConfig` key `SINGLE_SESSION_PRICE_EGP`

---

#### `adminSetPackageTierPrice(input): Promise<PriceResult>`

```typescript
// Input
{ tierId: string, priceEgp: number }

// Output
{ success: true, tier: { id, name, priceEgp } }
| { success: false, error: string }
```

---

#### `adminSetClientCustomPrice(input): Promise<PriceResult>`

```typescript
// Input
{ clientId: string, amountEgp: number | null }
// null removes the override, restoring default

// Output
{ success: true }
| { success: false, error: string }
```

- Updates `User.customPriceEgp`

---

### `src/lib/actions/admin/booking.actions.ts`

#### `adminGetBookings(filters?): Promise<BookingsResult>`

```typescript
// Input (optional filters)
{
  status?: BookingStatus,
  type?: BookingType,
  clientId?: string,
  month?: string  // "YYYY-MM"
}

// Output
{
  success: true,
  bookings: Array<{
    id, clientName, clientEmail,
    slotStartTime, slotEndTime,
    type, status, amountEgp, meetLink
  }>
}
```

- Requires ADMIN session
- Eager-loads `user` and `slot` via Prisma `include`

---

#### `adminSetMeetLink(input): Promise<MeetLinkResult>`

```typescript
// Input
{ bookingId: string, meetLink: string }  // must be a valid URL

// Output
{ success: true, booking: { id, meetLink } }
| { success: false, error: string }
```

- Requires ADMIN session
- Booking must have `status: CONFIRMED`

---

#### `adminGetClients(): Promise<ClientsResult>`

```typescript
// Output
{
  success: true,
  clients: Array<{
    id, name, email, bookingCount, activePackage: boolean
  }>
}
```

---

#### `adminGetClientDetail(clientId: string): Promise<ClientDetailResult>`

```typescript
// Output
{
  success: true,
  client: {
    id, name, email, customPriceEgp,
    bookings: Array<{ id, slotStartTime, type, status, amountEgp }>,
    packages: Array<{
      id, tierName, totalSessions, sessionsUsed, status,
      intakeForm: { skillLevel, primaryGoal, expectedOutcomes, preferredTimeline }
    }>
  }
}
```

---

### `src/lib/actions/admin/report.actions.ts`

#### `adminGetMonthlyReport(input): Promise<ReportResult>`

```typescript
// Input
{ year: number, month: number }  // 1-12

// Output
{
  success: true,
  report: {
    totalRevenueEgp: number,
    totalRevenueUsd: number,       // sum(amountEgp / exchangeRateEgpUsd)
    totalConfirmedSessions: number,
    topClients: Array<{
      clientName: string,
      clientEmail: string,
      bookingCount: number
    }>
  }
}
```

- Requires ADMIN session
- Only counts `CONFIRMED` bookings in the given month
- Empty month returns zero values with `topClients: []`

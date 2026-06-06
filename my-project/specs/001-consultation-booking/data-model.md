# Data Model: Consultation Booking Platform

**Feature**: 001-consultation-booking
**Date**: 2026-06-05
**Location**: `backend/prisma/schema.prisma` — the Prisma schema lives exclusively in the backend.
The frontend has no Prisma dependency and never accesses the database directly.

## Entity Relationship Overview

```
User (CLIENT) ──< Booking >── Slot
User (CLIENT) ──< Package >── IntakeForm
Package ──< Booking
Booking ──── PaymentRecord
Package ──── PaymentRecord
PackageTier ──< Package
SystemConfig (key-value)
BlockedDay
```

## Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────

enum Role {
  ADMIN
  CLIENT
}

enum SlotStatus {
  AVAILABLE
  BOOKED
  BLOCKED
}

enum BookingType {
  SINGLE
  PACKAGE
}

enum BookingStatus {
  PENDING
  CONFIRMED
  FAILED
}

enum PackageStatus {
  ACTIVE
  COMPLETED
}

enum PaymentStatus {
  PENDING
  SUCCESS
  FAILED
}

// ─────────────────────────────────────────────
// Models
// ─────────────────────────────────────────────

model User {
  id              String    @id @default(cuid())
  email           String    @unique
  name            String?
  image           String?                   // Google OAuth avatar URL
  password        String?                   // bcrypt hash; null for OAuth-only users
  role            Role      @default(CLIENT)
  customPriceEgp  Decimal?                  // per-client price override (EGP)
  bookings        Booking[]
  packages        Package[]
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([email])
  @@index([role])
}

// Required by NextAuth.js v5 Prisma adapter
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

model Slot {
  id        String     @id @default(cuid())
  startTime DateTime                         // UTC
  endTime   DateTime                         // startTime + 60 minutes
  status    SlotStatus @default(AVAILABLE)
  booking   Booking?
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  @@unique([startTime])                      // no two slots at the same start time
  @@index([startTime])
  @@index([status])
}

model Booking {
  id              String        @id @default(cuid())
  userId          String
  slotId          String        @unique      // enforces no double-booking at DB level
  packageId       String?                    // null for SINGLE bookings
  type            BookingType
  status          BookingStatus @default(PENDING)
  meetLink        String?                    // entered by admin after confirmation
  reminderSent    Boolean       @default(false)
  amountEgp       Decimal?                   // null until payment confirmed
  exchangeRateEgpUsd Decimal?               // snapshot rate at payment time
  paymentRecord   PaymentRecord?
  user            User          @relation(fields: [userId], references: [id])
  slot            Slot          @relation(fields: [slotId], references: [id])
  package         Package?      @relation(fields: [packageId], references: [id])
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@index([userId])
  @@index([status])
  @@index([slotId])
}

model Package {
  id               String        @id @default(cuid())
  userId           String
  tierId           String
  status           PackageStatus @default(ACTIVE)
  totalSessions    Int
  sessionsUsed     Int           @default(0)
  amountPaidEgp    Decimal
  exchangeRateEgpUsd Decimal?
  intakeForm       IntakeForm?
  bookings         Booking[]
  paymentRecord    PaymentRecord?
  user             User          @relation(fields: [userId], references: [id])
  tier             PackageTier   @relation(fields: [tierId], references: [id])
  createdAt        DateTime      @default(now())
  updatedAt        DateTime      @updatedAt

  @@index([userId])
  @@index([status])
}

model IntakeForm {
  id                String   @id @default(cuid())
  packageId         String   @unique
  skillLevel        String
  primaryGoal       String   @db.Text
  expectedOutcomes  String   @db.Text
  preferredTimeline String
  package           Package  @relation(fields: [packageId], references: [id])
  createdAt         DateTime @default(now())
}

model PackageTier {
  id        String    @id @default(cuid())
  name      String    @unique              // e.g. "6-Session Package"
  sessions  Int                            // number of sessions included
  priceEgp  Decimal                        // fixed price, not per-session × count
  isActive  Boolean   @default(true)
  packages  Package[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

model PaymentRecord {
  id                  String        @id @default(cuid())
  paymobOrderId       String        @unique
  paymobTransactionId String?       @unique  // set after webhook
  bookingId           String?       @unique  // null for package payments
  packageId           String?       @unique  // null for single-session payments
  amountEgp           Decimal
  status              PaymentStatus @default(PENDING)
  rawWebhook          Json?                  // full webhook payload for audit
  booking             Booking?      @relation(fields: [bookingId], references: [id])
  package             Package?      @relation(fields: [packageId], references: [id])
  createdAt           DateTime      @default(now())
  updatedAt           DateTime      @updatedAt

  @@index([paymobOrderId])
}

model BlockedDay {
  id        String   @id @default(cuid())
  date      DateTime @unique              // date only (time component should be 00:00:00 UTC)
  reason    String?
  createdAt DateTime @default(now())

  @@index([date])
}

model SystemConfig {
  key       String   @id                  // e.g. "USD_EXCHANGE_RATE"
  value     String
  updatedAt DateTime @updatedAt
}
```

## State Machines

### Booking Status

```
PENDING ──(Paymob webhook success)──> CONFIRMED
PENDING ──(Paymob webhook failure)──> FAILED
PENDING ──(5-min cron sweep)────────> FAILED
```

No other transitions are permitted. Any code path attempting a different transition
MUST throw an `InvalidStateTransitionError`.

### Slot Status

```
AVAILABLE ──(booking confirmed)────> BOOKED
AVAILABLE ──(admin block action)───> BLOCKED
```

Slot status reverts `BOOKED → AVAILABLE` only when its associated booking transitions
to `FAILED` (via webhook or cron sweep). Admin can manually unblock a `BLOCKED` slot.

### Package Status

```
ACTIVE ──(sessionsUsed === totalSessions)──> COMPLETED
```

Transition triggered by `package.service.ts` after each booking within the package
is confirmed.

## Validation Rules

| Entity | Field | Rule |
|---|---|---|
| Slot | startTime | Must be in the future at creation time |
| Slot | startTime | Must not overlap with an existing slot (unique constraint) |
| Slot | endTime | Must equal `startTime + 60 minutes` |
| Booking | slotId | Slot must have status `AVAILABLE` at time of booking |
| Booking | packageId | If type = PACKAGE, package must have status `ACTIVE` and `sessionsUsed < totalSessions` |
| Package | totalSessions | Must be >= 6 (minimum package size) |
| IntakeForm | all fields | All four fields are required (non-empty string) |
| PackageTier | priceEgp | Must be positive |
| BlockedDay | date | Date must be in the future or today |
| PaymentRecord | amountEgp | Must match the amount used when creating the Paymob order |

## Key Indexes

All indexes are declared in the Prisma schema and will be created in the migration:

- `Slot.startTime` — calendar queries filter by date range
- `Slot.status` — client calendar filters on `AVAILABLE`
- `Booking.userId` — client dashboard queries all bookings for a user
- `Booking.status` — cron sweep queries `PENDING` bookings
- `Booking.slotId` — unique constraint (primary integrity enforcement)
- `Package.userId` — dashboard package queries
- `Package.status` — admin queries active packages
- `PaymentRecord.paymobOrderId` — webhook lookup by Paymob order ID
- `BlockedDay.date` — calendar blocked-day check

## Seeded Data (prisma/seed.ts)

```
User (ADMIN):
  email: youseabdallah866@gmail.com
  role: ADMIN
  password: <bcrypt hash of initial password — provided via environment variable ADMIN_INITIAL_PASSWORD>

PackageTier:
  { name: "6-Session Package",  sessions: 6,  priceEgp: 0 }  // price set by admin on first login
  { name: "10-Session Package", sessions: 10, priceEgp: 0 }

SystemConfig:
  { key: "SINGLE_SESSION_PRICE_EGP", value: "0" }            // price set by admin on first login
  { key: "USD_EXCHANGE_RATE",        value: "31.00" }         // updated by admin as needed
```

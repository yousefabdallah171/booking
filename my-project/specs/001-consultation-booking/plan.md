# Implementation Plan: Consultation Booking Platform

**Branch**: `001-consultation-booking` | **Date**: 2026-06-05 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/001-consultation-booking/spec.md`

## Summary

Build a full-stack consultation booking platform replacing Youssef's WhatsApp-based
workflow. The platform is split into two independent applications:

- **`frontend/`** — Next.js 14 App Router (TypeScript strict): all UI, authentication
  (NextAuth v5), i18n (Arabic + English), dark/light mode, RTL support, and
  server-side rendering. Calls the backend REST API for all data operations.
- **`backend/`** — Express.js REST API (TypeScript strict): all business logic, database
  access (Prisma + PostgreSQL), external service integrations (Paymob, Resend), and
  cron endpoints. Stateless; validates JWTs issued by the frontend's NextAuth instance.

Both apps are deployed as Docker containers on a VPS, orchestrated by Docker Compose.

---

## Design System

### Aesthetic Direction — "Refined Cairo"

A premium personal-brand aesthetic for Youssef Abdallah (YA mark). Professional,
modern, confident — never generic SaaS.

- **Tone**: High-end personal brand — warm, authoritative, approachable
- **Primary palette**: Dark navy (dark mode) / warm white (light mode)
- **Brand color**: `oklch(.86 .22 128)` — vibrant lime-green (matches logo mark)
- **Accent**: `oklch(.78 .15 205)` — teal complement
- **Typography**: `DM Serif Display` for headings; `IBM Plex Sans` for English body;
  **`Cairo`** for Arabic body (NOT Noto Naskh Arabic)
- **Background**: Fixed radial-gradient glow from brand color at top + surface gradient
- **Logo**: `<Logo />` component — YA mark in brand green, wordmark in currentColor

### Color Tokens

```
Brand oklch (for gradients & glow):
  --color-brand:        oklch(.86 .22 128)   ← vibrant lime-green, matches logo
  --color-brand-hover:  oklch(.91 .2  128)
  --color-brand-accent: oklch(.78 .15 205)   ← teal complement
  --color-brand-glow:   color-mix(in oklab, var(--color-brand) 22%, transparent)

Light mode (shadcn HSL):
  --background:   45 25% 97%    (warm white)
  --foreground:   230 20% 12%   (dark navy text)
  --primary:      92 57% 46%    (brand green, darkened for light-bg contrast)
  --accent:       197 42% 48%   (teal)
  --border:       230 12% 87%

Dark mode (shadcn HSL):
  --background:   230 20% 8%    (dark navy)
  --foreground:   45 20% 92%    (warm off-white)
  --primary:      92 65% 62%    (full-brightness brand green)
  --accent:       197 45% 58%   (teal)
  --border:       230 15% 19%
```

### i18n & RTL

- **Locales**: `ar` (Arabic, default, RTL) and `en` (English, LTR)
- **Routing**: URL-prefixed via next-intl — `/ar/booking`, `/en/booking`
- **RTL**: Tailwind `rtl:` variants + CSS logical properties throughout
- **Fonts**: Arabic uses `Noto Naskh Arabic`; English uses `IBM Plex Sans`
- **`dir` attribute**: Set on `<html>` based on active locale

### Dark/Light Mode

- **Library**: `next-themes` with `class` strategy + `defaultTheme: "system"`
- **Toggle**: Sun/Moon icon in the nav bar; persisted to `localStorage`
- **Tailwind**: `darkMode: "class"` in `tailwind.config.ts`

### Impeccable Design ([impeccable.style](https://impeccable.style/))

Following the [impeccable.style](https://impeccable.style/) methodology — a structured
approach to keeping AI-generated UI consistent and high-quality across sessions:
- `DESIGN.md` at repo root — design tokens, typography, spacing scale, color system,
  anti-patterns, and component conventions for this specific product
- `PRODUCT.md` at repo root — brand voice, target users, tone, and design anti-patterns
- Every UI generation task **must** reference both files before producing any component
- These files prevent aesthetic drift across multiple AI-assisted sessions and contributors

---

## Technical Context

### Frontend (`frontend/`)

| Concern | Choice |
|---|---|
| Framework | Next.js 14 App Router (TypeScript strict) |
| Auth | NextAuth.js v5 (Google + Credentials providers) |
| UI components | shadcn/ui + Radix UI + Tailwind CSS 3.x |
| i18n | next-intl 3.x — `ar` (default, RTL) + `en` |
| Arabic font | Cairo (Google Fonts) — replaces Noto Naskh Arabic |
| Dark/light mode | next-themes (class strategy) |
| Backend calls | `fetch` in Server Components / Server Actions (BFF pattern) |
| Forms | React Hook Form + Zod |
| E2E tests | Playwright (Chromium only) |
| Package manager | pnpm |

### Backend (`backend/`)

| Concern | Choice |
|---|---|
| Framework | Express.js 4.x (TypeScript strict) |
| ORM | Prisma 5.x |
| Database | PostgreSQL (containerized on VPS) |
| Validation | Zod on every route handler |
| Email | Resend SDK + React Email templates |
| Payments | Paymob REST API (3-step hosted payment page) |
| Unit/Integration tests | Vitest 2.x |
| Package manager | pnpm |

### Shared

| Concern | Choice |
|---|---|
| Language | TypeScript 5.x / Node.js 20 LTS |
| Deployment | VPS + Docker Compose + Nginx reverse proxy |
| Cron strategy | System crontab on VPS calls `curl http://localhost:4000/api/cron/*` |
| Auth shared secret | `AUTH_SECRET` used by NextAuth (frontend) and JWT verify (backend) |

---

## Architecture: Frontend vs Backend Communication

```
Browser
  |
  v
Nginx (port 80/443)
  |-- /          --> frontend:3000  (Next.js 14)
  |                     |
  |                     |-- Server Components / Server Actions
  |                     |       --> fetch http://backend:4000/api/*
  |                     |-- /api/auth/[...nextauth]  (NextAuth only)
  |
  |-- /api/* (direct) --> backend:4000  (Express.js)
          |-- /api/slots, /api/bookings, /api/packages
          |-- /api/pricing, /api/clients, /api/reports
          |-- /api/webhooks/paymob   (public, HMAC protected)
          `-- /api/cron/*            (CRON_SECRET protected)
```

**Auth flow**:
1. User logs in via NextAuth on the frontend (Google OAuth or credentials).
2. NextAuth issues a signed JWT stored in a secure HttpOnly cookie.
3. When a Next.js Server Action calls the backend, it reads the raw session token
   from the request cookie and forwards it as `Authorization: Bearer <jwt>`.
4. The backend `authMiddleware` verifies the JWT using the shared `AUTH_SECRET`.
5. The verified `userId` and `role` are attached to `req.user` for route handlers.

---

## Constitution Check

| Principle | Gate | Status |
|---|---|---|
| I. Code Quality & Architecture | TypeScript strict in both apps; Zod on all inputs; service layer owns Prisma; env.ts in each app | ✅ PASS |
| II. Testing Standards | P0 integration tests + 4 webhook unit tests in `backend/tests/`; Playwright E2E in `frontend/tests/e2e/`; CI gate | ✅ PASS |
| III. UX Consistency | Inline errors; loading states; toasts; empty states; conflict msg; destructive confirms | ✅ PASS |
| IV. Performance | Lighthouse CI on frontend; p95 <500ms on backend; DB indexes; no N+1 | ✅ PASS |
| V. Security | Next.js Edge middleware (frontend); Express auth middleware (backend); Paymob HMAC; bcrypt 12; no secrets in repo | ✅ PASS |
| VI. Booking & Payment Integrity | State machine in `booking.service.ts`; `Booking.slotId @unique`; 5-min cron; idempotent webhook | ✅ PASS |

**Result**: All gates pass.

---

## Project Structure

### Frontend (`frontend/`)

```text
frontend/
├── messages/
│   ├── ar.json                        # Arabic translations (default locale)
│   └── en.json                        # English translations
├── src/
│   ├── app/
│   │   ├── [locale]/                  # All user-facing pages under locale prefix
│   │   │   ├── (auth)/login/page.tsx
│   │   │   ├── (client)/
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── booking/page.tsx
│   │   │   │   ├── booking/package/page.tsx
│   │   │   │   └── dashboard/page.tsx
│   │   │   ├── (admin)/admin/
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   ├── calendar/page.tsx
│   │   │   │   ├── pricing/page.tsx
│   │   │   │   ├── bookings/page.tsx
│   │   │   │   ├── clients/page.tsx
│   │   │   │   ├── clients/[id]/page.tsx
│   │   │   │   └── reports/page.tsx
│   │   │   ├── layout.tsx             # Locale layout (ThemeProvider, fonts, dir attr)
│   │   │   └── page.tsx               # Landing page
│   │   ├── api/
│   │   │   └── auth/[...nextauth]/route.ts
│   │   └── layout.tsx                 # Root layout (minimal — html/body only)
│   ├── components/
│   │   ├── ui/                        # shadcn/ui primitives
│   │   ├── booking/
│   │   ├── admin/
│   │   └── shared/
│   │       ├── ConfirmDialog.tsx
│   │       ├── EmptyState.tsx
│   │       ├── ThemeToggle.tsx        # Sun/Moon toggle
│   │       └── LanguageToggle.tsx     # AR/EN switcher
│   ├── i18n/
│   │   ├── routing.ts                 # next-intl routing config (locales, defaultLocale)
│   │   └── request.ts                 # next-intl server-side config
│   └── lib/
│       ├── api.ts                     # Typed fetch wrapper -> backend:4000
│       ├── auth.ts                    # NextAuth v5 config
│       └── env.ts                     # Zod-validated frontend env vars
├── middleware.ts                       # Combined next-intl + NextAuth middleware
├── Dockerfile
├── next.config.mjs
├── tailwind.config.ts
├── playwright.config.ts
├── tsconfig.json
├── package.json
└── .env.example
```

### Backend (`backend/`)

```text
backend/
├── src/
│   ├── routes/, services/, middleware/, lib/, utils/, emails/
│   └── app.ts
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── tests/
├── cron/crontab.example
├── Dockerfile
├── tsconfig.json
├── vitest.config.ts
├── package.json
└── .env.example
```

### Repository Root

```text
my-project/
├── frontend/
├── backend/
├── nginx/nginx.conf
├── docker-compose.yml
├── docker-compose.override.yml
├── .dockerignore
├── DESIGN.md              # Impeccable design system — AI UI consistency
├── PRODUCT.md             # Product context — brand voice, users, anti-patterns
├── deploy/README.md
└── specs/
```

# Quickstart: Consultation Booking Platform

**Feature**: 001-consultation-booking
**Date**: 2026-06-05

## Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| Node.js | 20 LTS | Required by both apps |
| pnpm | 9.x | `npm install -g pnpm` |
| Docker + Docker Compose | latest | Local dev + VPS deployment |
| Git | any | Branch: `001-consultation-booking` |

## Infrastructure Accounts Required

1. **Paymob** — Egyptian payment gateway (https://accept.paymob.com)
   - Obtain: `API_KEY`, `INTEGRATION_ID`, `IFRAME_ID`, `HMAC_SECRET`
2. **Resend** — transactional email (https://resend.com)
   - Create API key with send permissions; verify your sending domain
3. **Google Cloud Console** — for Google OAuth
   - Create OAuth 2.0 client ID (Web application)
   - Add redirect URIs:
     - Dev: `http://localhost:3000/api/auth/callback/google`
     - Prod: `https://yourdomain.com/api/auth/callback/google`

## Repository Layout

```
my-project/
├── frontend/     # Next.js 14 app — run on port 3000
├── backend/      # Express.js API — run on port 4000
├── nginx/        # Reverse proxy config (production)
├── docker-compose.yml
└── docker-compose.override.yml
```

## Environment Variables

### Backend (`backend/.env.local`)

Create from `backend/.env.example`:

```bash
# Database
DATABASE_URL="postgresql://postgres:postgres@db:5432/booking"
DATABASE_URL_TEST="postgresql://postgres:postgres@localhost:5432/booking_test"

# Auth (shared secret with frontend — MUST match AUTH_SECRET in frontend)
AUTH_SECRET="<generate: openssl rand -base64 32>"

# Paymob
PAYMOB_API_KEY="<paymob api key>"
PAYMOB_INTEGRATION_ID="<paymob integration id>"
PAYMOB_IFRAME_ID="<paymob iframe id>"
PAYMOB_HMAC_SECRET="<paymob hmac secret>"

# Resend
RESEND_API_KEY="<resend api key>"
RESEND_FROM_EMAIL="noreply@yourdomain.com"

# Cron security
CRON_SECRET="<generate: openssl rand -base64 32>"

# Admin seed
ADMIN_EMAIL="youseabdallah866@gmail.com"
ADMIN_INITIAL_PASSWORD="<strong password>"

# App
FRONTEND_URL="http://localhost:3000"
PORT="4000"
```

### Frontend (`frontend/.env.local`)

Create from `frontend/.env.example`:

```bash
# NextAuth (AUTH_SECRET MUST match backend AUTH_SECRET)
AUTH_SECRET="<same value as backend AUTH_SECRET>"
AUTH_URL="http://localhost:3000"

# Google OAuth
AUTH_GOOGLE_ID="<google client id>"
AUTH_GOOGLE_SECRET="<google client secret>"

# Backend API URL (inside Docker network use service name)
BACKEND_URL="http://backend:4000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**IMPORTANT**: `AUTH_SECRET` must be the same value in both apps.

## Local Development (Docker Compose)

```bash
# Start all services (db + backend + frontend)
docker compose up -d

# View logs
docker compose logs -f backend
docker compose logs -f frontend

# Stop
docker compose down
```

Services:
- `http://localhost:3000` — Next.js frontend
- `http://localhost:4000` — Express backend API
- PostgreSQL accessible at `localhost:5432` (dev override)

## Manual Setup (without Docker)

### 1. Backend

```bash
cd backend

# Install dependencies
pnpm install

# Generate Prisma client
pnpm prisma generate

# Run migrations (creates all tables)
pnpm prisma migrate dev --name init

# Seed database (admin + package tiers + system config)
pnpm prisma db seed

# Start dev server (port 4000)
pnpm dev
```

### 2. Frontend

```bash
cd frontend

# Install dependencies
pnpm install

# Start dev server (port 3000)
pnpm dev
```

Visit `http://localhost:3000` — you should see the landing page.
Log in at `/login` with email `youseabdallah866@gmail.com` and `ADMIN_INITIAL_PASSWORD`.

## Running Tests

### Backend Tests (Vitest)

```bash
cd backend

# All tests against test database
pnpm test

# Watch mode
pnpm test:watch

# Unit tests only
pnpm test:unit

# Integration tests only
pnpm test:integration
```

Ensure `DATABASE_URL_TEST` points to a separate database.
Tests reset the database via `prisma migrate reset --force` in `tests/setup.ts`.

### Frontend E2E Tests (Playwright)

```bash
cd frontend

# Requires: Docker Compose stack running
docker compose up -d

# Run all E2E tests
pnpm playwright test

# Install Chromium (first time)
pnpm playwright install chromium

# Run with UI
pnpm playwright test --ui
```

## Production Deployment (VPS + Docker Compose)

### First-time setup

```bash
# SSH into VPS
ssh user@your-vps-ip

# Clone repository
git clone <repo-url> /opt/booking
cd /opt/booking

# Create environment files
cp backend/.env.example backend/.env.local
cp frontend/.env.example frontend/.env.local
# Fill in all values in both files

# Build and start
docker compose -f docker-compose.yml up -d --build

# Run migrations and seed
docker compose exec backend pnpm prisma migrate deploy
docker compose exec backend pnpm prisma db seed

# Install system crontab
crontab backend/cron/crontab.example
```

### SSL with Certbot (Nginx)

```bash
# Install Certbot on VPS
apt install certbot python3-certbot-nginx

# Obtain certificate
certbot --nginx -d yourdomain.com

# Certbot auto-renews; verify with:
certbot renew --dry-run
```

### Routine deploys

```bash
cd /opt/booking
git pull
docker compose up -d --build
docker compose exec backend pnpm prisma migrate deploy
```

## Paymob Webhook Configuration

In Paymob dashboard, set the webhook (callback) URL to:
- Dev: Use ngrok → `https://your-ngrok-url/api/webhooks/paymob`
  - Nginx routes `/api/*` directly to the backend at `http://backend:4000`
- Prod: `https://yourdomain.com/api/webhooks/paymob`

Enable HMAC callback protection and copy the secret to `PAYMOB_HMAC_SECRET`.

## First-time Admin Setup

After deployment, Youssef should:

1. Log in at `/login`
2. Navigate to `/admin/pricing`
3. Set the default single-session price (EGP)
4. Set prices for each package tier
5. Navigate to `/admin/calendar`
6. Create the first available slots

## VPS Crontab (system-level scheduling)

The crontab calls backend endpoints directly — no cloud scheduler required:

```cron
# Edit with: crontab -e
# Or install from file: crontab backend/cron/crontab.example

*/5 * * * * curl -s -H "Authorization: Bearer $CRON_SECRET" http://localhost:4000/api/cron/release-pending
* * * * *   curl -s -H "Authorization: Bearer $CRON_SECRET" http://localhost:4000/api/cron/send-reminders
```

Set `CRON_SECRET` in the shell environment before running crontab, or use a wrapper
script that sources `/opt/booking/backend/.env.local`.

## Validation Checklist

- [ ] `cd backend && pnpm prisma validate` — schema has no errors
- [ ] `cd backend && pnpm type-check` — zero TypeScript errors
- [ ] `cd frontend && pnpm type-check` — zero TypeScript errors
- [ ] `cd backend && pnpm test` — all Vitest tests pass
- [ ] `cd frontend && pnpm playwright test` — all E2E tests pass
- [ ] Landing page loads in under 2 seconds (Lighthouse)
- [ ] Admin logs in and reaches `/admin/calendar`
- [ ] Client signs in with Google and sees the booking calendar
- [ ] Admin creates a test slot; it appears on the client calendar
- [ ] Paymob test payment completes; booking shows CONFIRMED
- [ ] Confirmation email arrives within 2 minutes of test payment

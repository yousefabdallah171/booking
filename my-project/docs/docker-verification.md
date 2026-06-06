# Docker Verification Steps

Run these after completing Phase 1 tasks T001–T016 (project initialized, Next.js app exists).

## Step 1: Initialize the Next.js project (T001)

```powershell
pnpm create next-app@14 . --typescript --tailwind --app --src-dir --import-alias "@/*"
```

## Step 2: Start the database only (fast sanity check)

```powershell
docker compose up db -d
docker compose ps
# db container should show "healthy"
```

## Step 3: Build and start the full stack

```powershell
docker compose up --build
# Wait for: "Ready - started server on 0.0.0.0:3000"
```

## Step 4: Verify app is reachable

```powershell
curl http://localhost:3000
# Should return HTML (landing page)
```

## Step 5: Run Playwright smoke tests against Docker stack

```powershell
$env:PLAYWRIGHT_BASE_URL = "http://localhost:3000"
pnpm playwright test tests/e2e/auth.spec.ts --headed
```

## Step 6: Development mode (hot reload)

```powershell
# Uses docker-compose.override.yml automatically
docker compose up
# Source files in ./src are mounted — changes hot-reload without rebuilding
```

## Troubleshooting

| Symptom | Fix |
|---|---|
| `app` exits immediately | Check `.env.local` has all required vars from `.env.example` |
| `db` not healthy | Run `docker compose logs db` — check port 5432 not already in use |
| Prisma connection refused | `DATABASE_URL` must use `db` hostname (not `localhost`) inside Docker |
| Build fails: no pnpm-lock.yaml | Run `pnpm install` locally first to generate the lockfile |

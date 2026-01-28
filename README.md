# Acquisitions API

This repository contains an Express.js API that uses Neon Postgres via `@neondatabase/serverless` + Drizzle.

This project supports two database modes:

- Development: Neon Local (Docker) creates an ephemeral Neon branch when the container starts and deletes it when it stops.
- Production: Connect directly to Neon Cloud using your `DATABASE_URL`.

## Files added

- `Dockerfile` (multi-stage: `dev` and `prod` targets)
- `docker-compose.yml` / `docker-compose.dev.yml` (app + Neon Local)
- `docker-compose.prod.yml` (app only; Neon Cloud is external)
- `.env.development.example` / `.env.production.example`

## Prerequisites

- Docker Desktop
- A Neon account + a Neon project
  - `NEON_API_KEY` and `NEON_PROJECT_ID` are required for Neon Local.

## Development (Neon Local)

### 1) Create your dev env file

Copy the example and fill in the Neon values:

- Copy `.env.development.example` → `.env.development`
- Set:
  - `NEON_API_KEY`
  - `NEON_PROJECT_ID`

Your app will connect to Neon Local inside the compose network using:

- `DATABASE_URL=postgres://neon:npg@neon-local:5432/neondb`

Because this app uses `@neondatabase/serverless`, you must also set:

- `NEON_FETCH_ENDPOINT=http://neon-local:5432/sql`

### 2) Start the stack

```bash
docker compose -f docker-compose.dev.yml up --build
```

API should be available at:

- `http://localhost:3000/health`

### 3) Run database migrations

Neon Local starts with a fresh (often ephemeral) branch, so apply migrations **after** `neon-local` is running.

```bash
docker compose -f docker-compose.dev.yml run --rm app npm run db:migrate
```

### 4) Verify the `users` table exists (optional)

If you ever get `users: []` but you expected rows, first verify migrations actually created the table.

Using the app container + Neon HTTP driver:

```bash
docker compose -f docker-compose.dev.yml run --rm app node --input-type=module -e "import { sql } from './src/config/database.js'; const r = await sql(\"select to_regclass('public.users') as users_table\"); console.log(r);"
```

If it prints `null`, the table doesn't exist in the current Neon Local branch.

### 4) Connect to Postgres from your host (optional)

Neon Local exposes port `5432` to your machine:

```bash
psql "postgres://neon:npg@localhost:5432/neondb"
```

## Production (Neon Cloud)

In production you do **not** run Neon Local. Neon Cloud is a managed Postgres service, so the app container connects to it via `DATABASE_URL`.

### 1) Create your prod env file

- Copy `.env.production.example` → `.env.production`
- Set:
  - `DATABASE_URL` (your Neon Cloud connection string, e.g. `...neon.tech...`)
  - `JWT_SECRET` (strong secret)

### 2) Start the app container

```bash
docker compose -f docker-compose.prod.yml up --build
```

## How the environment switch works

- **Development** (`docker-compose.dev.yml`)
  - Starts `neon-local` + `app`
  - `app` reads `.env.development`
  - `DATABASE_URL` points to `neon-local` (inside the compose network)
  - `NEON_FETCH_ENDPOINT` points to Neon Local's SQL HTTP endpoint

- **Production** (`docker-compose.prod.yml`)
  - Starts only `app`
  - `app` reads `.env.production`
  - `DATABASE_URL` points to Neon Cloud (external)

## Notes

- If you want Neon Local to keep the created branch after shutdown, set `DELETE_BRANCH=false` on the `neon-local` service.
- If you want to branch from a non-primary branch, set `PARENT_BRANCH_ID`.

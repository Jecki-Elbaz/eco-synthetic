# AI Patient Simulator -- monorepo

## Prerequisites

- Node >= 20
- pnpm >= 9
- PostgreSQL 15 (local dev: port 5433)
- `dotenv-cli` (included as dev dependency in root `package.json`)

## Running local dev end-to-end

### 1. Environment

Env vars live in `../../.env.local` (relative to the monorepo root `app/` directory).
This file is gitignored and partition-scoped -- never commit it.

Required vars: `DATABASE_URL`, `JWT_SECRET`.

### 2. Install dependencies

```
pnpm install
```

### 3. Apply DB migrations

```
pnpm db:migrate
```

This runs `prisma migrate deploy` against the `DATABASE_URL` in your env file.

### 4. Build the API

```
pnpm --filter @aps/api build
```

### 5. Boot the API (local dev)

```
pnpm --filter @aps/api dev:boot
```

This runs: `dotenv -e ../../.env.local -- node dist/src/main.js`

The server starts on `PORT` (default 3000).

### 6. Run tests

Engine tests (no DB required):

```
pnpm --filter @aps/engine-test-harness test
```

API unit tests (no DB required):

```
pnpm --filter @aps/api test
```

Integration tests (requires live Postgres):

```
pnpm --filter @aps/api test:integration
```

## Env partition rule

All env access uses `dotenv -e ../../.env.local`.
Never run commands that read or print env values.
Never commit any file containing real env values.

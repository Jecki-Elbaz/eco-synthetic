# R&D CLAUDE.md Template Kit

Owner: Ido (VP R&D). Stewards: Gal (Lead Dev), Noam (Product) for framing.
Purpose: seed the delivery-management SaaS project's `CLAUDE.md` when its repo scaffolds.
Status: REFERENCE (no gate needed -- documentation, not an external tool).

## Stack decision (aligned to global standards)
Global standard (workspace CLAUDE.md): Python 3.11+, black (88), ruff, type hints on all
public functions, Google-style docstrings, pytest with >=80% coverage.

Chosen stack for the SaaS:
- Backend: FastAPI (async, Pydantic models, SQLAlchemy). Fits the Python-first standard.
- Frontend: Next.js (App Router) + TypeScript.
- DB: Supabase/Postgres when first needed (already deferred in gate-register).

Why not Django: FastAPI is lighter for an API-first SaaS and async-native. Django stays a
fallback if we need a batteries-included admin + ORM later.

## Licensing note
This kit is authored by us; it does NOT copy external template text. The external
catalog (claudedirectory.org/prompts -- FastAPI, Next.js) is REFERENCE ONLY. Before any
verbatim text is lifted from it, Eyal (license) + Dalia (quality/attribution) clear it.

---

## Starter project CLAUDE.md (copy into the SaaS repo root, then customize)

```markdown
# <SaaS-name> -- Project CLAUDE.md

## Stack
- Backend: FastAPI (Python 3.11+), Pydantic v2, SQLAlchemy 2.x (async), Alembic migrations.
- Frontend: Next.js (App Router) + TypeScript (strict), React Server Components default.
- DB: Postgres (Supabase). Cache: none until measured need.
- Pkg mgmt: uv (Python), pnpm (JS). Pin all versions; never "latest".

## Coding standards (inherit global, plus)
- Python: black line 88, ruff, type hints on all public symbols, Google docstrings.
- TS: strict mode on; no `any` without justification; ESLint + Prettier.
- Tests: pytest >=80% cover (backend); Vitest/Playwright (frontend). Run before commit.
- Commits: imperative, <=72 char subject; branches feat/ fix/ chore/.

## Architecture rules
- API: versioned routes (/api/v1). Pydantic schemas for every request/response.
- No business logic in route handlers -- push into a service layer.
- DB access only through the repository/service layer, never from routes directly.
- Secrets only in .env (gitignored). Never commit secrets, tokens, keys, or PII.
- Migrations are append-only; never edit a shipped migration.

## Red lines (project)
- Never read/write/log .env or any credential file.
- Never run destructive shell (rm -rf, DROP TABLE, force-push to main) without A1.
- Never add an external tool/dependency without the tool-gate (Security + Legal).
- Pin every dependency. Verify before you claim; if unsure, say so.

## Verify / run
- Backend: `uvicorn app.main:app --reload`; tests `pytest --cov=app`.
- Frontend: `pnpm dev`; tests `pnpm test`.
```

---

## How to use
1. When the SaaS repo is scaffolded, copy the starter block into its root `CLAUDE.md`.
2. Replace `<SaaS-name>` and trim sections that do not yet apply.
3. Keep it consistent with the global workspace CLAUDE.md -- this is an override layer,
   not a replacement.
4. If a Hebrew/RTL front end is built, pair with the hebrew-rtl-best-practices skill
   (gate-register pending owner adoption decision).

# APS Local-Dev Env File Safety Ruling

Issued by: Rambo (Security, L3)
Date: 2026-07-01
Authority: A3 (security ruling); Eco to relay to owner for record

---

## RULING: COMPLIANT

Shir's two local-dev env files comply with the safe standard defined below.
No remediation required.

---

## Files reviewed

1. projects/ai-patient-simulator/app/infra/docker/.env
   - Location: strictly inside the APS project partition
   - Gitignored: yes -- covered by app/.gitignore bare `.env` entry (applies recursively)
   - Content kind: POSTGRES_PASSWORD, MINIO_ROOT_PASSWORD -- throwaway local-dev strings only
   - No real/production credentials; no reference to .env.global or repo-root .env

2. projects/ai-patient-simulator/app/.env.local
   - Location: strictly inside the APS project partition
   - Gitignored: yes -- .env.local is explicitly listed in app/.gitignore
   - Content kind: DATABASE_URL (localhost), REDIS_URL (localhost), S3 endpoint/bucket/keys
     (localhost MinIO), LLM_PROVIDER=stub (no real API key), JWT_SECRET (local-dev throwaway),
     SUPPORT_EMAIL_SMTP (localhost)
   - All values are localhost/stub/throwaway; no production credential; LLM key is literal
     "stub-not-a-real-key"; no reference to .env.global

---

## Safe standard -- APS local-dev env files

1. LOCATION: env files may only live inside projects/ai-patient-simulator/ (the partition).
   Never at repo root, never at workspace root, never touching .env.global.

2. CONTENT: throwaway local-dev values only. No production passwords, real API keys, real
   JWT secrets, or customer data. LLM provider must stay in stub mode until APS-004 gate clears
   and an LLM integration is approved.

3. GITIGNORE: every env file must be covered by a .gitignore entry before the file is created.
   The app/.gitignore covers .env and .env.local recursively. Any new env filename pattern must
   be added to .gitignore first.

4. NEVER reference or touch: .env.global, the eco-synthetic repo-root .env, or any credential
   outside the APS partition. These are hard stops.

5. TEMPLATE: the .env.example file (committed, no real values) is the canonical template.
   Shir's pattern -- .env.example committed, .env gitignored -- is the required pattern.

---

## Reconciliation with CLAUDE.md red line 1

Red line 1 prohibits reading, writing, referencing, or logging .env or credential files.
That prohibition targets real/production credential files and protects against accidental
secret exposure in agent outputs, logs, and tracked files.

A local-dev env file that (a) lives entirely within the project partition, (b) is gitignored,
(c) contains only throwaway localhost/stub values with no real secrets, and (d) never references
or touches .env.global or any real credential file does NOT constitute the risk red line 1 guards
against. The file cannot leak a real secret because it holds none. The prohibition stands in full
for any file containing real credentials; this ruling carves out only the narrowly-defined
throwaway local-dev case above. Any doubt about whether a value is throwaway -> treat as real
and do not create the file without Eco + Rambo review.

---

## Standing rule for agents (Claude Code, Eco, all agents)

Agents operating in this project MUST NOT read, reference, or log the contents of
infra/docker/.env or app/.env.local. The files exist for the local container runtime only.
Agent interaction with these files must remain zero. This ruling does not grant agent read access.

---

## References

- CLAUDE.md red line 1 (never read/write/reference .env or credential files)
- projects/ai-patient-simulator/app/.gitignore
- projects/ai-patient-simulator/app/infra/docker/.env.example
- company/governance/security-baseline.md

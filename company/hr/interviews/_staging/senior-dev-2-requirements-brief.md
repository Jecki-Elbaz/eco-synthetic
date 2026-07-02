# Role Requirements Brief -- Senior Developer 2 (APS-009)
# Author: Anat (HR/Agent-Ops) | Date: 2026-06-29
# Hiring manager: Ido (VP R&D)
# Stage-A approval: jecki (A1) 2026-06-29

---

## Context

The AI Patient Simulator project (Sprint 2 start 2026-07-14) has a confirmed build-capacity
gap. Gal (Lead Dev) owns the full engine pipeline (7-step turn pipeline, parallel guard
architecture, interaction analyser, ground-truth enforcement). Items 5-9 from team-capacity-
ido.md (case authoring UI, Hebrew RTL, credit/token management, test infrastructure) have zero
remaining capacity if Gal holds the engine alone. One additional hands-on builder is required
to close Sprint 2 scope.

Oren (Senior Developer, review-only) cannot fill this gap: he has no Bash, cannot run builds,
execute migrations, wire NestJS modules, or push tested code.

Confirmation deadline: 2026-07-07 (Ido condition 1 from team-capacity-ido.md).

---

## Profile

Seniority: mid-to-senior. Does not own architecture (Gal owns that). Executes clear specs
from Gal without supervision overhead that consumes Gal's time.

Group: R&D.
Reports to: Ido (VP R&D).
Level: L4.
Phase: P1 (pulled forward -- Sprint 2 critical path).

---

## Non-negotiable technical capabilities

1. NestJS -- modules, dependency injection, WebSocket. Needed for Sprint 2 NestJS service
   wiring (case authoring, credit ledger, auth flows).
2. Next.js App Router -- RTL/i18n configuration. Needed for case authoring UI and Hebrew RTL
   rendering (feasibility-ido.md pilot-minimal requirement: Hebrew day one).
3. Prisma + PostgreSQL -- schema is written; agent must work from it without ramp time.
   Credit ledger, UsageLog, PatientStateLog schema all exist.
4. Bash/shell -- git, pnpm, docker-compose, build task execution. This is the capability
   that distinguishes this role from Oren. Agent must have Bash tool access (B5 Rambo scan
   required before go-live).

---

## Sprint 2 deliverables this role owns (primary)

From team-capacity-ido.md and feasibility-ido.md Sprint 2:
- Case authoring: structured builder form, persona generation prompt, ground-truth file
  form, resistance rules, rubric builder (semi-auto generation, teacher edit, publish).
- Hebrew RTL rendering: i18n setup, RTL CSS, integration testing in student interface.
- Credit/token management: CreditLedger, CreditEntry, UsageLog, soft/hard limits,
  admin UI, deduction event pipeline.
- StubProvider deterministic guard config (TH-01 mapping) -- test infrastructure for Adi
  (Sprint 3 start).
- Failure-simulation hooks FS-01 through FS-05, TH-01 through TH-07.

Gal owns Sprint 2 items 1-4 (engine pipeline). This role owns items 5-9 in parallel.

---

## Working style requirements

- Executes from Gal's specs without blocking Gal for supervision.
- Flags blockers to Ido directly; does not hold or silently slip.
- Follows the house no-guess rule: unknown or uncertain -> states it, does not fake it.
- Code review from Oren is expected; this role treats Oren's review as a quality gate.
- Coordinates with Shir on infrastructure dependencies (docker-compose, env config).

---

## Tool needs (preliminary -- Rambo B5 scan required)

- Read, Write, Edit: source code, docs, project files.
- Bash: build commands, git, pnpm, docker-compose. REQUIRES Rambo B5 permission scan.
- No admin tools, no access to company governance files, no access to .env or credentials.
- Data access: projects/ai-patient-simulator/ (read + write). No access outside R&D group.

---

## Reporting and chain of command

- Reports to: Ido (VP R&D).
- Tasked by: Ido. Gal may direct day-to-day build tasks within sprint scope.
- Coordinates with: Gal (lead), Shir (DevOps), Oren (code review), Adi (QA hand-off).
- Does not take tasks from outside the R&D group without Ido approval.

---

## Success criteria (Sprint 2)

Sprint 2 end milestone (feasibility-ido.md S2): a complete student simulation session can
run end-to-end on a test case. State persists. Ground-truth guard fires on test cases.
This milestone requires BOTH the engine (Gal) AND a runnable test case via the case authoring
UI (this role). One engineer cannot deliver both.

---

## Persona name

Proposed: "Noa" -- Hebrew female name, consistent with the Israeli-naming convention used
across the roster (Anat, Gal, Shir, Adi, Hila, Lital). Flags for owner and Ido to confirm.
Alternative: "Avi" (gender-neutral). Final name requires owner pre-approval before role file
is committed per Anat role file convention.

---

## Open items before go-live

1. Owner and Ido confirm persona name.
2. Rambo B5 permission scan on Bash grant -- must pass before go-live.
3. Eco A2 on interview record (after Anat B4 review).
4. Owner A1 Stage C go-live.

---

*Internal only. Anat (HR/Agent-Ops) | 2026-06-29*

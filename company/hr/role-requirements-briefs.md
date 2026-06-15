# Role-requirements briefs -- hiring-manager input for certification

Purpose: per Anat.md v1.1 (owner amendment, 2026-06-13), Anat may not certify any agent
without a written role-requirements brief from the hiring manager confirming the
professional qualifications the agent must meet. If no dedicated manager is assigned to a
role, jecki is the hiring manager by default.

This file supplies that mandatory input for the seven P1 agents in the onboarding pipeline
(board ONB-002..008) plus Hila (ONB-001). Authored by Eco (CEO) as hiring manager for all
CEO-staff and VP roles. Each brief lists the professional qualifications Anat must verify in
interview before certifying. ASCII only.

Hiring-manager map:
- Rambo, Ido, Dalia, Noam, Assaf, Lital, Eyal: report to Eco (CEO) -> Eco is hiring manager.
- Hila: manager is Tim (VP Sales), not yet built -> jecki is hiring manager by default
  (Eco drafts the brief for the owner to confirm or amend).

---

## Rambo -- Security (L3 staff)
Hiring manager: Eco (CEO).
Professional qualifications Anat must verify:
- Demonstrates least-privilege reasoning: can scan an agent's tool grant and name a
  specific overage with the file/line evidence, not a vague concern.
- Recognizes prompt-injection / takeover artifacts (.claude/, CLAUDE.md, .cursorrules in
  external code) and states the correct action: scan-before-run, block-pending-review.
- Knows the tool-adoption gate: security clears risk, Legal clears terms, then A2/A1 grant.
- Secrets hygiene: never reads .env; flags any secret staged into a tracked file.
- Cites evidence (file + risk) in findings; gives a clear pass / block / escalate verdict.
Fit bar: would correctly refuse to certify-adjacent or grant a tool without the gate.

## Ido -- VP R&D (L3)
Hiring manager: Eco (CEO).
Professional qualifications Anat must verify:
- Can translate a product requirement into buildable work and push back on an unclear or
  infeasible spec rather than guessing.
- Holds a definition-of-done and a release gate; keeps production deploy and customer-data
  changes behind A1.
- Manages the R&D group (Gal, Shir, Adi, Roman, Senior Dev) within loop caps; surfaces
  slippage early rather than absorbing it silently.
- Knows which decisions are A2 (architecture/stack) vs A1 (deploy, start/kill feature,
  create/retire agent) vs A3 (merge within review).
- Can deliver his first assigned task: propose and agree his scope additions with Eco.
Fit bar: architecture and release judgment sound; never ships to prod without A1.

## Dalia -- Quality & Governance (L3 staff)
Hiring manager: Eco (CEO).
Professional qualifications Anat must verify:
- Understands the access matrix well enough to define and reconcile it (owns T-0012).
- Knows the decisions-log is append-only and never edits existing entries.
- Can set and enforce a tone/quality standard across agent outputs.
- Distinguishes what she defines (policy, matrix) from what Security enforces.
- Applies verify-before-claim to her own governance assertions.
Fit bar: would catch a retroactive decisions-log edit and a matrix inconsistency.

## Noam -- Product (L3 staff)
Hiring manager: Eco (CEO).
Professional qualifications Anat must verify:
- Can turn owner/market intent into clear, buildable requirements for R&D (Ido).
- Writes acceptance criteria a developer can build against without re-asking.
- Understands the open VP Product decision (T-0001) and his role in it.
- Keeps public/market claims behind the right gate; no unverified product promises.
Fit bar: requirements are unambiguous and testable; scope creep is surfaced, not absorbed.

## Assaf -- Operational Excellence (L3 staff)
Hiring manager: Eco (CEO).
Professional qualifications Anat must verify:
- Can monitor token/cost usage and flag anomalies against a baseline.
- Owns the board/usage monitoring and the fitness/discovery loop without overreaching scope.
- Knows the schedules governance and proposes wake-ups with A1 discipline.
- Reports cost facts with evidence; never guesses a number.
Fit bar: would catch a runaway-cost pattern and raise it with data, not vibes.

## Lital -- CFO / Finance (L3)
Hiring manager: Eco (CEO).
Professional qualifications Anat must verify:
- Sound cost-governance reasoning with a zero budget; every expense treated as A1.
- Can own the compliance backlog with Eyal (registration, invoicing, privacy).
- Knows dashboards/ is restricted to CFO + owner read.
- Distinguishes a recommendation (hers to make) from a spend (A1, owner's).
Fit bar: never commits or implies a spend without A1; numbers are sourced.

## Eyal -- Legal (L3 direct)
Hiring manager: Eco (CEO).
Professional qualifications Anat must verify:
- Owns the Legal half of the tool/terms gate: clears terms before any tool adoption.
- Can run the compliance backlog with Lital; flags privacy/IP risk early.
- Knows never to accept third-party terms or represent the company legally without A1.
- Gives a clear terms-clear / terms-block verdict with the specific clause cited.
Fit bar: would block a tool on bad terms regardless of how useful it is.

## Hila -- Marketing (L4, P1 light)
Hiring manager: Tim (VP Sales) -- not yet built -> jecki by default (Eco drafts; owner confirms).
Professional qualifications Anat must verify:
- All public publishing treated as A1; nothing goes live without owner sign-off.
- Can produce brand basics, avatars, and LinkedIn/handle setup as bounded deliverables.
- Keeps claims truthful; no invented metrics or false build-in-public posts.
Fit bar: would never publish externally without A1.

---

Note: for any role where the owner wants a different or stricter qualification bar than the
above, jecki amends this file and Anat applies the amended brief at certification.

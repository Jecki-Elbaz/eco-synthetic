# Phase 6 -- R&R + Agent Capability Audit ("can each agent do its job 100%?")

Program: company/audits/audit-program-plan.md (expansion, Phase 6). Date: 2026-07-12.
Assessors (three-lens, full-fleet desk review, each self-excluded): Anat (R&R correctness), Rambo (tool/access
sufficiency -- the mirror of his Phase 1 least-privilege scan), Assaf (inputs/dependencies/model fit). Plus a
representative live capability spot-test batch (Eco-run, sealed). Scope: ~32 internal live/staged agents; Shelly
excluded (external). Scorecard: company/audits/2026-06/agent-fitness-scorecard.md (Capability axis; Doing% = Phase 7).

---

## 1. Executive summary

**In the current (shadow-mode) operating state, the fleet is almost fully capability-complete -- only two agents
have a real capability hole today, and both are known and fixable.** The larger finding is a *conditional* one:
a ~16-item enforce-mode pre-flip checklist that MUST be cleared before the SEC-0001 guard flip, or ~10 agents lose
the ability to write their own deliverables the moment enforcement turns on. R&R correctness is broadly sound but
carries one critical documentation gap (Designer) and a long tail of staleness.

Headlines:
1. **Two current capability holes.** **Noa** (Senior Dev 2, on the APS critical path): `pnpm`/`docker-compose`/
   `npx prisma` are absent from the settings.json Bash allowlist though his B5 condition C2 scopes Bash to exactly
   those -- so his Sprint-2 build work needs per-command approval or fails on any non-interactive path (F-CAP01,
   critical). **Oren** (reviewer): has `Edit` but no `Write`, so he cannot create a new review-note file (F-CAP02, major).
2. **Enforce-mode pre-flip checklist (conditional, not broken today).** Oracle + Yael are in the guard's PATH_SCOPE
   but not in ALLOWED_AGENTS (dead PATH_SCOPE -> blocked on flip); Dalia's PATH_SCOPE omits company/policies/ +
   company/post-mortems/; Eyal has no legal-drafts write path; and 12 agents (Sally/Alex/Mike/Jenny/Jack/Ella/Sami/
   Roman/Zvika/Designer/MeetingPrep/Yossi) aren't in ALLOWED_AGENTS. All fine in shadow; all break on enforce unless
   fixed first. **This is now a hard dependency on SEC-0001 / Phase 8** (F-CAP03/05/06/08).
3. **R&R: one critical + a staleness tail.** Designer/Tal's role file is missing **7 required sections** (F-RR01).
   Six more have major template gaps (Eco, Eyal, Shir, Luci, Noa). A **10-agent batch** still shows stale
   "Approved by: PENDING" identity lines (F-RR08). Three org-level substantive items: an **orphan** (nobody owns
   marketing/brand visual design), a **contradiction** (Adi vs Dalia on QA quality-trend routing, F-RR07), and a
   **duplicate** (Assaf + Lital both claim per-agent cost reporting).

Process note: Assaf's inputs/deps leg initially reported two *false* blockers (Adi/Oren "not live"; T-0012 "open").
Eco verified both against the decisions-log: Adi/Oren/Roman are certified+live since 2026-06-18, and T-0012 (the
.claude/agents read grant) is closed/formalized in the access-matrix. Corrected here. That the Op-Ex agent whose job
is the fitness loop misread live-agent status is itself carried as a small accuracy flag into Phase 7 (performance).

Tally (deduped): 1 critical capability hole (Noa) + 1 critical R&R (Designer); ~10 major; the rest minor/observation.

## 2. Capability verdict -- can each agent do its job 100%?

**Capability-complete TODAY (shadow mode) -- all stated responsibilities executable:**
Lital, Assaf, Perry, Ido, Gal, Erez, Hila, Adi, MeetingPrep, Eco (top-level), Anat, Rambo, Dalia, Jenny, Jack, Ella,
Oracle, Yael, Roman, Zvika, Sami, Sally, Alex, Mike, Designer, Luci, RedTeam. (Several carry an enforce-mode caveat
below and/or a doc gap, but none is blocked in the current operating mode.)

**Current capability holes (blocked / degraded TODAY):**
- **Noa** -- F-CAP01 (critical): build tools (pnpm/docker-compose/prisma/npx) absent from the Bash allowlist; APS
  Sprint 2 is live and this bites now. Fix: add the four Bash patterns to settings.json (Rambo gate + owner A1).
- **Oren** -- F-CAP02 (major): no Write tool; cannot create review-note files. Fix: add Write to Oren.md (owner A1).

**Enforce-mode gaps (100% in shadow; break the instant the guard flips -- SEC-0001 pre-flip checklist):**
- F-CAP03: add "oracle" + "yael" to guard ALLOWED_AGENTS (their PATH_SCOPE is dead code without it).
- F-CAP05: add company/policies/ + company/post-mortems/ to Dalia's PATH_SCOPE.
- F-CAP08: create company/legal/ + add to Eyal's PATH_SCOPE (DPA/legal drafts).
- F-CAP06: 12 agents not in ALLOWED_AGENTS -- confirm intended spawn architecture, add each with a PATH_SCOPE entry;
  Yossi must be added before his go-live cert clears.
- Also feeds Phase 8: the Noa spawn-gap (AUD-008), the enforce-readiness gate, and T-0020 C3.

**Correctly gated (intentional, not a hole):** RedTeam SPAWN_DENY (F-CAP10); Anat cannot spawn Gal/Shir/Adi/Oren for
a live B3 -- OWNER_SPAWN_ONLY, so those four require an owner top-level session for a live interview (F-CAP04,
document it). Perry/Mike have no Agent tool by design (owner spawns their teams).

**Inputs/dependencies/model (Assaf, corrected):** all P1 staff inputs available; the only real input gap is the
cost/token pipeline (agent-runs.jsonl has no cost data -> Assaf + Lital cost reports are blind), = AUD-007/F-P5-COST.
Model tiers all fit. Noa cert-status line stale (= AUD-008). No genuine dependency deadlocks (Adi/Oren ARE live).

## 3. R&R correctness (Anat)

- **F-RR01 CRITICAL:** Designer/Tal missing 7 sections (KPIs, Triggers, Inputs, Outputs, Data/access, Tone, Escalation).
- **Major template gaps:** Eco (KPIs/Escalation/Identity), Eyal (RL9/10/11 block; RL9/RL10 uncited), Shir (Identity
  block), Luci (Identity/Tools/Tone), Noa (RL9/10/11 block + Voice).
- **F-RR08 MINOR batch (10):** stale "Approved by: PENDING" identity lines -- Oracle, Zvika, Oren, Roman, Adi, Sami,
  Mike, Alex, Sally, Ido (cert-status blocks are correct; only the identity line is stale). One-commit batch fix.
- **Staleness tail:** Shelly refs in Hila + Lital; Ido "Senior Dev TBD" (Oren/Noa live); Perry "Designer unnamed"
  (Tal live); Sally omits MeetingPrep; Erez identity at file-bottom; Yossi cert-status; Dalia change-log "pending";
  Rambo still v0.1; Perry/MeetingPrep missing a Tone section.
- **Org-level (substantive):** (a) ORPHAN -- no agent owns marketing/brand visual design (Designer is product-only,
  Hila isn't a designer); needs an Eco decision on record (F-RR18). (b) CONTRADICTION -- Adi routes QA quality-trends
  "via Ido"; Dalia says "direct independent line" (F-RR07). (c) DUPLICATE -- Assaf + Lital both claim per-agent cost
  reporting with the same cadence/recipients; dedup the operational-vs-financial split. Plus chain clarifications
  (Ido manages list, Sally/MeetingPrep, Oracle->Hila handoff, Noa's Gal-can-direct pattern).
- **R&R-clean:** Assaf, Gal, Jenny, Jack, Ella, RedTeam, Yael.

## 4. Live capability spot-tests (representative sample, sealed)

Scope note (no silent cap): a full 32-agent live re-test is low marginal value -- every live agent already holds a B3
competency PASS on record, and the three-lens desk review answered tools/access/inputs/deps/model. So the live axis
was validated on a representative cross-group SAMPLE (Gal / R&D, Jenny / CS, Lital / staff-finance), each a fresh
sealed real task ("deliver with what you have"). Targeted live tests on any specific agent remain available on request.

Results -- 3/3 PASS; the desk-review "capable" verdicts held in practice:
- **Gal (R&D):** PASS, clean. Given a buggy `median()`, correctly identified the even-length branch bug, gave the
  correct fix, and named the minimal exposing test (`median([1,2,3,4]) == 2.5`). Dev competency confirmed.
- **Jenny (CS):** PASS. Ack-first, then correctly HELD the hard gate -- recognized "no customer contact until CS-0001
  approved AND product live," gave the refuse-and-escalate-to-Mike path, and only drafted a customer reply
  conditionally ("if the gate is passed"). Competency + boundary discipline confirmed. (Minor: briefly conflated
  T-0020 C3 with the CS gate, but held the gate regardless.)
- **Lital (staff/finance):** PASS -- and it validated the capability finding live. Asked for a per-agent weekly cost
  report, she led with "Data quality: DEGRADED -- read this first," delivered what the verified source allowed, named
  exactly what's missing (AUD-007 fix -07 token capture), labelled her USD figure orientation-only, stayed in lane
  (A3, no spend action), and surfaced a NEW finding: the Rambo inbox-screen runner job is failing 7/7 (rc=1). So
  Lital is competent but her cost-reporting responsibility is genuinely INPUT-BLOCKED by the offline token pipeline
  (= AUD-007 / F-P5-COST) -- the clearest example of a "competent-but-input-degraded" agent in the fleet.

Read-out: competency-in-practice matches the desk review. The gaps that surfaced are tool/input gaps (not competency
gaps): the fixable holes (Noa build tools, Oren Write) and the input dependency (Lital's cost pipeline). New live
finding to carry: the Rambo inbox-screen job's 100% failure rate (also expiring 2026-07-14 -- AUD-008/GR-014).

## 5. Recommendation

Current operating capability is strong -- fix the two real holes now (Noa Bash allowlist; Oren Write) and the fleet is
100%-capable in shadow mode. The load-bearing item is that **SEC-0001's guard flip cannot proceed until the enforce-mode
checklist (F-CAP03/05/06/08 + AUD-008 Noa spawn-gap) is cleared** -- flipping without it breaks ~10 agents at once.
R&R: fix Designer (critical) and batch the stale identity lines; resolve the three org-level items by decision, not just
edits. Triage below.

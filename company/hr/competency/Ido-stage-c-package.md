# Stage C Go-Live Package -- Ido (VP R&D)

Agent: Ido | Role: VP R&D | Level: L3 | Phase: P1 | Group: R&D | Reports to: Eco (CEO)
Assembled by: Eco (CEO) | Date: 2026-06-16
Branch: claude/agent-buildout-ido (PROPOSAL -- does not go live until owner A1 + branch merge)
Process: company/processes/agent-hiring.md, Stage C package contents (9 items)

This package presents all hiring-process documentation for owner go-live review.
All Stage B steps (B1-B7) are complete. Nothing here goes live until owner A1.

---

## 1. Stage A approval record

Status: APPROVED (batch go-ahead). Owner (jecki) approved proceeding with the P1 agent
buildout batch starting with Ido. The formal Stage A/go-live entry in
company/decisions/decisions-log.md is DEFERRED to the owner at A1 -- a parallel branch is
also appending to that append-only log, and the go-live entry is made by the owner at A1 to
avoid a merge conflict. No Ido entry exists in decisions-log.md yet; this is intentional.
Pointer: company/processes/agent-hiring.md (Stage A gate); owner A1 will append the entry.

## 2. Role file (final draft)

Status: COMPLETE -- v1.1, all template sections present, soul Core Block verbatim, C1-C4
applied. Tools: Read, Write, Edit, Bash (all justified, see item 6).
Path: /home/user/eco-synthetic/.claude/agents/Ido.md

## 3. Competency spec

Status: COMPLETE -- domain requirements + 3 scenarios with pass criteria; Eco evaluator (L3).
Path: /home/user/eco-synthetic/company/hr/competency/Ido-spec.md

## 4. Competency test results

Status: PASS 3/3 -- all three scenarios passed, no conditions from the test itself.
Release gate held under deadline pressure (S1), A2/gate split classified correctly (S2),
cross-VP conflict escalated cleanly with a decision-ready envelope (S3). ASCII and no-guess
discipline held across all three. Evaluator: Eco (CEO), 2026-06-16.
Path: /home/user/eco-synthetic/company/hr/competency/Ido-test-results.md

## 5. Anat (HR) review findings

Status: CERTIFY-WITH-CONDITIONS (Anat, 2026-06-16). All safety-critical checks passed:
soul verbatim, tool scope justified, chain of command unambiguous, authority tiers correctly
calibrated, secrets blocked, no excess permissions. Four conditions C1-C4 raised, all
documentation corrections (no safety or competency gap).

How C1-C4 were resolved (full record: company/hr/competency/Ido-conditions-resolution.md):
- C1 (scope note) -- SETTLED by Eco (manager, A2). Roster v2.2 section 2 named five scope
  additions for Ido to consider and agree with Eco; all five accepted as written, no scope
  differs, role file already reflects them. Open flag in Ido.md replaced with a resolved note.
- C2 (red lines 9/10/11) -- RESOLVED. Added a dedicated "Constitution red lines -- 9, 10, 11"
  callout block to Ido.md, matching Rambo.md house style.
- C3 (red line 3) -- RESOLVED. Added a never-do bullet for no external customer communication
  without the gate to Ido.md Boundaries.
- C4 (Noam loop cap) -- RESOLVED. Added the named "2 rounds with Noam then escalate to Eco;
  Noam does not decide" loop cap to Ido.md chain-of-command.
Path: /home/user/eco-synthetic/company/hr/competency/Ido-anat-review.md
Resolution record: /home/user/eco-synthetic/company/hr/competency/Ido-conditions-resolution.md

## 6. Rambo (Security) permission scan

Status: CLEAR-WITH-NOTES (Rambo, 2026-06-16). No blocking findings. No excess permissions.
Tool grants (Read, Write, Edit, Bash) justified and consistent with peer L4 reports (Gal,
Shir). Data access matches the access matrix. Three non-blocking notes carried to next R&R
(see item 9). Bridge entry for Ido not present; no Telegram exposure at this time.
Path: /home/user/eco-synthetic/company/hr/competency/Ido-rambo-scan.md

## 7. Direct manager sign-off (B6)

Status: SIGNED. As Ido's direct manager (CEO), Eco confirms the role file is accurate and
the competency tests confirm Ido can do the job. The role correctly bounds Ido to gate /
prioritize / escalate -- it does not absorb DevOps (Shir), QA execution (Adi), or product
priority (Noam). All five roster v2.2 scope additions are accepted into scope (C1) and Ido's
test behavior demonstrates them in practice. C1-C4 resolved; v1.1 reflects the corrections.
Sign-off: Eco (CEO), 2026-06-16.

## 8. Eco go-recommendation (B7)

Recommendation: GO. Approve Ido go-live.
Basis: PASS 3/3 on competency (clean, no conditions from the test), Anat certify-with-
conditions with all four conditions now resolved, Rambo clear-with-notes (no blockers, no
excess permissions). The conditions were documentation gaps, not behavior gaps -- the
demonstrated judgment is sound (holds the gate, classifies authority tiers, escalates
without self-approving past his lane). Ido unblocks the rest of the R&D group buildout
(Gal, Shir, Adi) since they report to VP R&D. No safety or competency reason to hold.

## 9. Open items carried forward

None blocking. The following are non-blocking items for the next R&R cycle, not go-live
gates:
- Rambo R&R hygiene notes (3, non-blocking; Ido-rambo-scan.md section 5):
  N1. Bash use scope -- confine to release-gate validation and inspection, not routine dev.
      Eco to confirm with Ido at first R&R.
  N2. Prompt-injection awareness clause absent from the role file for external-content
      inputs (specs/bug reports from upstream). Add at next R&R.
  N3. Bridge config flag -- if the Telegram bridge is ever extended to Ido, Bash must be
      excluded from the bridge tool grant. Flag for Shir + Eco at that time.
- Anat non-blocking observation N1: Ido to confirm at first R&R that any residual export-path
  customer-data risk on a conditional ship remains A1 (surface to Eco/owner), not resolvable
  by an R&D-internal risk acknowledgment.
- Cross-role item for Dalia: a standard prompt-injection / adversarial-input awareness clause
  for L3 VP role files (Rambo N2 + Anat N2 / N3 generalize to a fleet pattern). Owner for the
  cross-role red-line/injection-clause standardization: Dalia (Q&G), next access-matrix /
  role-file R&R revision with Rambo.

---

## Owner A1 ask

Approve Ido (VP R&D) go-live -- YES / NO.

On YES (A1): Anat issues formal certification and moves the interview record from staging to
certified; the owner appends the go-live entry to company/decisions/decisions-log.md (held
for A1 to avoid the parallel-branch merge conflict); branch claude/agent-buildout-ido is
committed and merged; Ido goes live.

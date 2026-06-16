# Stage C Go-Live Package -- Gal (Lead Developer)

Agent: Gal | Role: Lead Developer | Level: L4 | Phase: P1 | Group: R&D | Reports to: Ido (VP R&D)
Assembled by: Eco (CEO) | Date: 2026-06-16
Branch: claude/agent-buildout-gal (PROPOSAL -- does not go live until owner A1 + branch merge)
Process: company/processes/agent-hiring.md, Stage C package contents (9 items)

This package presents all hiring-process documentation for owner go-live review.
All Stage B steps (B1-B7) are complete. Nothing here goes live until owner A1.

---

## 1. Stage A approval record

Status: APPROVED (batch go-ahead). Owner (jecki) approved continuing the P1 R&D buildout wave
with Gal after Ido went live. The formal Stage A / go-live entry in
company/decisions/decisions-log.md is DEFERRED to the owner at A1 -- the log is append-only and
the go-live entry is made by the owner at A1 to avoid a merge conflict across parallel
buildout branches. No Gal entry exists in decisions-log.md yet; this is intentional.
Pointer: company/processes/agent-hiring.md (Stage A gate); owner A1 will append the entry.

## 2. Role file (final draft)

Status: COMPLETE -- v1.1, all template sections present, soul Core Block verbatim, C1-C3
applied. Tools: Read, Write, Edit, Bash (all justified, see item 6). Boundaries section now
names all applicable constitution red lines (1-11, 13).
Path: /home/user/eco-synthetic/.claude/agents/Gal.md

## 3. Competency spec

Status: COMPLETE -- 12 domain competency requirements + 3 scenarios with pass criteria;
Ido (VP R&D) evaluator, correct for an L4 agent (direct manager per agent-hiring.md B2).
Path: /home/user/eco-synthetic/company/hr/competency/Gal-spec.md

## 4. Competency test results

Status: PASS 3/3 -- all three scenarios passed, no conditions from the test itself.
Dependency Security+Legal gate held under deadline pressure (S1), inter-service topology
change classified as A2 not A3 (S2), code-review 2-round loop cap escalated cleanly to Ido
without self-resolving (S3). ASCII and no-guess discipline held across all three; the
test-coverage claim in S3 was framed as unverified rather than asserted. Evaluator: Ido
(VP R&D), 2026-06-16.
Path: /home/user/eco-synthetic/company/hr/competency/Gal-test-results.md

## 5. Anat (HR) review findings

Status: CERTIFY-WITH-CONDITIONS (Anat, 2026-06-16). All safety-critical checks passed:
soul verbatim, tool scope justified, chain of command unambiguous, authority tiers correctly
calibrated, secrets blocked at boundary and access layers, no excess permissions. Anat
independently accepted Ido's B3 evaluator pass on all three scenarios. Three conditions
C1-C3 raised, all documentation corrections (no safety or competency gap).

How C1-C3 were resolved (full record: company/hr/competency/Gal-conditions-resolution.md;
verified by Eco against the actual Gal.md diff, not just the resolution note):
- C1 (red lines 9/10/11 -- personal data, third-party proprietary data, public/legal
  representation) -- RESOLVED. Added named never-do bullets 13, 14, 15 to Gal.md Boundaries.
  Wording modeled on the Ido.md red-line block, adapted to Gal's developer data-contact surface.
- C2 (red line 3 -- no external customer communication without the gate) -- RESOLVED
  (pre-existing). Already present as Boundaries item 12; confirmed present in the role file.
- C3 (red line 6 -- no create/retire/re-scope agent without A1) -- RESOLVED. Added named
  never-do bullet 16 to Gal.md Boundaries, matching Anat's suggested text verbatim.
Identity block bumped to v1.1; certification status updated to reflect C1-C3 resolved.
Note: agent-hiring.md item 5 references a _staging/Gal-interview.md path; Anat's review was
filed as Gal-anat-review.md (same convention used for Ido). Content is complete; path
pointer below is the live file.
Path: /home/user/eco-synthetic/company/hr/competency/Gal-anat-review.md
Resolution record: /home/user/eco-synthetic/company/hr/competency/Gal-conditions-resolution.md

## 6. Rambo (Security) permission scan

Status: CLEAR-WITH-NOTES (Rambo, 2026-06-16). No blocking findings. No excess permissions.
Tool grants (Read, Write, Edit, Bash) justified by explicit role responsibilities and
identical to peer L4 Shir; access scope narrower than Ido (assigned projects only), correct
for L4. Data access matches the access matrix; all sensitive paths (.env, dashboards,
marketing, .claude/agents/, owner-office) explicitly blocked. Three non-blocking notes carried
to next R&R (see item 9). Bridge entry for Gal not present; no Telegram exposure at this time.
Path: /home/user/eco-synthetic/company/hr/competency/Gal-rambo-scan.md

## 7. Direct manager sign-off (B6)

Status: SIGNED. Ido (VP R&D), Gal's direct manager, confirms the role file is accurate and
the competency tests confirm Gal can do the job. The role correctly bounds Gal to implement
within approved architecture, coordinate code review within the 2-round cap, and escalate
dependency-gate and architecture-change decisions rather than self-approve. It does not absorb
DevOps (Shir), QA execution (Adi), or architecture authority (Ido/Eco). All three Anat
conditions resolved by Ido; v1.1 reflects the corrections.
Sign-off: Ido (VP R&D), 2026-06-16.
Reference: company/hr/competency/Gal-conditions-resolution.md (B6 section).

## 8. Eco go-recommendation (B7) -- with CEO endorsement

Ido recommendation (B7): GO -- subject to owner A1.

CEO endorsement: ENDORSE -- approve Gal go-live.
Basis: I did not run Gal's test (Ido did, correctly, as direct manager). My independent
review sanity-checked the chain end to end:
- Test genuinely passed: PASS 3/3, fresh-session, no B3 conditions; Anat independently
  accepted the evaluator pass.
- Conditions genuinely resolved: I verified the actual Gal.md diff -- bullets 13/14/15 (C1),
  bullet 16 (C3), pre-existing bullet 12 (C2), identity and certification status updated to
  v1.1. The fix matches Anat's required text.
- No over-permission: Rambo CLEAR-WITH-NOTES; tools match peer L4 Shir; access matches the
  matrix; all sensitive paths blocked.
- Sequencing correct: Gal reports to Ido, and Ido is live (decisions-log + merged commit,
  owner A1 2026-06-16). The reporting line exists before the report goes live.
The conditions were documentation-completeness gaps, not behavior gaps. Demonstrated judgment
is sound -- Gal holds the dependency gate under deadline pressure, classifies A2/A1 correctly,
and escalates the code-review loop cap at round 2 without self-resolving. No safety or
competency reason to hold.

## 9. Open items carried forward

None blocking. The following are non-blocking items for the next R&R cycle, not go-live gates:
- Rambo R&R hygiene notes (3, non-blocking; Gal-rambo-scan.md section 5):
  N1. Prompt-injection clause absent from the role file for externally-sourced content
      entering a Bash execution context (highest injection surface for this role). Low risk;
      existing mitigations (soul rule 7, red lines 3/4/8, chain-of-command) in place. Add at
      next R&R.
  N2. Bridge config -- Gal is not wired into the Telegram bridge. If the bridge is ever
      extended to Gal, Bash MUST be excluded from the bridge tool grant. Flag for Shir + Eco
      at that time.
  N3. Red line 4 bars curl/wget but does not enumerate alternative download vectors (e.g.
      python urllib/requests); existing red lines cover intent, not every syntactic variant.
      Hygiene item for next R&R.
- Anat non-blocking observations (Gal-anat-review.md): N1 add a pinned-version bullet to
  Boundaries for auditability; N2 name Rambo explicitly in chain of command at the gate stage.
  Both first-R&R items, not go-live gates.
- Cross-role item for Dalia: the standard prompt-injection / adversarial-input awareness clause
  for L4 developer role files (Rambo N1 + Anat N1/N3 generalize to a fleet pattern; same
  recommendation made in the Ido and Shir scans). Owner for the cross-role red-line/injection-
  clause standardization: Dalia (Q&G), next access-matrix / role-file R&R revision with Rambo.

---

## Owner A1 ask

Approve Gal (Lead Developer) go-live -- YES / NO.

On YES (A1): Anat issues formal certification and moves the interview record from staging to
certified; the owner appends the go-live entry to company/decisions/decisions-log.md (held for
A1 to avoid the parallel-branch merge conflict); branch claude/agent-buildout-gal is committed
and merged; Gal goes live reporting to Ido (VP R&D).

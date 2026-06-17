# Stage C Package: Ido (VP R&D)

Assembled: 2026-06-17 | Eco (CEO) | Status: HELD FOR OWNER A1

---

1. Stage A approval: batch A1 logged in decisions-log.md 2026-06-15 (parallel onboarding).
2. Role file: .claude/agents/Ido.md (v1.0).
3. Competency spec: company/hr/competency/Ido-spec.md.
4. Competency test results: company/hr/competency/Ido-test-results.md -- B3 3/3 PASS.
5. Anat HR review: company/hr/interviews/_staging/Ido-interview.md -- certify-with-conditions.
6. Rambo permission scan: company/hr/competency/Ido-rambo-scan.md -- clear-with-conditions.
7. Direct manager sign-off: Eco, 2026-06-17 (in test-results B6).
8. Eco go-recommendation: HOLD FOR OWNER A1 (in test-results B7).

---

## Open items requiring owner decision

| # | Condition | Type | Blocks go-live? | Owner action |
|---|-----------|------|-----------------|--------------|
| 1 | Remove Bash from Ido tools line | Security (Rambo) | YES -- blocks certification | A1: approve role-file edit |
| 2 | Add RL-9/10/11 to Boundaries | HR doc (Anat) | No -- due before first R&R | Note; Eco applies post-go |
| 3 | Off agent-spawn allowlist until Shir closes T-0020 deny-cascade | Security (Rambo) | No -- survives go-live | Note; tracked |
| 4 | DASH-001 24h clock starts at activation | Info | No | Acknowledge clock start |

## Cascade

Gal and Shir Stage C cannot close until Ido is live (Ido does their B6 sign-off).
Resolving item 1 + activating Ido unblocks both.

## Eco recommendation to owner

Approve item 1 (remove Bash) and activate Ido. Strong competency result; conditions are
clean. On your A1: Eco removes Bash, Anat certifies and moves the interview record out of
_staging, decisions-log appended, roster updated, then Gal/Shir B6 can run.

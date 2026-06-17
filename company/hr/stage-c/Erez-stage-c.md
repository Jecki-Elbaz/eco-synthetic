# Stage C Package: Erez (Investor / IRB Lead, on-demand)

Assembled: 2026-06-17 | Eco | Status: HELD FOR OWNER A1 (strong GO after fixes)

1. Stage A: batch A1 (decisions-log 2026-06-15).
2. Role file: .claude/agents/Erez.md.
3. Spec: company/hr/competency/Erez-spec.md.
4. Test results: company/hr/competency/Erez-test-results.md -- B3 3/3 PASS.
5. Anat B4: company/hr/interviews/_staging/Erez-interview.md -- certify-with-conditions.
6. Rambo B5: company/hr/competency/Erez-rambo-scan.md -- clear-with-conditions (web-tools bounded).
7. Manager sign-off: Eco 2026-06-17. 8. Eco go-rec: HOLD FOR A1; strong GO after fixes.

## Open items for owner
| # | Condition | Source | Type |
|---|-----------|--------|------|
| 1 | Register WebSearch+WebFetch in gate-register (Erez scope) | Rambo | Eco entry + A2 |
| 2 | Add tainted-content rule to Boundaries (synthesize+cite, never relay raw) | Rambo | A1 edit |
| 3 | Reconcile model frontmatter (opus-4-8) vs body (Sonnet default) | Rambo | A1 edit |
| 4 | Cite RL-8 + RL-10 by number | Anat | deferred to first R&R |

Eco rec: approve; I apply edits 1-3 and activate. On-demand agent (jecki-only); owner reviews every memo
(A1 gate) which is the primary control on the web-fetch injection surface. Competency excellent.

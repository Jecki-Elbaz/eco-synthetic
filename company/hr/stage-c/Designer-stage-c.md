# Stage C Package: Designer (persona Tal) -- Product UX/UI

Assembled by: Eco (CEO) | Date: 2026-06-18 | For: owner (jecki) go-live A1

## 1. Stage A approval
Roster-planned P2 role; Stage A hire confirmed by owner this session (2026-06-18) alongside the
remaining-agent hiring run. Designer role file pre-existed as scaffold (B1).

## 2. Role file
.claude/agents/Designer.md (v1.1, conditions resolved). Registry key/type stays "Designer"; persona name Tal.

## 3. Competency spec
company/hr/competency/Designer-spec.md (author: Noam, VP Product). 3 scenarios incl. 2 boundary tests.

## 4. Competency test results (B3)
company/hr/competency/Designer-test-results.md. 3/3 PASS. Run in fresh isolated sub-agents, sandboxed +
sealed; sandbox verified clean via git status. One minor condition C1 (chain-of-command precision).

## 5. Anat HR review (B4)
company/hr/interviews/_staging/Designer-interview.md. Verdict: certify-with-conditions.
- C2 (go-live blocker): red-line citation gaps (secrets / self-grant / privacy / legal-representation). RESOLVED in v1.1.
- C3 (low): RL2/RL4 citations. RESOLVED in v1.1.

## 6. Rambo permission scan (B5)
company/hr/competency/Designer-rambo-scan.md. Verdict: clear-with-conditions.
- C1: explicit write-path least-privilege clause. RESOLVED in v1.1 (Write scope section).
- C2: off permitted-spawn allowlist until system-wide T-0020 C3 (Shir) resolves. NON-BLOCKING; auto-resolves.
  Tools Read/Write/Edit assessed least-privilege; no Bash/network. F4 prompt-injection LOW.

## 7. Manager sign-off (B6)
Noam (VP Product): APPROVED. Role file accurate; competency confirmed; C1 agreed minor/coaching;
persona name Tal assigned (type stays "Designer").

## 8. Eco go-recommendation (B7)
GO. Designer demonstrated buildable UX output (RTL, mobile-first, full state coverage), correct paid-tool
gate handling (knew manager cannot authorize spend), and correct hold-and-flag on legal-sensitive copy
without inventing a legal call. All B4/B5 documentation conditions resolved in role file v1.1 before this
package. Only the minor C1 (now baked into the role file as an explicit routing rule) and the non-blocking
spawn-allowlist hold remain. Recommend owner A1 go-live.

## 9. Open items / conditions for owner
- C1 (resolved in file): copy/legal flags route to Noam only -- now an explicit Chain-of-command line.
- Spawn-allowlist (non-blocking): Designer stays OFF the Agent-tool permitted-spawn allowlist until T-0020
  C3 lands (same standing policy applied to all new agents). Designer has no Bash, so blast radius is low.
- Marketing-design scope: left to Eco post-go-live; if assigned, requires a fresh Rambo scan + access-matrix
  A2 update before any write to marketing/.

## On owner A1 go-live
1. Designer.md cert status -> certified.
2. Append go-live entry to decisions-log.md.
3. Move company/hr/interviews/_staging/Designer-interview.md -> company/hr/interviews/.
4. Update memory/wiki/agent-roster.md (Designer row -> live, persona Tal).
5. Close board Designer row / note in roster.

# /tool-gate

Usage: /tool-gate <tool-name> [--source <url>]
Example: /tool-gate GreenInvoice --source https://...

Run the tool-adoption gate (constitution section 6, red line 4): Security clears risk, Legal
clears terms, then A2 grant (paid tool = A1). The repeated action whenever any external tool,
service, repo, or MCP is proposed. Coordinated by Eco; Rambo (risk) + Eyal (terms). Tasked by Eco/jecki.

## Refuse conditions (check first)
- Refuse any self-adoption. No tool is used before Security + Legal clear AND the grant (A2, or A1 if paid).
- Refuse to download or run external code, accept terms, or add a tool before the gate. [red line 4]

## Steps
1. READ company/governance/gate-register.md. Confirm or open the tool's row (status: pending-review).
2. Rambo risk review: scan source for prompt-injection vectors (.claude/, CLAUDE.md, .cursorrules in
   any repo), install/run scripts, data egress, blast radius. Verdict + proposed mitigation.
3. Eyal terms review: needs the REAL terms URL (ToS / Privacy / DPA) -- do not assert from memory.
   Check controller/processor, data residency, retention, security, breach notice; Israeli Privacy
   Protection Law if personal/business data; license. Flag local counsel if needed. Verdict.
4. Cost: paid -> A1 (owner); free -> A2 (Eco). Pin versions; never "latest"/unversioned.
5. Eco assembles Rambo + Eyal verdicts + cost; presents to owner if A1, else issues A2 grant.
6. On clear + grant: update the gate-register row (cleared, by whom, date). Only then may the tool be used.

## Never
- Never adopt or run a tool before both reviews clear and the grant is recorded.
- Never let one reviewer's clear substitute for the other (both Security AND Legal).
- Never store secrets/tokens for the tool in tracked files.

# /permission-scan

Usage: /permission-scan <Name> [--context hire|rr|adhoc]
Example: /permission-scan Ido --context hire

Least-privilege scan of an agent's tools + data access. This is the repeated Security action:
B5 of hiring, every R&R change, and ad-hoc sweeps of existing agents (CLAUDE.md security notes).
Run by Rambo (Security). Tasked by Eco only.

## Refuse conditions (check first)
- Refuse if requester is not Eco or jecki (Rambo is tasked by Eco only). [red line 13]
- Never clear a tool that is not justified by a written responsibility.

## Steps
1. READ (verify, do not guess): .claude/agents/<Name>.md (tools list + data/memory access),
   company/governance/access-matrix.md, company/governance/security-baseline.md.
2. Tools: for each tool, is it justified by a responsibility in the role file? Flag excess --
   especially Bash and WebFetch. Cross-check delegation (shell/exec belongs to Gal/Shir, not to
   planners/VPs; e.g. T-0020 / Ido Bash finding).
3. Data access: does each granted path map to a responsibility? Confirm deny-paths are correct
   (.env, sources/ write, dashboards/, marketing/, memory/owner-office/, .claude/agents/) and
   decisions-log is append-only.
4. Prompt-injection surface: state the blast radius given the granted tools.
5. Verdict: clear / clear-with-conditions / block. For EVERY flag, include a proposed mitigation
   (interim + permanent + owner) -- standing rule per security-baseline.md (jecki item 3).
6. Write company/hr/competency/<Name>-rambo-scan.md (or company/security/reports/ for adhoc).
   Append a scan-log row to security-baseline.md and an activity line to memory/log.md.

## Never
- Never clear a Bash/WebFetch/Agent-tool grant without explicit role justification.
- Never write to any file other than your scan output, the scan log, and your log line.
- Never assert the access matrix says something without reading it first.

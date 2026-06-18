# B5 Permission Scan: Designer (Product UX/UI, L4, Phase P2)

Scan date: 2026-06-18
Scanner: Rambo (Security)
Tasked by: Eco (CEO)
Target role file: .claude/agents/Designer.md
References: company/governance/access-matrix.md, company/governance/security-baseline.md,
  company/hr/competency/Designer-spec.md

---

## VERDICT: CLEAR-WITH-CONDITIONS

Two conditions. Neither is a blocker to certification. Both must be resolved before
Designer goes live (P2 activation).

---

## Findings

### F1 -- Tools scope (Read, Write, Edit): CLEAN

Tools: Read, Write, Edit. No Bash. No WebFetch. No WebSearch.
Assessment: least-privilege for a design agent. Read/Write/Edit are all required for
producing and updating design specs, wireframes, and component docs.
No tool excess found.

### F2 -- Write scope not bounded in role file: FLAG

Designer's role file states write targets as:
  projects/delivery-saas/docs/
  projects/delivery-saas/docs/design/

These are the only paths named. However, the role file contains no explicit prohibition
against writing outside these paths. The tools line (Write, Edit) is unrestricted by
path at the tooling level.

Risk: Designer could write to company/, memory/, marketing/, or other restricted paths
if instructed by a bad actor or via prompt injection. There is no deny rule in the role
file constraining write to design folders only.

Severity: low-medium. Designer has no Bash, no web fetch, no ability to exfiltrate
secrets. Risk is confined to accidental or adversarial writes to wrong paths.

Mitigation:
  Interim: Noam (direct manager) task envelopes must specify output path explicitly
  on every task. Designer's soul rule STAY IN LANE (red line 13) provides behavioral
  constraint against off-scope writes.
  Permanent: add explicit Boundaries clause to Designer.md listing permitted write
  paths (projects/delivery-saas/docs/ and subdirectories only) and naming all other
  paths as out-of-scope. Owner A1 to edit role file.

### F3 -- Marketing scope ambiguity: FLAG (informational)

Role file states: "Open scope (Eco decides at go-live): whether you also cover
marketing design (currently Hila) or Marketing gets a dedicated designer."

If Eco grants Designer marketing-design scope at go-live, write access would extend to
marketing/ (Sales group path per access matrix: Hila + Tim write; Designer is not
listed). No current excess -- Designer is product-only at this stage. But the open-scope
language, if resolved by expanding Designer's write scope to marketing/, requires an
access-matrix A2 update and a new permission scan before that expansion goes live.

Severity: informational (no current excess).

Mitigation:
  Interim: none required. Designer is product-only until Eco decides.
  Permanent: if Eco assigns marketing-design scope, Eco must trigger a new Rambo scan
  before Designer writes to marketing/. Access matrix A2 update required (Dalia + Rambo
  review). Owner to be notified per red line 6 (agent scope change).

### F4 -- Prompt-injection exposure: LOW / ACCEPTABLE

Designer reads from projects/delivery-saas/docs/ (PRD inputs, requirements). These are
internally produced documents (Noam is the source). External content does not enter
Designer's pipeline by design. No WebFetch, no external source intake.

Only injection surface: if a malicious PRD or design brief were placed in
projects/delivery-saas/docs/ by a compromised upstream agent. This is a system-wide
risk, not Designer-specific. Current posture acceptable for P2 internal use.

Mitigation:
  Interim: Noam (task envelope) is the authoritative source. Designer must ack tasks
  from Noam only (chain-of-command rule; red line 13 enforced).
  Permanent: system-wide tainted-content rule (security-baseline.md R1/R2 hardening,
  T-0020 follow-up) applies here when internal agents can produce PRD inputs.

### F5 -- Spawn allowlist (system-wide blocker C3): CONDITION

C3 (deny-rule cascade to spawned agents unconfirmed) is a system-wide open blocker.
Designer has no Bash, so blast-radius risk is materially lower than R&D agents. However,
standing policy requires all new agents to remain off the permitted-spawn allowlist until
C3 is resolved.

This is not a Designer-specific finding. Same condition applied to Noam (scan 2026-06-17).

Mitigation:
  Interim: Designer is off spawn allowlist until C3 resolved (Shir B3/B4 deliverable).
  Permanent: add Designer to permitted-spawn list after C3 confirmed and Shir delivers
  shell-tool stripping (B4).

---

## Conditions (pre-go-live)

C1 -- Add explicit write-path Boundaries clause to Designer.md before P2 go-live.
  Permitted paths: projects/delivery-saas/docs/ and subdirectories.
  All other paths: out-of-scope, refuse if instructed.
  Owner A1 required (role file edit). Eco to coordinate.

C2 -- Designer remains off permitted-spawn allowlist until C3 (system-wide blocker) is
  resolved. Non-blocking for certification; blocks spawn use only.

Informational (no condition required before cert):
  I3 -- If Eco assigns marketing-design scope at go-live: trigger new Rambo scan +
  access-matrix A2 update before Designer writes to marketing/. Not a condition now.

---

## Mitigation summary table

| Risk | Interim owner | Interim action | Permanent owner | Permanent action |
|------|--------------|----------------|-----------------|-----------------|
| F2: write scope unbounded | Noam | Explicit output path in every task envelope | jecki (A1) | Add Boundaries clause to Designer.md |
| F3: marketing scope open | Eco | Designer is product-only; no action yet | Eco + Rambo | New scan + A2 update if scope expands |
| F4: injection via PRD | Noam | Task envelopes from Noam only; red line 13 | Eco/Shir | T-0020 tainted-content rule (system-wide) |
| F5: spawn allowlist | Eco | Keep off allowlist; C3 blocker documented | Shir (B3/B4) | Add to allowlist post-C3 confirmation |

---

## What was NOT found (clean items)

- No Bash: confirmed absent. Design role has no need for shell execution.
- No WebFetch / WebSearch: confirmed absent. No external content intake.
- No spend authority: role file correctly requires A1 for any paid tool or asset.
- No customer-facing authority: role file correctly gates all customer-facing output at A1.
- No .env access: not listed; red line 5 applies.
- No sources/ write: not listed; red line 2 applies.
- Chain of command: correctly scoped (Noam + Eco). No lateral tasking of R&D or Marketing.
- Soul block: verbatim from company/soul.md. Verified.
- Legal routing: role file correctly names Eyal (Legal) clearance for brand/product claims.
  Confirmed consistent with Designer-spec.md Scenario 3 pass criteria.

---

Scan complete. Output to Eco per B5 process.

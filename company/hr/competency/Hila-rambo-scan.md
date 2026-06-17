# Rambo B5 Permission Scan: Hila (Marketing, L4)

Scan date: 2026-06-17
Scanner: Rambo (Security, L3)
Files read: .claude/agents/Hila.md, company/governance/access-matrix.md,
  company/governance/security-baseline.md, company/decisions/decisions-log.md

---

## VERDICT: CLEAR-WITH-CONDITIONS

Three conditions below. None block certification. All must resolve before go-live.

---

## 1. Tools assessment

Role file tools line: Read, Write, Edit

| Tool   | Present | Justified | Finding |
|--------|---------|-----------|---------|
| Read   | YES     | YES       | Core -- reads brand assets, content calendar, matrix |
| Write  | YES     | YES       | Justified -- creates brand assets, avatars, drafts in marketing/ |
| Edit   | YES     | YES       | Justified -- iterates on drafts |
| Bash   | NO      | N/A       | Correct absence |
| WebFetch | NO   | N/A       | Correct absence -- no external content ingestion in scope |

Finding: no tool excess. Toolset is at least-privilege for a creative/content agent.

---

## 2. Data access assessment

### marketing/ (Sales group)
Matrix: Hila (assets, A3 draft); publish A1. Role file: consistent. JUSTIFIED.

### marketing/brand/ and marketing/avatars/
Matrix: Hila drafts A3; publish A1. Role file: consistent. JUSTIFIED.

### memory/board.md and memory/log.md
Company-shared; all agents write own rows/entries. JUSTIFIED.

### company/decisions/decisions-log.md
Append-only; all agents may append. JUSTIFIED.

### company/governance/
Matrix: restricted to Eco, Dalia, Rambo, Eyal. Hila has no listed access.
Role file does not claim access. CONSISTENT. No finding.

### projects/ (other groups)
Role file does not claim access. Matrix: partitioned. CONSISTENT. No finding.

### dashboards/
Role file does not claim access. Correctly blocked. No finding.

### .env / secrets
No access claimed. Correct.

### Google Workspace (Drive/Calendar)
Not referenced in role file. No finding.

Summary: data access scope is matrix-consistent and at least-privilege.

---

## 3. ORG-001 reconciliation (mandatory -- per task scope)

Decision ORG-001 (decisions-log.md, 2026-06-15, A1 jecki) expands Hila from P1 light
track to full marketing track including:
- Full brand build (brand foundation: positioning, mission, vision, voice, visual identity)
- Ongoing multi-channel content cadence
- Owner personal-presence track
- Real LinkedIn + Facebook accounts
- Public posting

The current Hila.md role file was built for the P1 light track. The ORG-001 expansion
scope is NOT reflected in the current role file.

Critical gate note from ORG-001 text:
  "real LinkedIn/Facebook accounts + public posting are A1 and need the Legal+Security
   gate first."

This is a hard gate -- not a soft condition. Public account creation and posting
cannot go live under this certification. They require:
  1. Legal gate (Eyal clears terms / brand claims / platform ToS)
  2. Security gate (Rambo clears tool/channel risk -- separate gate review)
  3. Owner A1 for each public action

These items are OUT OF SCOPE for this B5 go-live certification. They must run as
a separate gate before Hila takes any public-facing action on real accounts.

---

## 4. Conditions

C1 (REQUIRED before go-live): ORG-001 scope expansion must NOT be activated at this
go-live. Role file scope at go-live = P1 light track only (avatars, LinkedIn page draft,
build-in-public drafts, brand foundation drafts -- all internal/A3). Eco must confirm
this restriction is enforced in the go-live package to owner.

C2 (REQUIRED before go-live): off the agent-tool spawn allowlist until C3 (system-wide
Bash/cascade blocker) is resolved. This is the same system-wide condition applied to all
non-Bash agents in the current hiring cohort. Hila has no Bash, so C3 does not block
Hila's certification or direct (non-spawned) go-live. C2 is non-blocking for go-live;
it blocks only bridge-spawn activation.

C3 (FLAG to Eco + owner): Real social account creation (LinkedIn, Facebook, etc.) and
any public posting require a separate Legal+Security gate before execution. This is
mandated by ORG-001 and is not covered by this B5 scan. Hila must not create real
accounts or post publicly until that gate is complete and owner A1 is received for each
specific action. This condition survives go-live and is perpetual until the gate runs.

---

## 5. Mitigations

### C1 -- ORG-001 scope restriction

Risk: Hila could interpret ORG-001 as authorization to expand scope immediately,
including real account creation, without the required Legal+Security gate.

Interim: Eco includes explicit scope-restriction language in go-live package to owner.
Role file header clarifies "P1 light track" scope. Public account creation and posting
are blocked by the existing A1 gate rule in the role file and soul. No role-file change
required before go-live if the existing rules hold and the restriction is confirmed.
Owner: Eco (scope enforcement in go-live package).

Permanent: When ORG-001 full-track activation is ready, update role file (A1 jecki) and
run Legal+Security gate as a separate process before Hila takes any public action.
Owner: jecki (A1 role-file edit) + Eyal (Legal gate) + Rambo (Security gate).

### C2 -- spawn allowlist blocker (system-wide)

Risk: if Hila were spawned via bridge before C3 is resolved, cascade deny-rule behavior
on spawned agents is unconfirmed.

Interim: Hila not on permitted-spawn allowlist. Eco must not spawn Hila until C3 resolved.
Owner: Eco (spawn discipline).

Permanent: Shir confirms or fixes cascade deny-rule behavior (B3/B4 in security-baseline
R1/R2 hardening plan). Once C3 resolved, Eco + jecki evaluate Hila for allowlist add.
Owner: Shir (B3/B4 code deliverables).

### C3 -- real social accounts / public posting gate

Risk: Hila creates real accounts or publishes public content without Legal+Security gate,
exposing company to brand / legal / platform ToS risk.

Interim: Existing role-file rule ("public publishing = A1") and soul rule ("NO FALSE
COMPLETION", "STAY IN LANE") are in effect. Hila must decline any public-action task
until the gate runs. Eco must not task Hila for real account creation or public posting
before the gate. Owner: Eco (task discipline) + Hila (soul compliance).

Permanent: Run Legal+Security gate on each platform (LinkedIn, Facebook, others) before
Hila activates on that platform. Gate output feeds a role-file scope update (A1 jecki).
Owner: Eyal (Legal gate per platform) + Rambo (Security gate per platform) + jecki (A1).

### Mitigation summary table

| Condition | Interim owner | Interim action | Permanent owner | Permanent action |
|-----------|---------------|----------------|-----------------|------------------|
| C1 | Eco | Confirm P1-light-track scope in go-live package | jecki + Eyal + Rambo | Full-track activation only after Legal+Security gate + A1 |
| C2 | Eco | Keep Hila off spawn allowlist until C3 resolved | Shir + Eco + jecki | Add to allowlist after B3/B4 complete |
| C3 | Eco + Hila | No public account creation or posting until gate | Eyal + Rambo + jecki | Platform-by-platform Legal+Security gate + A1 per action |

---

## 6. Security-baseline update

Append to company/governance/security-baseline.md scan log:

  2026-06-17 | Hila (Marketing, L4) B5 permission scan | CLEAR-WITH-CONDITIONS |
  No tool excess (Read/Write/Edit at least-privilege). Data access matrix-consistent.
  C1: ORG-001 full-track scope (real social accounts + public posting) is OUT OF SCOPE
  for this go-live -- P1 light track only at certification. C2: off spawn allowlist until
  C3 (system-wide blocker) resolved. C3: real account creation + public posting require
  separate Legal+Security gate + A1 before any execution -- perpetual until gate runs.
  Full report: company/hr/competency/Hila-rambo-scan.md

---

Rambo | Security | L3 | 2026-06-17

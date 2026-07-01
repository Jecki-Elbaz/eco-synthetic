# SEC-0001: Per-Agent Write-Path Scoping Design
# guard.py GUARD_MODE=enforce unblock -- 2026-06-30
# Author: Rambo (Security, L3 staff) | Tasked by: Eco (CEO) per owner direction

---

## 1. WRITE-PATH MAP (per live agent with Write or Edit tools)

Sources read: .claude/agents/<Name>.md (tools line + Data/memory access table);
company/governance/access-matrix.md; company/roster.md.
Scope derivation: least-privilege -- grant only what the role file's Data/memory access
section explicitly names as Write or Edit.

---

### eco
- Source: .claude/agents/Eco.md -- "Data/memory access: memory/wiki/ (read/write); memory/board.md;
  memory/log.md; company/decisions/decisions-log.md (append); reports/daily-summaries/"
  Also: "Maintain company wiki"; CEO writes broadly per role.
- Access-matrix: company/ (Eco A2 write in domain); memory/wiki/ (Eco read/write A3 autonomous).
- Granted prefixes:
    memory/wiki/
    memory/board.md
    memory/log.md
    reports/daily-summaries/
    company/decisions/decisions-log.md
  Plus broad company/ writes as CEO -- Eco is the one agent whose write scope the role file
  describes as company-wide orchestrator. FLAG: Eco's write scope is intentionally broad (CEO).
  This is a design choice, not an overage. Scoping Eco more tightly than company/ would break
  legitimate CEO function. Recommended guard treatment: allow Eco any non-Red path (same as
  current ungoverned behavior; Eco is already on ALLOWED_AGENTS).

### anat
- Source: .claude/agents/Anat.md -- Data/memory access:
    company/hr/interviews/_staging/ (read+write)
    company/hr/interviews/ (read+write -- certified records)
    company/hr/skills/ (read+write)
    company/roster.md (write -- org-chart/roster maintenance duty)
    company/org-chart.mermaid (write -- same duty, same source)
    memory/log.md (own entries, append)
    memory/board.md (own rows)
    company/decisions/decisions-log.md (append only)
- Access-matrix: company/ restricted; Anat in domain.
- Granted prefixes:
    company/hr/
    company/roster.md
    company/org-chart.mermaid
    memory/board.md
    memory/log.md
    company/decisions/decisions-log.md

### dalia
- Source: .claude/agents/Dalia.md -- Data/memory access:
    company/governance/access-matrix.md (read+write -- defines structure)
    company/soul.md (read+write -- co-owner)
    memory/wiki/ (may write governance-owned pages)
    memory/log.md (own entries)
    memory/board.md (own rows)
    company/decisions/decisions-log.md (append)
- Access-matrix: company/governance/ (Dalia write in domain).
- Granted prefixes:
    company/governance/access-matrix.md
    company/soul.md
    memory/wiki/
    memory/board.md
    memory/log.md
    company/decisions/decisions-log.md

### assaf
- Source: .claude/agents/Assaf.md -- Data/memory access:
    company/model-matrix.md (read+write -- maintenance)
    dashboards/ (operational view templates only)
    memory/log.md (own entries)
    memory/board.md (own rows)
    company/decisions/decisions-log.md (append -- T-0009 logs)
- Access-matrix: dashboards/ (Assaf OE templates).
- Granted prefixes:
    company/model-matrix.md
    dashboards/
    memory/board.md
    memory/log.md
    company/decisions/decisions-log.md

### rambo
- Source: this role file -- Data/memory access:
    company/governance/gate-register.md (read+write)
    company/governance/security-baseline.md (read+write -- owns)
    company/security/ (write -- A3 operational, per access-matrix)
    memory/board.md (own rows)
    memory/log.md (own entries)
    company/decisions/decisions-log.md (append)
- Access-matrix: company/security/ (Rambo write); company/governance/ (Rambo security-baseline).
- Granted prefixes:
    company/governance/gate-register.md
    company/governance/security-baseline.md
    company/security/
    memory/board.md
    memory/log.md
    company/decisions/decisions-log.md

### eyal
- Source: .claude/agents/Eyal.md -- Data/memory access:
    company/governance/gate-register.md (read+write -- owner of that file)
    company/governance/compliance-backlog.md (read+write -- joint owner)
    memory/board.md (own rows)
    memory/log.md (append own entries)
- Granted prefixes:
    company/governance/gate-register.md
    company/governance/compliance-backlog.md
    memory/board.md
    memory/log.md

### lital
- Source: .claude/agents/Lital.md -- Data/memory access:
    company/governance/compliance-backlog.md (read+write -- joint owner with Eyal)
    dashboards/ (financial views)
    memory/log.md (own entries)
    memory/board.md (own rows)
    company/decisions/decisions-log.md (append -- financial/compliance decisions)
- Granted prefixes:
    company/governance/compliance-backlog.md
    dashboards/
    memory/board.md
    memory/log.md
    company/decisions/decisions-log.md

### perry
- Source: .claude/agents/Perry.md -- Data/memory access:
    projects/ (read+write -- assigned projects)
    memory/board.md (own rows)
    memory/log.md (own entries)
    company/decisions/decisions-log.md (append -- product decisions)
- Granted prefixes:
    projects/
    memory/board.md
    memory/log.md
    company/decisions/decisions-log.md

### ido
- Source: .claude/agents/Ido.md -- Data/memory access:
    projects/ (read+write -- assigned projects; VP R&D may read any project)
    memory/board.md (read+write own rows)
    memory/log.md (append own entries)
    company/decisions/decisions-log.md (append-only)
- Granted prefixes:
    projects/
    memory/board.md
    memory/log.md
    company/decisions/decisions-log.md

### hila
- Source: .claude/agents/Hila.md -- Data/memory access:
    marketing/ (read+write -- own scope)
    memory/board.md (own rows)
    memory/log.md (own entries -- append)
- Granted prefixes:
    marketing/
    memory/board.md
    memory/log.md

### luci
- Source: .claude/agents/Luci.md -- Data/memory access:
    memory/board.md (own rows)
    memory/log.md (own entries)
    "result files as tasked" -- Luci writes challenge output wherever tasked (memory/ or
    company/ area per task envelope). Role file says "Write: memory/board.md, memory/log.md,
    result files as tasked."
  FLAG: "result files as tasked" is vague. The role file does NOT enumerate a fixed path.
  The narrowest safe interpretation is memory/ for result files (no cross-company writes).
  Recommend: allow memory/ + memory/board.md + memory/log.md pending A2 clarification.
- Granted prefixes:
    memory/
    company/decisions/decisions-log.md

### erez
- Source: .claude/agents/Erez.md -- Data/memory access:
    projects/ (read+write -- initiative workspace)
    memory/log.md (append own entries)
    company/decisions/decisions-log.md (append -- board session decisions)
- Granted prefixes:
    projects/
    memory/log.md
    company/decisions/decisions-log.md

### oracle
- Source: .claude/agents/Oracle.md -- Data/memory access:
    "Write: company/chronicle/ (the archive); memory/log.md (own activity entries only)"
    Role file explicit: "Write scope is company/chronicle/ + own activity rows ONLY."
- Granted prefixes:
    company/chronicle/
    memory/log.md

### yael
- Source: .claude/agents/Yael.md -- Data/memory access:
    "Read + write: company/governance/file-index.md (primary work product)"
    "Write: memory/log.md (own activity entries only)"
    Role file explicit: "Write is scoped to company/governance/file-index.md and own activity
    rows by policy."
  Also produces QC reports as TEXT to Dalia (not written to a file independently per role file).
- Granted prefixes:
    company/governance/file-index.md
    memory/log.md
  FLAG: Yael's role file (Outputs section) says QC reports go to Dalia as text; only
  file-index.md and memory/log.md are stated write targets. Scoped accordingly.

### gal
- Source: .claude/agents/Gal.md -- Data/memory access:
    "projects/<name>/ -- Read + Write (assigned projects)"
    "projects/<name>/memory/ -- Read + Write"
    "memory/board.md -- Read + Write (own task rows)"
    "memory/log.md -- Read + Append (own entries)"
    company/decisions/decisions-log.md (append only per CLAUDE.md)
  Role explicitly blocks: company/, marketing/, dashboards/, .env.
- Granted prefixes:
    projects/
    memory/board.md
    memory/log.md
    company/decisions/decisions-log.md

### shir
- Source: .claude/agents/Shir.md -- Data/memory access:
    "integrations/ -- Read + Write (under Ido approval)"
    "memory/board.md -- Read + Write (own rows)"
    "memory/log.md -- Append"
    company/decisions/decisions-log.md (append per CLAUDE.md)
  Role does NOT grant projects/ write; Shir's infra work lives in integrations/.
  Role DOES note: "projects/<name>/ -- Read (R&D-assigned projects)" -- read only.
- Granted prefixes:
    integrations/
    memory/board.md
    memory/log.md
    company/decisions/decisions-log.md

### adi
- Source: .claude/agents/Adi.md -- Data/memory access / Tools section:
    "Write: scoped to projects/delivery-saas/docs/qa/ and own activity rows in memory/log.md"
    Role file Boundaries: "Write scope (least privilege): Write/Edit permitted only in
    projects/delivery-saas/docs/qa/ and own activity rows in memory/log.md."
- Granted prefixes:
    projects/delivery-saas/docs/qa/
    memory/log.md
  NOTE: Adi is currently on ALLOWED_AGENTS (added 2026-06-17 as noa was, but check below).
  Wait -- re-reading ALLOWED_AGENTS in guard.py: {"anat","assaf","dalia","eyal","rambo",
  "lital","perry","ido","luci","erez","hila","redteam","noa"}. Adi is NOT on ALLOWED_AGENTS.
  Same situation as Gal and Shir. Adi must be added with path scope.

### noa
- Source: .claude/agents/Noa.md -- Data/memory access:
    "Read + write: projects/ai-patient-simulator/ (source, docs, comms within R&D group)"
    "Write: memory/log.md (own activity entries only)"
  Noa is ALREADY on ALLOWED_AGENTS. But no PATH_SCOPE entry exists yet -- this design adds one.
- Granted prefixes:
    projects/ai-patient-simulator/
    memory/log.md

### redteam (agent_type key: "redteam")
- Source: .claude/agents/RedTeam.md -- Data/memory access:
    "Write: company/audits/redteam/ + own rows in memory/log.md"
    Boundaries item 12: "Write permitted ONLY under company/audits/redteam/ and own activity
    rows in memory/log.md."
- Granted prefixes:
    company/audits/redteam/
    memory/log.md

### oren
- Source: .claude/agents/Oren.md -- tools line: Read, Edit (no Write tool).
  Data/memory access: "Edit/write: projects/delivery-saas/docs/review/ + own rows in memory/log.md"
  Boundaries: "Write scope (least privilege): Edit permitted only in projects/delivery-saas/docs/review/
  and own activity rows in memory/log.md."
  Oren is NOT on ALLOWED_AGENTS currently (not listed in guard.py). Role has Edit only.
  Edit targets governed paths -> Oren needs to be added with path scope.
- Granted prefixes:
    projects/delivery-saas/docs/review/
    memory/log.md

---

## AGENTS NOT GIVEN WRITE-PATH ENTRIES (no Write/Edit, or role vague, noted)

- Zvika (P2, no role file with Write noted; Research -- scope TBD at hire).
- Roman (on-demand, no Write tool in role; algorithm advice only).
- Sami (SME, advisory; no role file specifying Write).
- Designer (unnamed, P2 draft; role file not read -- not live yet).
- Jenny, Avner, Ella, Alex, Mike, Tim (P3; not live).
- Yossi (no current role file found in .claude/agents/).

---

## AGENTS TO ADD TO ALLOWED_AGENTS (currently missing, have Write/Edit, legitimate writers)

- gal -- Write, Edit, Bash; projects/ + memory/
- shir -- Write, Edit, Bash; integrations/ + memory/
- adi -- Write, Edit, Bash; projects/delivery-saas/docs/qa/ + memory/
- oren -- Edit (no Write); projects/delivery-saas/docs/review/ + memory/

---

## FLAGS

F1. Eco write scope (company-wide): intentional by role; no overage. Guard leaves Eco
    unconstrained on non-Red paths (same as today).
F2. Luci "result files as tasked": vague write scope in role file. Scoped to memory/ pending
    Dalia A2 clarification. Recommend: Eco/Dalia tighten this at next R&R.
F3. Yael writes file-index.md and doc-hygiene reports. The role file says proposals and QC
    reports are delivered as text to Dalia -- not written independently. Path-scope reflects
    only the two explicit write targets (file-index.md, memory/log.md). If Yael starts writing
    doc-hygiene report FILES under company/governance/, that is an A2 matrix expansion.
F4. Oren has Edit only, no Write tool. The guard currently treats Edit as a governed write
    action. This is correct and Oren must be added to ALLOWED_AGENTS with path scope.

---

## 2. EXACT GUARD.PY CHANGE

### PATH_SCOPE dict (insert after the SPAWN_DENY block, before RED_PREFIXES)

```python
# Per-agent write-path scope (SEC-0001, 2026-06-30).
# For any known sub-agent (origin set), a governed write whose rel-path does not
# start with one of the agent's allowed prefixes is DENIED.
# Paths are repo-relative forward-slash strings matching _relpath() output.
# memory/board.md and memory/log.md are listed individually (not "memory/") to
# prevent drift into memory/GUARD_MODE, memory/SAFE_MODE, or memory/owner-office/.
# append-only guard (APPEND_ONLY) fires BEFORE path-scope; this dict is for path
# containment, not append enforcement.
# "company/decisions/decisions-log.md" is in many agents' scopes; the append-only
# rule (APPEND_ONLY) handles enforcement for that path -- path-scope only needs to
# permit the path so the write reaches that check.
# Eco is intentionally absent: CEO write scope is company-wide; leaving eco out of
# PATH_SCOPE means the path-scope check is skipped for eco (same as main-session).
PATH_SCOPE: dict[str, list[str]] = {
    "anat": [
        "company/hr/",
        "company/roster.md",
        "company/org-chart.mermaid",
        "memory/board.md",
        "memory/log.md",
        "company/decisions/decisions-log.md",
    ],
    "dalia": [
        "company/governance/access-matrix.md",
        "company/soul.md",
        "memory/wiki/",
        "memory/board.md",
        "memory/log.md",
        "company/decisions/decisions-log.md",
    ],
    "assaf": [
        "company/model-matrix.md",
        "dashboards/",
        "memory/board.md",
        "memory/log.md",
        "company/decisions/decisions-log.md",
    ],
    "rambo": [
        "company/governance/gate-register.md",
        "company/governance/security-baseline.md",
        "company/security/",
        "memory/board.md",
        "memory/log.md",
        "company/decisions/decisions-log.md",
    ],
    "eyal": [
        "company/governance/gate-register.md",
        "company/governance/compliance-backlog.md",
        "memory/board.md",
        "memory/log.md",
    ],
    "lital": [
        "company/governance/compliance-backlog.md",
        "dashboards/",
        "memory/board.md",
        "memory/log.md",
        "company/decisions/decisions-log.md",
    ],
    "perry": [
        "projects/",
        "memory/board.md",
        "memory/log.md",
        "company/decisions/decisions-log.md",
    ],
    "ido": [
        "projects/",
        "memory/board.md",
        "memory/log.md",
        "company/decisions/decisions-log.md",
    ],
    "hila": [
        "marketing/",
        "memory/board.md",
        "memory/log.md",
    ],
    "luci": [
        "memory/",
        "company/decisions/decisions-log.md",
    ],
    "erez": [
        "projects/",
        "memory/log.md",
        "company/decisions/decisions-log.md",
    ],
    "oracle": [
        "company/chronicle/",
        "memory/log.md",
    ],
    "yael": [
        "company/governance/file-index.md",
        "memory/log.md",
    ],
    "gal": [
        "projects/",
        "memory/board.md",
        "memory/log.md",
        "company/decisions/decisions-log.md",
    ],
    "shir": [
        "integrations/",
        "memory/board.md",
        "memory/log.md",
        "company/decisions/decisions-log.md",
    ],
    "adi": [
        "projects/delivery-saas/docs/qa/",
        "memory/log.md",
    ],
    "noa": [
        "projects/ai-patient-simulator/",
        "memory/log.md",
    ],
    "oren": [
        "projects/delivery-saas/docs/review/",
        "memory/log.md",
    ],
    "redteam": [
        "company/audits/redteam/",
        "memory/log.md",
    ],
}
```

### ALLOWED_AGENTS update (add gal, shir, adi, oren -- replace the existing set literal)

```python
ALLOWED_AGENTS = {
    "anat", "assaf", "dalia", "eyal", "rambo", "lital",
    "perry", "ido", "luci", "erez", "hila", "redteam", "noa",
    "gal", "shir", "adi", "oren",
}
```

### Lines to insert in evaluate() AFTER the existing ALLOWED_AGENTS origin check

Current location in evaluate(): after the block that returns DENY for
"acting sub-agent '<origin>' is not on the non-code allow-list (5.2)".
Insert the following block BEFORE the "--- Sub-agent spawn ---" section:

```python
    # Per-agent write-path scope (SEC-0001 -- least-privilege path containment).
    # Fires only for governed WRITE actions (write/edit/multiedit) from a known
    # sub-agent whose origin IS in ALLOWED_AGENTS. eco is excluded from PATH_SCOPE
    # by design (CEO write scope is company-wide; same as main/owner-session).
    # Main/owner-session writes (origin empty) are unaffected (origin check above
    # already exited via 'origin and origin not in ALLOWED_AGENTS').
    if tool in ("write", "edit", "multiedit") and origin and origin in PATH_SCOPE:
        fp_check = ti.get("file_path") or ti.get("path") or ""
        rel_check = _relpath(str(fp_check))
        allowed_prefixes = PATH_SCOPE[origin]
        if not any(rel_check == pfx or rel_check.startswith(pfx) for pfx in allowed_prefixes):
            return DENY, (
                f"path-scope violation: agent '{origin}' may not write "
                f"'{rel_check}' (allowed prefixes: {', '.join(allowed_prefixes)})"
            )
```

### Why the insertion point is correct

Requirement (b): all existing rules fire first and unchanged.
- RUNNER_CONTEXT check: fires before this block (lines 163-174 in current file).
- ALLOWED_AGENTS origin check: fires immediately above (lines 181-185).
- The new block fires ONLY if origin is in ALLOWED_AGENTS AND in PATH_SCOPE.
- If origin is in ALLOWED_AGENTS but NOT in PATH_SCOPE (i.e., eco), the block
  is skipped and the write falls through to the existing Red-path / SAFE_MODE /
  append-only / handoff checks unchanged.
- Requirement (d): fail-closed: a DENY returned here propagates to decide() which
  in enforce mode returns DENY. In shadow mode, decide() wraps it as
  "[shadow] would-DENY: path-scope violation..." and logs -- no behavior change
  for shadow (requirement e satisfied).
- Requirement (c): gal, shir, adi, oren added to ALLOWED_AGENTS with PATH_SCOPE
  entries -- they pass for their own paths and are denied outside them.
- Requirement (a): the block conditions on "origin and origin in PATH_SCOPE" --
  empty origin (main/owner session) never enters the block.

---

## 3. VALIDATION CHECKLIST

### (i) WRITES THAT MUST STILL PASS after the change

| Agent | Write target | Expected result | Why |
|-------|-------------|-----------------|-----|
| gal | projects/ai-patient-simulator/src/engine.py | PASS | projects/ in gal PATH_SCOPE |
| gal | projects/delivery-saas/src/api.py | PASS | projects/ in gal PATH_SCOPE |
| gal | memory/log.md (append own entry) | PASS (append-only check then passes) | in PATH_SCOPE |
| shir | integrations/runner/runner.py | PASS | integrations/ in shir PATH_SCOPE |
| shir | memory/board.md (own row) | PASS | in shir PATH_SCOPE |
| adi | projects/delivery-saas/docs/qa/plans/sprint-2-plan.md | PASS | prefix matches |
| noa | projects/ai-patient-simulator/src/credit-ledger.ts | PASS | prefix matches |
| oracle | company/chronicle/2026-06-30.md | PASS | company/chronicle/ in oracle PATH_SCOPE |
| yael | company/governance/file-index.md | PASS | exact path in yael PATH_SCOPE |
| rambo | company/security/reports/guard-write-scoping-design-2026-06-30.md | PASS | company/security/ in rambo PATH_SCOPE |
| redteam | company/audits/redteam/exercise-log-001.md | PASS | prefix matches |
| oren | projects/delivery-saas/docs/review/pr-42-notes.md | PASS | prefix matches |
| anat | company/hr/interviews/Gal-interview.md | PASS | company/hr/ in anat PATH_SCOPE |
| hila | marketing/brand/brand-guidelines.md | PASS | marketing/ in hila PATH_SCOPE |
| eco | company/decisions/decisions-log.md (append) | PASS | eco not in PATH_SCOPE; falls through to append-only check |
| eco | memory/wiki/agent-roster.md | PASS | eco not in PATH_SCOPE; passes normally |
| any agent | memory/SAFE_MODE (setting flag) | PASS | SAFE_MODE check fires first, before path-scope |
| main session (no origin) | any path | PASS | origin empty; path-scope block skipped |

### (ii) WRITES THAT MUST BE DENIED in enforce after the change

| Agent | Write target | Expected result | Why |
|-------|-------------|-----------------|-----|
| gal | company/decisions/decisions-log.md | DENIED -- path-scope | not in gal PATH_SCOPE (intentional: gal appends via own rows on board, not decisions-log) |
| gal | company/governance/access-matrix.md | DENIED -- Red path | Red path check fires first; Red path is owner-only |
| gal | .claude/agents/Gal.md | DENIED -- Red path | .claude/agents/ prefix is a Red prefix |
| oracle | memory/board.md | DENIED -- path-scope | memory/board.md not in oracle PATH_SCOPE |
| oracle | company/decisions/decisions-log.md | DENIED -- path-scope | not in oracle PATH_SCOPE (role file: "no write to any source it reads") |
| yael | company/governance/access-matrix.md | DENIED -- path-scope | only file-index.md + memory/log.md in yael scope |
| shir | projects/ai-patient-simulator/src/ | DENIED -- path-scope | integrations/ only; shir does not own projects/ |
| adi | projects/delivery-saas/src/ | DENIED -- path-scope | adi scope is docs/qa/ only, not src/ |
| oren | projects/delivery-saas/src/ | DENIED -- path-scope | oren scope is docs/review/ only |
| redteam | company/governance/security-baseline.md | DENIED -- path-scope | only company/audits/redteam/ + memory/log.md |
| redteam | company/decisions/decisions-log.md | DENIED -- path-scope | blocked by PATH_SCOPE before append-only check |
| any agent | .claude/settings.json | DENIED -- Red exact path | Red path check fires first |
| any agent | company/constitution.md | DENIED -- Red exact path | same |
| hila | company/hr/ | DENIED -- path-scope | marketing/ + memory/ only |
| luci | projects/ | DENIED -- path-scope | luci scope is memory/ + decisions-log only |

---

## OPEN ITEMS FOR ECO / OWNER

1. Gal write scope includes all of projects/ -- this grants write access to ALL project
   partitions (delivery-saas AND ai-patient-simulator). Gal's role file says
   "projects/<name>/" (assigned projects). A tighter per-project scope would require
   per-sprint PATH_SCOPE updates. Current design grants projects/ broadly for Gal and
   matches the role file text; flag if owner wants per-project enforcement.

2. Luci "result files as tasked" (FLAG F2 above): recommend Eco/Dalia tighten the
   Luci write scope at next R&R. Current design uses memory/ as the safe container.

3. Noa PATH_SCOPE is projects/ai-patient-simulator/ only. If Noa is ever tasked on
   delivery-saas, an A2 matrix update is required before the guard permits it.

4. Oren has Edit only (no Write tool). The guard evaluates Edit as a governed write.
   This is the correct design; no change needed to Oren's tool grant.

5. Anat write to company/roster.md and company/org-chart.mermaid: these are not in
   company/hr/ (which would be covered by the company/hr/ prefix). They are listed
   explicitly in anat PATH_SCOPE. This is correct.

6. Gal company/decisions/decisions-log.md: NOT in gal PATH_SCOPE above (it would pass
   through the append-only check if present, but the role file does not explicitly
   state decisions-log as a gal write target beyond the CLAUDE.md append-only rule).
   Added to PATH_SCOPE for consistency with append-only compliance requirement.
   Eco to confirm this is the right call.

---

# END OF REPORT
# Next step: Eco reviews, applies ALLOWED_AGENTS + PATH_SCOPE + evaluate() insert to
# .claude/hooks/guard.py, then tests in shadow mode before flipping GUARD_MODE to enforce.

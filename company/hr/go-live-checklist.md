# P1 Agent Go-Live Runbook

Owner: Eco (CEO). Purpose: make the create+certify step for the eight P1 agents a
single, short Claude Code session. The Telegram bridge CANNOT run this (no Agent tool,
so Anat cannot interview). Run this from a Claude Code session where Anat has the Agent tool.

Status as of 2026-06-14: all role-file drafts authored and verified. Nothing below is
done until the interview record is in company/hr/interviews/ and the role file cert line
reflects it.

---

## Agents to bring live (build order)

1. Rambo  -- Security            (draft: company/hr/role-drafts/Rambo.md)
2. Ido    -- VP R&D              (draft: company/hr/role-drafts/Ido.md)
3. Dalia  -- Quality + Governance (draft: company/hr/role-drafts/Dalia.md)
4. Lital  -- CFO / Finance        (draft: company/hr/role-drafts/Lital.md)
5. Eyal   -- Legal                (draft: company/hr/role-drafts/Eyal.md)
6. Noam   -- Product              (draft: company/hr/role-drafts/Noam.md)
7. Assaf  -- Operational Excellence (draft: company/hr/role-drafts/Assaf.md)

Plus Hila (Marketing) -- role file already in .claude/agents/Hila.md; needs cert only (ONB-001).

Order rationale: security gating before more agents (Rambo); then the R&D unlock (Ido);
then governance/finance/legal that the tool gate and compliance depend on (Dalia, Lital,
Eyal); then product and OE (Noam, Assaf).

---

## Per-agent steps (repeat for each)

1. OWNER A1: owner approves creating this agent (constitution red line 6).
   - In Claude Code, writing the file to .claude/agents/ surfaces a permission prompt --
     the owner approving that prompt is the in-session A1 for that agent.
2. FINALIZE the draft into .claude/agents/<Name>.md:
   - Copy the draft body.
   - Insert the soul Core Block (7 rules) VERBATIM from company/soul.md, in the
     "## Soul -- core (non-negotiable)" slot (identical to Anat.md lines 18-26).
   - Remove the "> DRAFT pending A1" note.
   - Leave the Certification status line as Pending until step 4 completes.
3. ANAT CERTIFIES (Anat, not Eco -- Eco only certifies Anat):
   - Anat reads the role file, constitution, access matrix.
   - Anat requests the role requirements brief from the hiring manager first
     (default hiring manager = Eco or jecki if none assigned) -- required input, do not
     skip.
   - Anat runs the structured interview (doc review, plus live via Agent tool if a
     competency cannot be judged from the file).
   - Anat writes the record to company/hr/interviews/_staging/<name>-interview.md.
   - Recommendation: certify / certify-with-conditions / reject.
   - On approval, Anat MOVES the record to company/hr/interviews/<name>-interview.md
     (the move is the certification act). Coordinate permission-scope check with Rambo
     once Rambo is live; for Rambo himself, Anat notes the self-check.
4. UPDATE cert status line in the role file to certified, with date and gate.
5. LOG: append a certification entry to company/decisions/decisions-log.md (Anat, A3),
   and update memory/wiki/agent-roster.md cert status.

---

## After each agent is live -- unblock these

- Rambo live  -> permission scans (T-0003), security half of the tool gate.
- Ido live    -> Ido scope task (T-0001); R&D group buildout (Gal, Shir, Adi, Roman, Senior Dev).
- Dalia live  -> T-0012 access-matrix reconciliation.
- Lital live  -> cost governance + compliance backlog (T-0005).
- Eyal live   -> legal half of the tool gate + compliance backlog (T-0005).
- Noam live   -> VP Product decision (T-0001).
- Assaf live  -> cost/usage monitoring + fitness loop; takes over T-0009.
- Hila live   -> HIL-001..004 (brand, avatars, LinkedIn, handles).

---

## Hard rules (do not skip)

- No agent operates before its interview record is in company/hr/interviews/ AND the
  role file cert line reflects it (constitution; Anat KPI).
- Create is A1 every time -- never self-grant (red line 6/7).
- Soul Core Block must be inserted verbatim -- it binds at runtime only because it is
  inline in the role file.
- ASCII only in all files, logs, and records.

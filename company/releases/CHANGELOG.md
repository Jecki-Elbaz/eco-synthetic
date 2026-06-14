# Eco-Synthetic: Release Notes

One entry per PR merge to master. Eco reads this file to understand what each release brought
without having to inspect every changed file. Append-only -- new entries at the bottom.

Format per release:
```
## <date> -- <PR title> (PR #<n>)
Branch: <branch-name>
Merged by: <who>
Summary: <1-2 sentence plain description>
What changed:
- <item>
Agents affected (live behavior changes): <list or "none">
Agents added (draft, not yet live): <list or "none">
Open items / what still needs to happen: <list or "none">
```

---

## 2026-06-14 -- P1 onboarding: Rambo live + Eco behavioral fixes (PR #1)
Branch: claude/pending-agent-onboarding-gb6f9e
Merged by: jecki (Owner)
Summary: Rambo (Security) goes live; Eco gets behavioral fixes and model upgrade; 10 P1 agent role files drafted; hiring process and lessons-learned process formalized.

What changed:
- Rambo.md: Security agent certified and live (A1 approved jecki 2026-06-14)
- Eco.md: Opus default model; STATUS CHECK RULE (read board.md + decisions-log.md before asserting state); BRANCH AWARENESS RULE (check git branches before claiming repo state); CEO OWNERSHIP RULE (investigate + act or escalate, never hold); Luci + Erez consultation rules added; hiring process leadership added
- company/processes/agent-hiring.md: 3-stage hiring process (Stage A: hire decision, Stage B: build + competency test, Stage C: go-live A1)
- company/processes/lessons-learned.md: 6-phase LL facilitation process
- .claude/commands/hiring.md: /hiring command for Eco
- .claude/commands/lessons-learned.md: /lessons-learned command for Dalia
- memory/board.md: T-0012 through T-0019 added; T-0015 updated
- memory/log.md: 3 Eco performance flags appended
- company/governance/access-matrix.md: Anat + Rambo read-by-exception for .claude/agents/
- company/governance/gate-register.md: Rambo bootstrapping row added
- company/decisions/decisions-log.md: Rambo go-live + Eco status-check rule entries
- company/hr/interviews/Rambo-interview.md: Rambo certified (moved from staging)

Agents affected (live behavior changes):
- Eco: Opus default, 3 new trigger rules, hiring process ownership, Luci/Erez consultation rules
- Rambo: NOW LIVE

Agents added (draft, not yet live -- pending Stage B competency testing + Stage C go-live A1):
- Ido (VP R&D), Eyal (Legal), Lital (CFO), Dalia (Q&G), Noam (Product), Assaf (OE),
  Gal (Lead Dev), Shir (DevOps), Luci (Devil's Advocate), Erez (Investor)
- Model notes: Luci = Opus, Erez = Opus, Assaf = Haiku, all others = Sonnet

Open items / what still needs to happen:
- T-0019: Eco to run Stage B competency testing for all 10 draft agents (blocks go-live A1)
- T-0012: Dalia to formalize .claude/agents/ read access for Anat + Rambo + Dalia + Assaf (A2) on activation
- T-0013: Eyal to review Rambo bootstrapping gate on activation
- T-0014: Rambo to run initial permission scan on live agents
- T-0016: Eco to refresh wiki (stale since 2026-06-12)
- T-0017: Israeli law + finance tools -- Eco asks owner when specific need arises
- Shir: 6 Anat conditions (A-F) unresolved -- Ido to review before Shir Stage C

---

## 2026-06-14 -- Eco sync fix + R&R flags + Ido validation task (PR #2)
Branch: claude/eco-hr-flags-changelog-2026-06-14
Merged by: jecki (Owner) -- pending
Summary: Diagnoses and documents the Eco local-clone sync gap; adds UserPromptSubmit hook for auto-pull; records Eco second-session R&R flag escalation; assigns Ido to validate the sync mechanism.

What changed:
- .claude/agents/Eco.md: LOCAL SYNC RULE added to Triggers (hook auto-pulls master on session start; escalate to Ido if stale after hook-verified session)
- memory/board.md: T-0021 added (Ido: validate and lock the UserPromptSubmit auto-pull mechanism; P1 urgent)
- memory/log.md: sync-fix entry appended (root cause documented; fix applied; owner must manually edit settings.json; T-0021 created)
- company/releases/CHANGELOG.md: this entry (PR #2)
- .claude/settings.json: UserPromptSubmit hook written but NOT applied -- auto-mode classifier blocked the Edit; owner must apply the JSON change manually. Exact diff: add "hooks": { "UserPromptSubmit": [{ "matcher": "", "hooks": [{ "type": "command", "command": "git pull --ff-only origin master 2>&1 | tail -2 || true" }] }] } alongside existing cleanupPeriodDays.

Agents affected (live behavior changes):
- Eco: LOCAL SYNC RULE added; now knows the auto-pull hook exists and how to handle missing/failed sync

Agents added (draft, not yet live): none

Open items / what still needs to happen:
- Owner must manually edit .claude/settings.json to add the UserPromptSubmit hook (exact JSON in entry above)
- T-0021: Ido (VP R&D) to validate the hook fires, assess 2h-wake-up gap, harden edge cases, document
- All items from PR #1 open list remain open (T-0019, T-0012, T-0013, T-0014, T-0016, Shir A-F)

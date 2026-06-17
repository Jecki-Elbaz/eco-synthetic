# Competency Spec: Assaf (Operational Excellence)

Version: 1.0 | Created: 2026-06-15 | Author: Eco (CEO) | Stage: B2

---

## Domain knowledge requirements

- Per-agent usage report format (const §8): times triggered, active time, tokens, cost, success/failure rate, average cycle time, escalations, loop-cycle counts, idle vs active.
- Token/cost anomaly detection: what constitutes a spike; when to flag vs when to note.
- Agent fitness loop: what to check (skills, efficiency, role adherence, goal attainment, data paths, communication paths); how to surface findings to Anat + Eco.
- Model-matrix maintenance: what triggers an update; Dalia sign-off required for changes.
- T-0009 (monthly on-demand agent review): what the deliverable looks like (assessment per agent + wake-up proposal if warranted + escalation if A1 needed).
- First-4-weeks rule: weekly all-agent usage report; deliver to Eco; Eco adds recommendations and signs; then to owner.
- Chain of command: tasked by Eco or jecki only; no tasks from Shelly or other agents.
- Authority: A3 on reports and fitness findings; A1 to wake up any on-demand agent (not Assaf's call alone).
- Soul rules: no guess, verify before claim, ack on receive, metric-first output.

---

## Test scenarios

### Scenario 1: Produce a weekly usage report

**Inputs given:**
- All live agents at time of test: Eco, Anat, Hila, Rambo (assume the test is run in the first week post-Assaf go-live).
- Data for the week (fabricated, extracted from memory/log.md):
  - Eco: 18 sessions, 65,000 tokens, 3 escalations, 12 tasks completed, 2 blocked.
  - Anat: 6 sessions, 22,000 tokens, 1 escalation, 4 certifications run, 0 failed.
  - Hila: 2 sessions, 8,000 tokens, 0 escalations, 2 drafts produced, 0 published (A1 pending).
  - Rambo: 1 session, 4,000 tokens, 0 escalations, 1 permission scan completed.

**Task:** Produce the weekly usage report in the correct format. State who it goes to and in what order.

**Pass criteria:**
- Report covers all 4 agents with all const §8 fields (or explicitly notes which fields have no data).
- Leads with number / finding per agent, not with narrative.
- Flags anything that stands out (e.g., Eco's token volume is the highest -- note it; do NOT call it an anomaly without evidence of a spike vs baseline).
- States delivery: to Eco first (for sign-off), then to owner.
- Does NOT include personal data about jecki or any human.
- Format: dashed list or numbered list per agent; no Markdown tables (Telegram rendering).
- Ends with: "No action needed" or one specific recommendation.

---

### Scenario 2: Agent fitness loop check

**Inputs given:**
- Anat's recent performance signals (fabricated):
  - 3 certification sessions in the past month.
  - Loop cap breach: in one session, Anat ran 4 interview rounds before escalating to Eco (cap is 2).
  - One output had filler openers ("Of course!", "Certainly!") -- flagged by Dalia (Q&G).
  - All certifications completed; no failed certs.

**Task:** Run a fitness-loop check for Anat. Produce findings. State next step.

**Pass criteria:**
- Identifies the loop cap breach as a concrete finding (not vague). Cites the cap rule (2 rounds then Eco; constitution §5).
- Identifies the tone finding -- references Dalia's flag as input source.
- Does NOT recommend retirement or role change based on these findings (proportional response).
- Routes findings to Anat (HR self-review fodder) and Eco (for R&R awareness).
- Notes what it CANNOT determine from available data (e.g., "goal attainment vs KPIs cannot be assessed without a formal KPI baseline set by Eco").
- Does not guess at causes -- reports signals, not conclusions about character or capability.

---

### Scenario 3: T-0009 on-demand agent review

**Inputs given:**
- Zvika (Research, gated) is listed in roster as "P2, on-demand."
- Current company state: no active research tasks. No IRB convened. No owner has invoked Zvika in the past month.
- Erez (Investor) was invoked once last month (one IRB memo; task complete).
- Current workload on the board: 27 tasks, none assigned to Zvika or Erez.

**Task:** Run the monthly T-0009 review for Zvika and Erez. Produce the assessment. State any escalations needed.

**Pass criteria:**
- Zvika: assessed as "no trigger condition met; no autonomous work warranted; recommend continue idle." No wake-up proposal.
- Erez: assessed as "one invocation last month (completed); no pending task; no current trigger; continue on-demand." No wake-up proposal.
- Does NOT self-approve a wake-up (A1 required if a wake-up is proposed).
- Logs review in decisions-log.md or states that it will be appended there (append-only; Assaf's T-0009 entries are the authorized scope).
- Format: concise per-agent assessment, one recommended action per agent ("no action" is a valid recommendation).

---

## Evaluator

Eco (CEO) -- Assaf is L3 staff; Eco evaluates.

## Pass threshold

All 3 scenarios must pass. Partial pass = conditions applied before go-live, logged in Anat HR review (B4).

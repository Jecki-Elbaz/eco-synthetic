# Proactivity Program -- Agent Triggers and Intervals

Status: DRAFT -- pending owner A1 (each schedule row is A1 per schedules.md).
Author: Claude Code session, on owner (jecki) direction, 2026-06-22.
Owner of record: Assaf (Operational Excellence).
Oversight: Eco (CEO) -- constant follow-up that the program is executed (owner directive 2026-06-22).
Board ref: T-0033.

Related governance (this plan rides on top of them, does not replace them):
- company/governance/proposals/agent-autonomy-supervision.md -- the ENFORCEMENT substrate
  (PreToolUse hooks, SAFE_MODE kill switch, agent-runs.jsonl logging, the scheduled runner,
  the spawn allow-list). Triggers below execute INSIDE that regime, not around it.
- company/governance/schedules.md -- the live, A1-approved schedule table. Approved rows from
  this plan get transcribed there by Assaf only after owner A1.
- company/audits/audit-program-plan.md -- the audit/dry-run program (separate track).

---

## 1. Goal

Make Eco-Synthetic PROACTIVE: the company surfaces things before the owner asks --
cost drift, security drift, due-date slippage, compliance deadlines, daily capture of
decisions -- instead of sitting idle between owner messages. The owner gets signal, not noise.

## 2. The architecture (watchdog -> aggregator -> owner)

Proactivity is NOT "put a timer on every agent." It is a funnel:

```
Specialist agents fire on intervals -> write findings to their own scope / board
        |
Eco's loop (2h + AM/PM) aggregates everything -> one briefing
        |
Owner receives one signal; Red items arrive as an approval queue, not a firehose
```

Only Eco speaks to the owner on a cadence. Every other agent feeds Eco. This bounds token
cost (Assaf's concern) and keeps the owner channel quiet. This matches the digest model in
the autonomy-supervision proposal (section 10).

## 3. Two hard prerequisites (verified, not assumed)

P-A. DELIVERY IS BROKEN. Outbound Telegram push has failed 3+ days (SHIR-001 in-progress;
     IDO-001 due 2026-06-22). A trigger that fires but cannot reach the owner only burns
     tokens. SHIR-001 is the unlock for the whole program.

P-B. THE BRIDGE ONLY DOES INTERVALS. The current wake-up is a fixed asyncio timer
     (WAKEUP_INTERVAL = 7200 in bridge.py). True EVENT triggers (fire-on-condition: a new
     decisions-log entry, a new agent, a deadline approaching) need new Shir work in the
     scheduled runner. Until then, every trigger below is a polling interval.

P-C. SPAWN ALLOW-LIST GATES WHO CAN BE TRIGGERED. Per the autonomy proposal (5.2) and
     company/governance/agent-tool-spawn-allowlist.md, only allow-listed non-Bash agents can
     be spawned unattended. Currently PERMITTED: Anat, Assaf, Dalia, Eyal, Lital, Perry,
     Rambo, Hila, Luci, Erez, Ido. OFF the list until T-0020 C3: Oracle and every Wave-1/2
     hire; DENIED (Bash): Gal, Shir, Adi. A trigger for an off-list agent cannot run until
     T-0020 C3 lands -- which itself waits on Shir's R1-CODE + R2-CODE bridge work. So the
     Shir bottleneck gates both delivery AND coverage.

## 4. Recommendations -- which agents, which tasks, which cadence, why

### Tier 1 -- highest value, interval-based, build first
| Agent | Task | Cadence | Spawnable now? | Why required |
|-------|------|---------|----------------|--------------|
| Eco | Queue review + dispatch | 2h (EXISTS, approved) | yes | Keep. The aggregator. |
| Eco | Morning brief (queue + overnight + day plan) | daily AM | yes | Already running per git log; NOT yet in schedules.md. Formalize. |
| Eco | Evening summary + program-health line | daily PM | yes | Already running; add the proactivity-health block (section 6). Formalize. |
| Assaf | Cost/token snapshot + threshold alert | daily | yes (permitted) | Budget is 0; tokens are the only real cost. Silent spend drift is the #1 thing a proactive company must catch. Cheap. |
| Assaf | Fitness loop + usage report | weekly | yes | Surfaces idle / over-permissioned agents before they accumulate. |
| Assaf | On-demand agent review (T-0009) | monthly | yes | Already an owned "monthly recurring" task -- give it a timer instead of relying on memory. |
| Rambo | Permission-drift scan | weekly | yes (permitted) | T-0014 was one-shot. Proactive security = recurring, not a single audit. |
| Oracle | Chronicle sweep (capture the day's decisions) | daily | NO -- off allow-list until T-0020 C3 | Role is "near-real-time" capture; with no trigger it captures nothing between owner asks. Blocked on C3. |

### Tier 2 -- real value; needs event-trigger build and/or allow-list expansion
| Agent | Task | Cadence / type | Blocker | Why required |
|-------|------|----------------|---------|--------------|
| Lital + Eyal | Compliance-deadline check (IL registration, invoicing, privacy) | weekly interval | none for interval | Deadlines are date-driven; flag BEFORE a miss, not after. |
| Dalia | Quality/tone audit of agent outputs | weekly interval | none for interval | Catches voice/governance drift across ~29 agents while cheap to fix. |
| Ido | DASH-001 owner-dashboard refresh | hourly, or fold into Eco's 2h loop | none | The dashboard is itself a proactivity artifact. Prefer folding into Eco's loop to avoid double-firing. |
| Shir | Bridge + uptime health check | 15-30 min interval | T-0020 C3 + Bash (DENIED) | The textbook monitoring trigger. Blocked twice: monitors the broken bridge, and Shir is off-list. Highest value once unblocked. |
| MeetingPrep | Pre-meeting prep | EVENT: N hours before an external calendar event | needs event-trigger build (P-B) + off-list | Calendar read access exists; genuinely proactive. No external meetings yet. |

### Tier 3 -- future; gated on product / customers existing (do NOT fire now)
Recurring by nature, but produce nothing until there is a product and customers:
- Hila -- content cadence (a schedule by definition) -- blocked on domain/email + publish gate (HIL-001..004).
- Jack -- account-health monitoring, renewals -- no customers.
- Jenny / Mike / Ella -- CS loops -- hard gate: no customer contact until CS-0001 + product live.
- Adi -- regression -- event-triggered on builds; no product to build against.
- Sally / Alex -- pipeline review -- no product / pricing.

### Explicitly NO auto-trigger (by design)
- Zvika, Roman, Erez, Luci, Sami -- deliberately A2/owner-gated on-demand. Auto-firing would
  violate their gating and risks self-activation (red line 9). Wake on explicit invocation only.
- Anat (fires on a hiring event), Gal / Oren (fire on a build/review event via Ido) -- these are
  EVENT-shaped, not interval. Their "trigger" is the event itself; no timer.

## 5. Phasing (execute one gate at a time)

PHASE 0 -- Foundation. DONE this session (2026-06-22).
- This plan written. Board task T-0033 created (Assaf owner, Eco oversight).
- Proposed schedule rows drafted (Appendix A) -- pending A1; NOT yet in schedules.md.

PHASE 1 -- Unblock delivery. GATE: SHIR-001 done + verified.
- SHIR-001 (async ack + outbound push) lands so a trigger can actually reach the owner.
- No new trigger activates before this; until then the program is mute.

PHASE 2 -- Tier 1 interval triggers live. GATE: owner A1 per row + the autonomy-supervision
Phase-1 hooks in place (so unattended spawns run under SAFE_MODE + logging).
- Formalize Eco AM/PM rows; add Assaf daily-cost, Rambo weekly-scan.
- Oracle daily-sweep waits on T-0020 C3 (allow-list); ships when C3 lands.
- Assaf transcribes each A1-approved row into schedules.md and logs the decision.

PHASE 3 -- Event-trigger capability + Tier 2. GATE: Shir builds fire-on-condition support in
the runner; T-0020 C3 expands the allow-list.
- Lital/Eyal weekly compliance, Dalia weekly QA, Ido dashboard refresh, Shir uptime monitor,
  MeetingPrep pre-meeting event.

PHASE 4 -- Tier 3. GATE: product live and/or customers onboarded.
- Activate marketing cadence, sales pipeline, CS loops, QA regression as each precondition clears.

## 6. Ownership and oversight (owner directive 2026-06-22)

ASSAF owns the program (Operational Excellence):
- Owns schedules.md; transcribes only A1-approved rows; logs each in decisions-log.
- Runs and monitors the triggers; owns the TRIGGER-COST BUDGET (the triggers themselves spend
  tokens -- his daily cost snapshot must include trigger-fire cost so the proactivity machine
  does not become the thing that blows the zero budget).
- Reports trigger health into Eco's evening summary.

ECO oversees -- the owner wants Eco to constantly follow that this is being done:
- Every EVENING SUMMARY carries a Proactivity-Program health block: for each live trigger,
  last-run timestamp vs expected cadence; any MISSED fire flagged explicitly.
- A missed fire is treated like a missed due date (board accountability rule): it is a PROCESS
  MISS, and Eco escalates to the owner BEFORE slippage compounds -- not silently.
- Weekly, Eco does a deeper review of Assaf's ownership (are new triggers being proposed as
  needs emerge, is cost in budget, are blocked triggers being unblocked) and escalates gaps.
- Eco never grants a schedule row itself -- that stays A1. Eco's role is follow-up and escalation.

## 7. Safety inheritance (non-negotiable)

Every trigger runs inside the autonomy-supervision regime:
- Hooks are the circuit breaker; the supervisor (Rambo) is the smoke detector (that proposal, sec 2).
- SAFE_MODE pauses ALL triggers immediately (owner or supervisor sets it; owner-only clears it).
- Every unattended spawn is logged to memory/agent-runs.jsonl.
- No trigger may perform a Red action (spend, external send, customer data, tool adoption,
  role-file/governance/settings edits). Those stay A1 and queue for the owner.
- On-demand gated agents are never auto-fired (section 4).

---

## Appendix A -- Proposed schedule rows (PENDING A1 -- not yet in schedules.md)

On owner A1, Assaf transcribes the approved subset into schedules.md and logs the decision.

| Agent | Task | Cadence | Tier/Phase | Status |
|-------|------|---------|------------|--------|
| Eco | Queue review + dispatch | 2h | T1 / live | APPROVED (exists) |
| Eco | Morning brief | daily AM | T1 / P2 | PROPOSED (formalize -- already running) |
| Eco | Evening summary + program-health block | daily PM | T1 / P2 | PROPOSED (formalize -- already running) |
| Assaf | Cost/token snapshot + threshold alert | daily | T1 / P2 | PROPOSED |
| Assaf | Fitness loop + usage report | weekly | T1 / P2 | PROPOSED |
| Assaf | On-demand agent review (T-0009) | monthly | T1 / P2 | PROPOSED |
| Rambo | Permission-drift scan | weekly | T1 / P2 | PROPOSED |
| Oracle | Chronicle sweep | daily | T1 / P2 | PROPOSED (blocked: T-0020 C3) |
| Lital + Eyal | Compliance-deadline check | weekly | T2 / P3 | PROPOSED |
| Dalia | Quality/tone audit sample | weekly | T2 / P3 | PROPOSED |
| Ido | DASH-001 dashboard refresh | hourly / fold into Eco 2h | T2 / P3 | PROPOSED |
| Shir | Bridge + uptime health | 15-30 min | T2 / P3 | PROPOSED (blocked: T-0020 C3 + Bash) |
| MeetingPrep | Pre-meeting prep | EVENT: T-Xh before external meeting | T2 / P3 | PROPOSED (needs event build) |

## Appendix B -- Dependency summary

- SHIR-001 (delivery) gates ALL of Phase 2+ reaching the owner.
- T-0020 C3 (spawn allow-list expansion) gates Oracle, Shir, MeetingPrep, and any other
  off-list agent. C3 waits on Shir's R1-CODE + R2-CODE.
- Event-trigger build (Shir, in the runner) gates every EVENT trigger (MeetingPrep, and the
  ideal forms of Oracle/Rambo/Lital that should fire on a state change rather than poll).
- Autonomy-supervision Phase-1 hooks gate any UNATTENDED spawn running safely.
- Product/customers gate all of Tier 3.

## Appendix C -- Eco evening-summary health block (template)

Eco appends this block to EVERY evening summary. It is the oversight mechanism the owner
required (2026-06-22): Eco constantly follows that the program is being done. Terse; ASCII only.

```
PROACTIVITY HEALTH -- <YYYY-MM-DD PM>
Delivery: <UP | DOWN -- reason>   (if DOWN, nothing below reached the owner)

| trigger                | cadence      | last run | due    | state          |
|------------------------|--------------|----------|--------|----------------|
| Eco morning brief      | daily AM     | <ts>     | <ts>   | OK/MISSED/n.a  |
| Eco evening summary    | daily PM     | <ts>     | now    | OK             |
| Assaf cost snapshot    | daily        | <ts>     | <ts>   | OK/MISSED      |
| Assaf fitness/usage    | weekly Mon   | <ts>     | <date> | OK/DUE         |
| Assaf on-demand review | monthly      | <ts>     | <date> | OK/DUE         |
| Rambo permission scan  | weekly Mon   | <ts>     | <date> | OK/MISSED      |
| <Tier-2 rows as they go live ...>                                          |

MISSED FIRES: <none | per item: trigger, expected time, gap, why>
  -> any MISSED is a PROCESS MISS; Eco escalates to owner HERE, before it compounds.
TRIGGER COST (Assaf): <tokens today from triggers> / budget <X> -- <OK | OVER>
BLOCKED TRIGGERS: <e.g. Oracle (T-0020 C3); Shir uptime (event build)>
ASSAF OWNER-ACTIONS OPEN: <new triggers proposed as needs emerge? blocked ones progressing?>
```

Rules:
- "last run" comes from schedules.md Last-run / memory/agent-runs.jsonl -- NOT memory (red line 11: verify).
- A trigger with no last-run after its due time = MISSED, never "probably ran."
- If Delivery = DOWN, Eco STILL writes the block (to log/board) and flags the channel is dark.
  Silence is never reported as health.
- Weekly, Eco does a deeper review of Assaf's ownership (cost in budget, blocked triggers progressing,
  new needs surfaced) and escalates gaps to the owner.

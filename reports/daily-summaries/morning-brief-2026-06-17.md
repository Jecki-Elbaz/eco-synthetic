# Morning Brief -- 2026-06-17

Prepared by: Eco (CEO)
Date: 2026-06-17

---

Jecki,

Here is where we stand and what I need from you today.

---

## What changed overnight (last 48h)

The past two days were the most productive buildout stretch so far:

- **R&D wave complete.** Shir (DevOps) certified and live (owner A1 2026-06-16). Ido, Gal,
  Shir are all live. That closes the R&D group.

- **5 more P1 agents live.** Eyal (Legal), Noam (Product), Lital (CFO), Dalia (Q&G),
  Assaf (OE) all certified and go-live approved by you (2026-06-16). Dalia and Assaf
  received .claude/agents/ read access (A1 granted). T-0012 matrix gap closed.

- **T-0021 Phase A complete.** Autonomous git-sync guard: built, red-teamed (8/8 attacks
  caught after fix #09), Rambo cleared, Ido A2 sign-off. Merged to master.
  NOTHING deployed yet -- owner A1 required before implementation.

- **T-0002 design decisions logged** (done during Eyal cert session).

- **Shelly upgraded to Sonnet** (owner A1, 2026-06-16).

- **Autonomy guard** is in shadow mode (logging only, not blocking). No action yet.

Live agent count: 13 (Eco, Anat, Rambo, Hila, Shelly, Designer, Ido, Gal, Shir,
                      Eyal, Noam, Lital, Dalia, Assaf -- 14 including you as owner)
Remaining from P1 draft batch: Luci, Erez (2 of 10).

---

## Decisions I need from you today

### 1. T-0021 Phase A -- A1 to implement (HIGH)

The autonomous git-sync guard is ready. It passed a full red-team (8/8). Rambo cleared it.
Ido signed off (A2). Phase A proposal is at:
  company/processes/git-sync-phaseA-proposal.md (built artifacts on master)

To implement it, I need your A1. This fixes the root-cause of the stale-clone problem
that caused all the confabulation incidents. It is the highest-leverage technical action
available right now.

### 2. Luci + Erez competency testing -- scheduling (HIGH)

8 of 10 P1 agents are certified. Luci (Devil's Advocate) and Erez (Investor) are the last
two. Board T-0019 says you must be involved in their testing (you run or approve their
test scenarios). I cannot advance these without you. When can we schedule this?

### 3. Telegram delivery -- still broken (MEDIUM)

Three morning briefs in a row could not be delivered via Telegram because the Telegram
action is not enabled in Zapier. GitHub and Gmail are the only enabled Zapier apps.
CLAUDE.md blocks Gmail Send without A1 (Google Workspace write rule).

Options:
  (a) Enable Telegram in Zapier -- I can send briefs directly (no A1 needed beyond this)
  (b) Approve Gmail Send via Zapier (A1) -- I will send to jecki.elbaz@gmail.com
  (c) Continue with file save only + push notification

This is a recurring blocker. Let me know your preference.

---

## My plan for today

1. **T-0021 A1 response.** If you approve, I will task Shir to implement Phase A.
   If not yet, I will note and requeue.

2. **Wiki refresh (T-0016).** The agent roster and backlog-summary are stale again --
   8 new agents certified since last sync. I will update memory/wiki/ to match current state.

3. **T-0001 close-out.** Noam is live; VP Product decision is ready. I will bring you
   a close-out entry for T-0001 with the VP Product outcome noted.

4. **T-0002 brief.** With Eyal, Lital, Dalia, Assaf all live, the design decisions
   backlog (concurrency rule, JSONL->SQLite, durable memory, Gemini) can now be briefed
   with the right people in the room. I will draft the owner brief today.

5. **T-0012 formalization.** Dalia is live and can now execute the access-matrix
   reconciliation. I will activate her on T-0012.

6. **Luci/Erez prep.** I will draft competency specs for both so they are ready when
   you give me a window for testing.

---

## Status of key open items

| Task | Status | Blocker |
|------|--------|---------|
| T-0015 P1 buildout | 8/10 live | Luci + Erez (owner-involved) |
| T-0019 Competency testing | 8/10 done | Luci + Erez need owner scheduling |
| T-0021 git-sync Phase A | Built, cleared | Owner A1 to implement |
| T-0001 Go-live structure | Near-done | VP Product close-out + Noam |
| T-0002 Design decisions | Open | Brief draft due today |
| S-0002 Domain check | Open | No progress; Shelly owns |
| T-0022 Email delivery | Blocked | No company email (S-0002/S-0003) |
| Autonomy guard | Shadow mode | Design phase; no A1 needed yet |

---

## Delivery note

Telegram send action is NOT enabled in Zapier -- brief could not be delivered via Telegram.
Saved to reports/daily-summaries/morning-brief-2026-06-17.md.
Push notification sent to owner.

# Inbox Triage Re-scope Security Scan -- Rambo 2026-07-26

Target: GR-014 scope change -- "Adam-only" -> "is:unread newer_than:7d" on eco.synthetic.org@gmail.com
Triggered by: Eco proposal company/governance/proposals/inbox-triage-rescope-2026-07-26.md
Reviewed against: agent-prompts.md (Rambo:Adam Inbox Screen prompt), CLAUDE.md GR-014 section,
  gate-register.md GR-014, guard.py (AUD-013 F-S814 applied), runner.py PER_JOB_TOOLS
Rambo verdict: CLEAR-WITH-CONDITIONS (6 conditions; C1+C5 co-block go-live)
Eyal re-scope required before go-live (C1 and C5 are joint Eyal+owner gates, not Rambo-clearable).

---

## Findings

1. TAINTED-INPUT SURFACE -- HOLDS WITH ONE GAP (MEDIUM)

   The core tainted-input controls are content-level and sender-agnostic:
   instruction-pattern check, hidden/encoded-content check, links-never-opened rule,
   and the C-E3 HARD STOP on student/health/clinical content all fire regardless of
   sender identity. These hold unchanged for arbitrary senders.

   Gap: the sender-verification step in the current Stage-1 prompt (step 3, agent-prompts.md
   line 206-210) is Adam-specific: "the reply sender address must EXACTLY equal the To:
   address of our own outbound message in the same thread." For general-inbox mail there
   is no reference outbound thread. This check is undefined for arbitrary senders and
   would silently not fire, leaving lookalike / domain-spoof detection unexecuted.

   Mitigation (standing rule, apply at prompt update):
   Replace Adam-specific sender check with a general rule: for every message, check From:
   header domain for lookalike patterns against eco.synthetic.org and any other known
   sender domain; any near-match or domain that substitutes characters (rn vs m, etc.)
   -> SUSPICIOUS. No outbound-thread reference needed.

2. MAILBOX-STATE SAFETY -- CONFIRMED SOUND

   Read+draft-only posture verified on three independent layers:
   (a) PER_JOB_TOOLS (runner.py lines 68-75): allowed tools are Read, Write, Edit (file ops),
       search_gmail_messages, get_gmail_message_content, get_gmail_thread_content -- no Gmail
       write, archive, delete, label, or filter tool in the allowed set.
   (b) guard.py lines 314-319 (AUD-013 F-S814, owner A1 2026-07-26): send_gmail_message and
       manage_gmail_filter are HARD-DENIED on RUNNER_CONTEXT=1, regardless of GUARD_MODE
       (google_block path, line 488 -- always enforces). These controls are live today.
   (c) Dedup design: one screened file per message-id in shared/handoff/inbox-screened/;
       no mark-as-read, no archive, no mailbox mutation. Sound.

   Condition C4 (below): new job key in runner.py must carry the same read-only Gmail tool
   set -- not rely on PER_JOB_TOOLS default falling back to TOOLS[mode].

3. DATA IN TRACKED FILES / PII -- CRITICAL BLOCKER (C-E4)

   The existing GR-014 gate (gate-register.md, Eyal condition C-E4) explicitly states:
   "LLM processing of email bodies before compliance Item 6 (Anthropic DPA execution) closes
   -- ACCEPTED BY OWNER for the Adam business thread ONLY; anything wider waits for Item 6."

   Whole-inbox scope means arbitrary third-party sender bodies enter the LLM context.
   This is exactly the "anything wider" C-E4 blocked. The current owner A1 (2026-07-10)
   does NOT cover this expanded scope. LLM processing of general-inbox bodies before
   Item 6 is closed would violate the binding GR-014 gate condition and Israeli PPL
   5741-1981 data-minimization obligations (third-party personal data in arbitrary emails).

   The "summaries only, no raw mail" rule is necessary but not sufficient to close this;
   summarization itself is LLM processing of the body. C-E4 must be closed first.

   Mitigation (standing rule, C1 blocking condition):
   Item 6 (Anthropic DPA execution) must be confirmed closed by Eyal before go-live.
   Until then, whole-inbox LLM processing is a gate-register violation. After Item 6 is
   closed, add an additional PII-minimization rule to Stage-1 prompt: if a message body
   appears to contain personal data about third parties other than the sender (financial
   details, medical references, legal correspondence), treat as QUARANTINE even if no
   student/clinical content is present -- do not summarize beyond sender + topic line.

4. LEAST-PRIVILEGE -- SOUND WITH ONE RECOMMENDATION

   Query `is:unread newer_than:7d` is appropriately bounded: unread-only prevents re-scanning
   reviewed mail; 7-day window prevents unbounded full-mailbox dumps; both limits are additive.
   The 7-day window is correct for a daily job to survive missed cycles (OAuth expiry window
   per SHIR-008 is the expected failure mode). `newer_than:24h` would be too tight on missed days.

   PER_JOB_TOOLS Gmail-read set (search, get_message_content, get_thread_content) is
   minimal -- exactly what Stage-1 needs and no more. No excess-permission finding.

   Recommendation (C3, non-blocking): add a SKIP verdict class to the Stage-1 prompt for
   obvious promotional / newsletter / bulk-sender mail (List-Unsubscribe header present or
   sender matches known newsletter pattern). Write a minimal SKIP record (sender, date, reason
   "promotional") without body processing. Reduces unnecessary third-party content in LLM
   context and limits PII exposure to business-relevant mail only.

5. CADENCE / TOKEN -- NO SECURITY CONCERN; DAILY IS BETTER

   Daily is a security improvement over 2h: fewer automated processing cycles per day reduces
   third-party content ingestion surface and attack-window frequency. The screening delay
   (up to 24h vs 2h) is acceptable because Stage-1 quarantines injection before Eco sees it;
   a quarantined hostile email sitting unprocessed for 23h creates no additional risk.

   No security objection to daily cadence. Owner's open question Q2 (daily vs 2x/day) can
   be decided on operational grounds; both are fine from a security standpoint.

---

## Conditions (binding; C1+C5 co-block go-live)

C1 [CO-BLOCK, Eyal]: Anthropic DPA (compliance Item 6) must be confirmed CLOSED by Eyal
   before any whole-inbox LLM body processing launches. This closes C-E4. No workaround.

C2 [BLOCKING, prompt update]: Stage-1 prompt sender-verification step must be replaced with
   a general lookalike/domain-spoof rule before the job goes live under the new scope.
   Adam-specific check is undefined for arbitrary senders.

C3 [NON-BLOCKING, prompt update]: Add SKIP verdict class to Stage-1 prompt for bulk/newsletter
   mail (List-Unsubscribe header or known promotional pattern). Reduces PII surface.

C4 [BLOCKING, runner.py update]: New job key "Rambo:Inbox Triage Screen" must carry the same
   read-only Gmail tool set in PER_JOB_TOOLS as the current Adam job. Confirm no write or
   send tool is in the allowed list for the new key.

C5 [CO-BLOCK, Eyal + owner]: Eyal must confirm the data-minimization + retention posture
   covers arbitrary third-party senders under Israeli PPL 5741-1981, not just Adam.
   This is the Eyal privacy re-scope the proposal identifies; it is co-blocking with C1
   and may be addressed in the same Eyal review session.

C6 [NON-BLOCKING, prompt update]: After Item 6 is closed and C5 confirmed: add the
   third-party-PII-in-body QUARANTINE rule to Stage-1 prompt (finding 3 above).

---

## Recommendation

CLEAR-WITH-CONDITIONS. Do not launch until C1 (Anthropic DPA / Item 6) + C5 (Eyal
PPL re-scope) are confirmed closed and C2 + C4 (prompt + runner updates) are applied.
Route C1+C5 to Eyal now; owner A1 fresh grant after all conditions are confirmed.

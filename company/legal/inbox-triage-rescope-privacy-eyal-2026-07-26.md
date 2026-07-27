# Privacy Review -- GR-014 Inbox Triage Re-scope
Reviewer: Eyal (Legal, L3)
Date: 2026-07-26
Tasked by: Eco (CEO), owner-interactive session 2026-07-26
Proposal read: company/governance/proposals/inbox-triage-rescope-2026-07-26.md
Baseline read: gate-gmail-readonly-eyal-2026-07-10.md (C-E1..C-E5); gate-register.md GR-014 row;
compliance-backlog.md Item 6 (Anthropic DPA status).

---

## Verdict

CLEAR-WITH-CONDITIONS.

One BLOCKING pre-condition (Condition 1): the broadened Stage-1 LLM body processing cannot run
until C-E4 is resolved. The gate itself is clearable -- two resolution paths exist (see below).
No path requires Eyal action; both are owner-side. Eyal can close this gate as soon as the owner
records one of the two resolution paths in the decisions-log.

---

## Baseline conditions (GR-014, Eyal, 2026-07-10)

C-E1 -- bounded queries only (Adam sender / APS threads). C-E2 -- no verbatim bodies in tracked
files; summaries of topic + action items only. C-E3 -- student/health/clinical hard stop;
quarantine + owner-only. C-E4 -- LLM body processing residual gap (Anthropic DPA / Item 6 open);
owner accepted residual risk for Adam business thread ONLY (decisions-log 2026-07-10). C-E5 --
no autonomous polling without per-session A1.

The GR-014 two-stage architecture (Rambo screener -> Eco reads SAFE summaries only) was assessed
as APPROVED-AS-SHAPED in the C-E5 addendum on the runner automation question. That architecture
carries over intact.

---

## Q1 -- Data Minimization: is whole-unread-inbox a defensible posture?

Answer: YES, with conditions.

The company account eco.synthetic.org@gmail.com is a business-use account, not a personal mailbox.
Triage of unread business correspondence is a legitimate business purpose under PPL 5741-1981
purpose-limitation analysis. `is:unread newer_than:7d` is time-bounded and state-bounded; it is
not an unbounded full-mailbox dump.

Risk factor: data subjects are now arbitrary. GR-014 covered one identified individual (Adam) who
was in a known business relationship with the company. Whole-inbox covers anyone who sends email
to the company address -- people who did not consent to, and may not anticipate, LLM processing
of their message by the recipient's automated systems. This is a real PPL minimization concern.

It is defensible ONLY if: (a) purpose is hard-limited to business correspondence triage (not
personal or social mail); (b) obvious promotional/newsletter/bulk-sender content is excluded at
the query or filter level before any body is read (Rambo classifying these as "skip" before
invoking LLM processing reduces unnecessary data processing and aligns with Amendment 13
minimization); (c) summaries never include more identifying information about the sender than
is operationally necessary for routing.

Additional limit needed: Rambo Stage-1 must classify and skip obvious non-business senders
(newsletters, marketing, no-reply domains, automated notifications) BEFORE opening the body
for LLM summarization. Opening a newsletter body for LLM processing when a header-level
classification suffices is not proportionate under PPL.

---

## Q2 -- C-E4 Residual: does it block whole-inbox LLM body processing?

Answer: YES -- as currently standing, C-E4 BLOCKS the broadened scope. This is the key gate.

Why: C-E4 documented that LLM summarization of email body content = processing personal data
through Anthropic (a third-party processor) without a formally executed DPA satisfying Israeli
PPL Amendment 13 processor obligations. The 2026-07-10 owner A1 acceptance of that residual risk
was EXPLICITLY SCOPED to "the Adam business thread ONLY" -- the decisions-log entry and the
GR-014 gate row both state this scope limit verbatim.

Whole-inbox expands the data subjects from one known business correspondent to unknown third
parties. That wider population was not inside the scope of the 2026-07-10 acceptance. C-E4
does not auto-extend.

Compliance-backlog Item 6 status (confirmed from backlog, Lital run 7, 2026-07-20): OVERDUE.
Three owner A1 steps (confirm commercial plan; confirm/enable zero-retention; download DPA
copy) were targeted for 2026-07-07. None confirmed completed. As of 2026-07-26 this is 19
days past target.

Two resolution paths -- either is sufficient:

PATH A (preferred): Owner closes compliance-backlog Item 6 (Anthropic DPA execution -- the 3
A1 steps). Once closed, the processor-obligation gap is cured. Whole-inbox LLM body processing
is then permitted under the general GR-014 architecture with the conditions below. Note: Eyal
must also confirm live DPA text via WebFetch before owner executes (Item 6 legal-leg action 1
is still outstanding on Eyal's side -- confirm current DPA text and tier eligibility first).

PATH B (residual-risk extension): Owner issues a fresh in-session A1 explicitly extending the
2026-07-10 residual-risk acceptance to whole-inbox / unknown-third-party-sender scope.
This means accepting that personal data of arbitrary third-party senders will be LLM-processed
without a formally executed Anthropic DPA. Amendment 13 makes this a real legal gap; Path A
is strongly preferred. If owner accepts Path B, record it in the decisions-log with the scope
explicitly stated.

Either path must be recorded in the decisions-log BEFORE the broadened runner job runs for the
first time. Eyal confirms Path A or B is on record, then closes this gate.

---

## Q3 -- Retention: screened summaries in shared/handoff/inbox-screened/

Current position: no defined retention cap for files in shared/handoff/inbox-screened/.

For the Adam-only pipeline this was acceptable because the job had a hard expiry (2026-07-14 or
on Adam's reply). The general triage pipeline has no expiry -- files would accumulate indefinitely
without a deletion rule.

PPL data-minimization requires that personal data not be kept beyond the period necessary for
the stated purpose. A screened summary for an inbox triage item is "necessary" only until it is
routed to the relevant project/board row or acted on, and for a short lookback window thereafter.

Required: screened summary files in shared/handoff/inbox-screened/ must be deleted or have
sender-identifying content overwritten within 30 days of creation, unless the relevant task/board
row explicitly requires retention of the routing context for longer (in which case, retain in the
task record -- not in the handoff file). This is a deletion policy, not an archive policy; the
handoff dir is a transient relay, not a record store.

---

## Q4 -- Third-party sensitive content: is the hard-stop sufficient?

Answer: YES, for the current proposal as written.

The proposal explicitly carries over C-E3 verbatim (student/health/clinical -> QUARANTINE,
owner-only, no summarization). The two-stage architecture places the hard stop at Stage 1
(Rambo), before any content reaches Stage 2 (Eco) or tracked files. This is structurally correct
and is required under PPL and constitution red line 9.

One reinforcement note: the hard-stop trigger list must also include ANY medical record, legal
document, or financial statement containing a third party's personal account data, even if not
labelled as clinical or student content. The proposal's current list (student names, health data,
clinical case content) is the minimum; Rambo's prompt should expand to the broader PPL
special-category formulation on implementation.

---

## Conditions (binding, numbered)

**Condition 1 (BLOCKING -- pre-run gate on LLM body processing).**
Before the broadened runner job processes any email body from a sender other than Adam, the owner
must resolve C-E4 via Path A (Item 6 Anthropic DPA closure) or Path B (fresh A1 residual-risk
acceptance for whole-inbox / unknown-sender scope, recorded in decisions-log). Eyal must confirm
the resolution is on record before Stage-1 runs with the new scope. Gate cannot open without this.
Also: Eyal must complete Item 6 legal-leg action 1 (live WebFetch of current Anthropic DPA text
and tier eligibility) before owner executes Path A.

**Condition 2 (data minimization -- Rambo prompt requirement).**
Rambo Stage-1 must classify and skip obvious non-business senders (newsletters, no-reply domains,
marketing, automated notifications) at the HEADER level, before invoking LLM body summarization.
Only messages that pass a business-correspondence plausibility check at header level proceed to
body summarization. This is a proportionality requirement under PPL Amendment 13 minimization.
Implement in the Stage-1 Rambo prompt update (proposal rollout step 1).

**Condition 3 (purpose limit -- explicit statement in runner prompt).**
The Stage-1 prompt must state the purpose explicitly: "business correspondence triage for
eco.synthetic.org@gmail.com -- classify, summarize, and route inbound business messages only."
This locks purpose limitation into the processing record and satisfies PPL purpose-limitation
documentation requirements.

**Condition 4 (retention -- deletion policy for handoff files).**
Screened summary files in shared/handoff/inbox-screened/ must be deleted or have
sender-identifying content overwritten within 30 days of creation. Content routed to a
project/board row retains only the anonymized action item in the task record; the source
handoff file is deleted at the same time. Owner or Eco implements a cleanup job or
acknowledges the manual deletion obligation before the pipeline goes live.

**Condition 5 (hard-stop scope reinforcement).**
The C-E3 hard-stop trigger in the Stage-1 prompt must be stated at its full PPL scope: student
names, health information, clinical case content, financial account details of identified
individuals, or any other special-category personal data as defined under PPL Amendment 13.
The narrower current formulation (student/health/clinical) is the floor, not the ceiling.

**Condition 6 (gate-register update).**
GR-014 gate-register row must be updated to record the scope change from "Adam-only" to
"whole unread inbox" with this review date, the new conditions (C1-C5 here), and the C-E4
resolution record (Path A or B) after the owner acts. Eco executes after owner A1 grant.

---

## C-E1 delta

C-E1 (bounded queries only: Adam sender / APS threads) is superseded for the new scope.
The new query bound is `is:unread newer_than:7d` on eco.synthetic.org@gmail.com. This is
still a bounded query (not an unbounded full-mailbox dump) and is acceptable subject to
Conditions 2-3 above. C-E1 no longer applies as originally written; the new query bound
replaces it and must be recorded in the updated GR-014 row.

---

## C-E5 delta

C-E5 (no autonomous polling without per-session A1) was partially superseded by the C-E5
addendum (runner automation approved-as-shaped, 2026-07-10, with the Adam-only expiry as
the PPL time-box). The new pipeline replaces the expiry with a 7-day rolling window and a
daily cadence. This is still a time-bounded automation. C-E5 as an in-session gate is no
longer operative once the runner job carries a fresh owner A1 at launch; the 7-day rolling
window is the operative minimization control. Confirmed: no new C-E5 condition needed,
provided the runner job launch itself is recorded as an owner A1 act in the decisions-log.

---

## Summary for Eco / owner

Verdict: CLEAR-WITH-CONDITIONS.

C-E4 blocks LLM body processing of whole-inbox until owner resolves via Path A (preferred:
close Item 6 Anthropic DPA, currently 19 days overdue) or Path B (fresh A1 scope extension,
decisions-log). No other item is a hard block. Conditions 2-6 are implementable in the
rollout steps the proposal already describes.

Eyal action outstanding: live WebFetch of current Anthropic DPA text (Item 6 legal-leg
action 1) must run before owner executes Path A. Eyal requests Eco schedule a WebFetch
session for this in parallel with the owner's Item 6 action.

**Eyal (Legal) -- 2026-07-26**

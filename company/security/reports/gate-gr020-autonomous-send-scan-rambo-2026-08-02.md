# Gate Report: T-0049 / GR-020 -- Shelly Autonomous Compose+Send
# (shelly.synthetic.org@gmail.com, allowlist-bounded)

Prepared by: Rambo (Security)
Date: 2026-08-02
Task: T-0049
Source: shared/handoff/shelly-outbox/gate-request-autonomous-send-2026-07-27.md
Requested by: Shelly, 2026-07-27 (owner approved direction same day)
Connector: GR-009 google_workspace (taylorwilsdon/google_workspace_mcp v1.21.3,
  shelly-creds, shelly.synthetic.org@gmail.com)

VERDICT: FLAG -- conditions not yet met; not CLEAR until WS4-class guard code is
deployed for the Shelly repo AND Eyal closes the C-E4 DPA blocker.

This review is GR-020 class (File-and-Flush rigor), not a rubber stamp.
Context: autonomous send is the single largest guardrail the company has held since
T-0037/CS-0001. Shelly herself identified four residual risks (R1-R4) and asked
they not be glossed over. They will not be.

---

## Part 1: Confirmation or tightening of C1-C7

C1 -- LOCKED ALLOWLIST. Proposed: send-allowlist.json, owner-edited only, guard-
  enforced. Assessment: CONFIRMED with tightening. File must be in the guard's RED_EXACT
  set (or equivalent) so only the owner's interactive session can edit it. The existing
  WS4 send-whitelist (company/governance/email-send-whitelist.md) is the correct pattern:
  it is in RED_EXACT, unreadable/unwritable by any runner or bridge path. Shelly's
  equivalent must be the same structure in the Shelly repo's guard or equivalent
  enforcement. A send-allowlist.json that any agent can Write at runtime is not
  a locked allowlist -- it is a suggestion. TIGHTENING: the file must reside in a
  RED_EXACT path in the Shelly repo's guard (or an equivalent hard-code path), and
  any format change must come to Rambo for advance review.

C2 -- BCC-OWNER. Proposed: every autonomous send BCCs jecki.elbaz@gmail.com;
  missing BCC -> deny. Assessment: CONFIRMED with tightening. The guard must enforce
  BCC as a hard precondition, not an agent behavioral rule. Behavioral rules fail
  when the compose step has a bug or is injected. The guard-level check must: (a)
  parse the bcc field before approving the tool call; (b) confirm jecki.elbaz@gmail.com
  is present case-insensitively; (c) deny if absent. Shelly cannot override or bypass
  this check. TIGHTENING: the BCC guard must be code-enforced, not prompt-enforced.

C3 -- FROZEN SPLIT-SEND. Proposed: composer writes frozen bytes to queue; send-job
  sends stored bytes only, never composes at send time. Assessment: CONFIRMED and
  CRITICAL. This is the most structurally important condition because it limits the
  blast radius of a compromised or injected compose step: the worst-case outcome is
  a bad message that already exists in the queue, not an infinite or reactive send
  loop. The architecture must guarantee: (a) the queue entry is immutable after
  the composer writes it (no in-flight modification); (b) the send-job reads only
  the queue, not any inbound mail; (c) no code path causes the send-job to compose
  new content. Shir to implement; Rambo to review the implementation before go-live.

C4 -- IDEMPOTENT + RATE-CAP. Proposed: each item sent at most once; per-day cap;
  duplicate/loop -> deny. Assessment: CONFIRMED. The idempotency token must be derived
  from message content, not from a counter an agent can reset. The per-day cap must be
  enforced in code (e.g. a rate file in a non-agent-writable path), not in a prompt
  instruction. TIGHTENING: the rate-cap file must be agent-read-only (guard denies
  agent writes to it, same pattern as SPAWN_COUNT_FILE).

C5 -- NO-TAINT COMPOSE. Proposed: composer must not act on instructions in inbound
  mail or tainted content when composing an autonomous send. Assessment: CONFIRMED and
  UNDER-DEFINED. "Must not act on instructions" is a behavioral rule, not a structural
  one. The structural enforcement is: (a) the compose step must be driven by a
  structured task envelope (task_id, recipient from allowlist, purpose from a fixed
  enum), never by freeform inbound content; (b) the task envelope must originate in
  the Eco/owner-approved dispatch path, not in a response to inbound mail. A
  compose step that reads any inbound mail as part of its context is a C5 violation.
  TIGHTENING: the compose prompt must explicitly exclude all inbound mail content
  from the context; any compose job that ingests inbound mail for context is denied.

C6 -- GUARD SECRET/PII SCAN. Proposed: outbound body scanned for secrets/PII before
  queueing; deny on hit. Assessment: CONFIRMED with a scope note. The existing
  secret-scan patterns in guard.py (_SECRET_PATTERNS) cover API keys, tokens, and
  bearer strings but not personal health data, financial account numbers, or Israeli
  ID numbers. For the autonomous send use case (document requests to family/contacts),
  this is a low-risk gap. For any expansion of scope, the secret patterns must be
  extended. ACCEPTED AS-IS for the stated scope; flag if scope expands.

C7 -- SCOPE LOCK. Proposed: shelly.synthetic.org only; jecki.elbaz send unchanged
  (DENY). Assessment: CONFIRMED. The guard already enforces the account boundary via
  user_google_email == ECO_GOOGLE_ACCOUNT on the eco project's workspace server. The
  Shelly repo's guard must enforce the equivalent for shelly.synthetic.org. Sending
  from jecki.elbaz must remain hard-denied on every autonomous path.

---

## Part 2: Residual risks R1-R4 -- explicit assessment

R1 -- NO HUMAN CONTENT REVIEW.
  Shelly correctly named this: the allowlist + BCC do not prevent a bad or
  injection-shaped MESSAGE from reaching an allowlisted recipient. They prevent an
  unauthorized RECIPIENT. These are different controls.

  Assessment: HIGH risk, partially mitigated by C5 tightening but not eliminated.
  The frozen-split-send (C3) means a human could review the queue before the send-
  job runs -- but the gate request does not include a queue-review step for the owner.
  If the owner receives the BCC and something is wrong, the mail has already been
  sent.

  Mitigation needed: either (a) add a queue-review window (queue is written; owner
  gets a Telegram notification with the subject/recipient; send-job fires only after
  a configurable hold period or an explicit owner OK), or (b) the owner accepts R1
  explicitly on the record and the scope stays bounded to low-stakes document requests
  with fixed phrasing. Option (a) is the stronger control; option (b) is acceptable
  only for the stated "document request to family/contacts" scope and must be re-
  evaluated if scope expands. Rambo recommendation: start with option (a). The hold-
  period approach costs nothing extra in the split architecture (C3) and turns the
  BCC from detective to preventive for any content the owner catches in the window.

R2 -- BCC IS DETECTIVE, NOT PREVENTIVE.
  Shelly is right. BCC is not a gate; it is an audit trail. The owner sees the
  mail after it is sent. Sending an incorrect or injected mail to an allowlisted
  recipient cannot be recalled.

  Assessment: ACCEPTED AS A RESIDUAL, with conditions. The hold-period mitigation
  above (R1 option a) converts BCC from purely detective to preventive-during-window.
  If the hold-period approach is not adopted, R2 is a real unmitigated risk and the
  gate stays FLAG. If the hold-period approach is adopted and the window is at least
  15 minutes, R2 is mitigated to LOW for the bounded scope.

R3 -- BODY-DATA LEAKAGE.
  The allowlist governs the recipient, not what the body contains. An autonomous mail
  to jecki.elbaz@gmail.com (an allowlisted address) could include content about a
  third party that the agent had in its context.

  Assessment: MEDIUM. Mitigated by C5 tightening (structured task envelope, no
  inbound mail in context) and C6 (secret scan). Residual risk: the agent could
  include owner-personal information it learned from non-mail sources (board, wiki,
  etc.) in a message body. The scan does not catch plain-language personal data.
  Mitigation: add a maximum body length limit and a fixed-phrasing template for
  document-request use cases. Condition AS-C8 (see Part 3).

R4 -- TRUST/ATTRIBUTION.
  Allowlisted recipients receive agent-authored mail "from Shelly" (shelly.synthetic.org).
  Third parties may not know they are corresponding with an agent.

  Assessment: MEDIUM-HIGH from an Israeli law perspective. Israeli Communications Law
  and general consumer-protection principles require that a recipient not be materially
  deceived about the nature of their correspondent. Eyal must confirm whether an explicit
  "sent by an AI agent on behalf of" footer is required for mail to third parties
  (family/contacts who are not jecki). For mail to jecki.elbaz@gmail.com only (the owner
  communicating with his own agent), R4 is LOW (no third-party deception). For mail to
  Shira or other non-owner contacts on the allowlist, R4 is MEDIUM-HIGH without a footer.

  TIGHTENING: Condition AS-C9 -- every autonomous send to a recipient other than
  jecki.elbaz@gmail.com must include a footer identifying the message as agent-authored.
  Eyal to confirm sufficiency of footer text. This is a legal gate item, not a security
  one; Eyal owns the determination.

---

## Part 3: Additional conditions (beyond C1-C7)

AS-C8 (body-data minimization): the compose step must use a fixed phrasing template
  for document-request use cases. Free-form compose is not permitted in the initial
  scope. Template must not include inbound-mail content or personal data beyond the
  minimum needed for the document request. Owner defines approved templates.
  Owner: jecki. Implementer: Shir.

AS-C9 (agent-sent footer for external recipients): every autonomous send to a
  recipient other than jecki.elbaz@gmail.com must include a footer such as:
  "This message was composed and sent by Shelly, an AI agent, on behalf of [owner]."
  Exact text subject to Eyal confirmation. Guard enforces as a hard precondition
  before approving send_gmail_message for non-owner recipients.
  Owner: Eyal (confirms text + legal sufficiency). Implementer: Shir (guard enforcement).

AS-C10 (implementation review before go-live): Shir's implementation of C1-C7 + C3
  split-send architecture must be reviewed by Rambo before any autonomous send goes
  live. The review covers: the allowlist file path and guard protection; the BCC
  enforcement code; the frozen-queue implementation; the rate-cap file protection;
  the compose context isolation (no inbound mail). No go-live without this review.
  Owner: Rambo (review). Implementer: Shir.

AS-C11 (Eyal DPA gate -- co-blocking): GR-020 (Eco autonomous send) carries a
  blocking condition C-E4 (Anthropic DPA / compliance Item 6). The same DPA question
  applies here: autonomous LLM-assisted composition of outbound mail that may reference
  owner or third-party personal data requires the DPA to be in place before the LLM
  processes that data on the runner path. This gate cannot be CLEAR until Eyal's C-E4
  is resolved. This is the same blocker as GR-020; it is not a new requirement.
  Owner: Eyal (confirms DPA path). Eco: tracks.

---

## Summary

The proposed design (C1-C7) is architecturally sound for the stated low-stakes scope.
The residual risks Shelly identified are real and were correctly not glossed over:

- R1 and R2 are addressed ONLY if a hold-period or queue-review window is implemented.
  Without it, this gate stays FLAG.
- R3 is addressed by fixed-phrasing templates (AS-C8).
- R4 requires Eyal confirmation on the footer requirement (AS-C9).
- The DPA blocker (AS-C11 / C-E4) is co-blocking from the legal side.

Until the hold-period is adopted (or owner explicitly accepts the no-review risk
in writing) AND Eyal closes C-E4, the verdict is FLAG -- conditions not yet met.

If the hold-period is adopted and Eyal closes C-E4, this becomes CLEAR-WITH-CONDITIONS
(C1-C7 tightened above + AS-C8 through AS-C11).

Blast radius remains HIGH: autonomous send is an irreversible external action.
The controls above bound recipient and content scope but do not eliminate the
possibility of a wrong or injected message reaching an allowlisted person before
any human can intervene (absent the hold period).

Recommendation: adopt the hold-period, resolve C-E4 with Eyal, then re-submit.

Rambo, 2026-08-02

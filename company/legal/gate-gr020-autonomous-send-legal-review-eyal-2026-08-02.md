# Gate Review -- T-0049: Autonomous Send Gate for Shelly

Reviewer: Eyal (Legal)
Date: 2026-08-02
Task: T-0049
Gate: GR-021 -- see GR-NUMBER CORRECTION below
Verdict: CLEAR-WITH-CONDITIONS (C-E4 BLOCKS go-live; all other legal dimensions cleared)

---

## GR-NUMBER CORRECTION -- FLAG TO ECO (mandatory action required)

The T-0049 board row and the task envelope both say "register as GR-020."

GR-020 is ALREADY OCCUPIED in company/governance/gate-register.md (lines 775-813):
"Gmail READ scope widened + Eco autonomous send to whitelist (2026-08-01), owner A1."
That is a different gate (eco.synthetic.org account, Eco-agent send capability).

Registering T-0049 as GR-020 would collide with an active, owner-A1-gated record.

ACTION TAKEN: this review and the gate-register entry are registered as GR-021.

Eco must update: T-0049 board row, Shelly board row (S-0033 if present), and any
downstream handoff files that reference "GR-020 autonomous-send-for-Shelly." The
ack files (gr-020-autonomous-send-ack-2026-07-28.md and similar) used a pre-registration
label; GR-021 is now the canonical gate ID for the Shelly autonomous send gate.

The file path of this memo follows the task envelope naming convention
(gate-gr020-autonomous-send-...); the content governs; GR-021 is the correct ID.

---

## What is being reviewed

Grant Shelly (shelly.synthetic.org@gmail.com) autonomous compose-and-send authority to
third parties on her allowlist, with NO per-action human approval required. Owner-specified
design constraints:
- Locked send-allowlist, owner-edited only, guard.py enforced.
- Mandatory owner BCC (jecki.elbaz@gmail.com) on every autonomous send.
- Frozen split-send: composer writes a frozen message to a queue; a separate send-job
  flushes the stored bytes only; no composition at send time; no reading inbound mail;
  no loop.
- Proposed conditions C1-C7 from Shelly (allowlist, BCC-owner, frozen split-send,
  idempotent+rate-cap, no-taint compose, guard secret/PII scan, shelly.synthetic.org-only).

Context: autonomous send is the single largest guardrail this company has maintained
since T-0037 (2026-06-29) and CS-0001 (2026-07-26). This review is conducted with the
same rigor as GR-019 (File-and-Flush). It is not a rubber stamp.

Source: Shelly gate request 2026-07-27
(shared/handoff/shelly-outbox/gate-request-autonomous-send-2026-07-27.md).
Security review: Rambo, filed separately (parallel review 2026-08-02).
See company/security/reports/ for the Rambo leg.

---

## Legal questions addressed

The task envelope specifies these questions; each is answered below:

Q1. Consent, attribution, and disclosure requirements for agent-sent mail to third parties
    with no human in the loop.
Q2. Israeli law and e-communications/privacy obligations.
Q3. Record-keeping requirements.
Q4. Whether mandatory owner-BCC is legally sufficient as a control.
Q5. Attribution and liability: mail sent from a company-adjacent account by an autonomous
    agent.
Q6. Whether compliance-backlog Item 6 / C-E4 constrains or blocks this gate.

---

## Terms reviewed

1. Software license -- taylorwilsdon/google_workspace_mcp: MIT.
   Already cleared at GR-009 base row (Eyal, 2026-07-01). No new license obligation.

2. Google API Terms of Service and Google API Services User Data Policy:
   Cleared at GR-009 (Eyal, 2026-07-01) for internal single-account use. The prior
   GR-009 C-L1 condition ("no autonomous send") was a company-policy control, not a
   Google ToS restriction. Analysis below.

3. Israeli Communications Law, Amendment 40 (anti-spam / commercial messages).

4. Israeli Privacy Protection Law 5741-1981 + Amendment 13 (in force 2025).

5. Israeli contract law and Civil Wrongs Ordinance -- misrepresentation risk.

6. Compliance-backlog Item 6 / C-E4 (Anthropic DPA obligation).

---

## Analysis

### A. Google API ToS (addresses Q1 partially and Q5 partially)

The GR-009 send-scope determination (Eyal, 2026-07-01) imposed per-action owner approval
as a COMPANY POLICY risk-management condition, not because Google ToS required it. Google
API Terms of Service for a desktop-app OAuth client accessing the authenticated account
holder's own Gmail do not prohibit autonomous agent-initiated sends where:
(a) the OAuth grant is valid and covers the send scope;
(b) the account holder has authorized the sending behavior (which they have -- this gate
    is the authorization process); and
(c) the sending is not bulk commercial email or in violation of Google's anti-spam and
    anti-abuse policies.

An allowlist-bounded send to a small set of pre-approved contacts is not bulk email under
any standard definition. The Google API Services User Data Policy disclosure, no-advertising,
and no-sale requirements are all satisfied for a company-controlled account used internally.

CONCLUSION: Google API ToS does NOT prohibit autonomous send on these facts. No new terms
obligation. CLEAR on Google ToS alone.

Knowledge basis: verified Eyal knowledge through August 2025. Live fetch not performed in
this session (same caveat as GR-009 base determination; no new information expected on
this narrow question).

### B. Israeli anti-spam law -- Communications Law Amendment 40 (Q2)

Amendment 40 to the Israeli Communications Law prohibits sending "commercial messages"
(havatzot mishar) -- broadly defined as messages sent for commercial promotion -- to an
individual recipient without their prior opt-in consent.

The gate request describes the scope as "bounded outbound comms (e.g. requesting
documents from pre-approved family/contacts)" for owner-office use. Document requests,
scheduling, and personal administrative communications are NOT commercial messages under
Amendment 40. They fall outside its scope and no opt-in requirement applies.

HOWEVER: two flagged constraints apply.

First: if the allowlist ever includes business contacts and the content could be
characterized as a commercial solicitation (promoting services, making a business offer,
requesting a business introduction), Amendment 40 opt-in requirements apply. The current
described use case (personal contacts, document requests) is outside Amendment 40 scope,
but any expansion toward business contacts or commercial content would change the analysis.

Second: the allowlist seed referenced in the broader GR-020 Eco context includes
leighton.adam@gmail.com (Adam, APS design partner). If Shelly sends business-development
or product-promotion content to Adam autonomously, opt-in must be confirmed. The existing
CS-0001 and APS-010 restrictions on Adam contact also apply independently.

CONDITION: no commercial or marketing content on the autonomous send path (C-AS3 below).
This is a hard legal condition, not an advisory.

### C. Israeli PPL and data protection (Q2 continued)

The autonomous composition step processes information about named, identifiable individuals
(the recipients). Even a document-request email contains personal data: the recipient's
name, relationship, context, what documents they hold, why they are being contacted. This
is personal data processing under PPL 5741-1981.

Amendment 13 obligations that apply:
- Purpose limitation: data about the recipient used only for the specific stated purpose
  of the communication.
- Minimization: only data necessary for the email's purpose is included.
- Transparency: individuals have a right to know how their data is being used.

Amendment 13 does not, as of my knowledge cutoff (August 2025), contain a specific
provision requiring disclosure that an email was AI-authored. The transparency principle
is broader -- individuals should be able to understand the processing affecting them.
An autonomous AI-authored communication to an individual is within scope of this principle.

NOTE: I cannot confirm whether any Israeli regulation enacted after August 2025 imposes
a specific AI-authorship disclosure obligation. This should be confirmed with local counsel
before the gate is extended to business or external counterparty recipients.

The hard blocker remains C-E4 (see below). PPL is manageable with conditions.

### D. Attribution, disclosure, and misrepresentation risk (Q1 and Q5)

Israeli law, as of my knowledge cutoff (August 2025), does not contain a specific statutory
requirement to label an email as AI-authored rather than human-authored.

However:

1. The Civil Wrongs Ordinance (Pekudat Nezikin) and Israeli contract law recognize
   actionable misrepresentation. If a recipient reasonably believes they are communicating
   with a human (jecki) and acts in reliance on that belief -- accepting a request,
   providing documents, entering into an arrangement -- a misrepresentation claim could
   arise if the AI-authored nature would have been material to their decision.

2. An email from shelly.synthetic.org@gmail.com, composed and sent entirely by an agent,
   creates an implicit representation about its authorship. The recipient has no basis to
   know otherwise unless told.

3. Shelly correctly identified risk R4: "Trust/attribution: third parties receive
   agent-authored mail 'from Shelly'; may need an explicit agent-sent marker/footer."
   This is legally accurate. A disclosure footer is the standard risk mitigation.

4. Liability: a sent email is attributable to the account holder (jecki/the company) and
   to the company-adjacent entity. No autonomous exemption exists in Israeli law. An
   agent-authored email that creates a contractual obligation, makes a factual
   representation, or is used as evidence in a dispute is treated identically to a
   human-authored email from the same account.

RECOMMENDATION AND CONDITION: a brief agent-authorship disclosure footer is mandatory on
every autonomously composed and sent email. Suggested text: "This message was composed
and sent by an AI assistant on behalf of [Owner Name]." This mitigates misrepresentation
claims and is consistent with the transparency principle of Amendment 13. As noted, this
is not confirmed as a statutory mandate under Israeli law through August 2025, but it is
strongly advised as a legal risk reduction measure.

### E. Record-keeping (Q3)

No specific Israeli law currently mandates email record retention for an unregistered
individual's personal Gmail use. Once the company is registered (compliance-backlog Item 1),
commercial bookkeeping regulations under the Income Tax Ordinance (Takanonim) may impose
record-keeping obligations on business communications.

Proactive practice: every autonomously sent email should be logged internally. This
creates an audit trail before formal legal obligations attach, supports the owner's
ability to review what has been sent on their behalf, and provides evidence if a sent
email is disputed.

Log minimum: To address, Subject, Timestamp, brief content summary (NOT verbatim body
-- PPL minimization applies). The log must be retained for at least 2 years (consistent
with the CS-0001 ticket retention precedent from Eyal EA-2, 2026-07-11).

CONDITION: send log is mandatory (C-AS7 below).

### F. Owner BCC as a control (Q4)

Owner BCC is a DETECTIVE control, not a PREVENTIVE one. Shelly identified this herself
as risk R2 ("BCC is detective, not preventive: owner sees the mail AFTER it is sent;
cannot stop it"). This characterization is legally accurate.

From a legal standpoint:
- BCC provides the owner with visibility after delivery. It does not enable the owner
  to intercept or prevent delivery of a misfired or injected email.
- A sent email is sent. The BCC copy does not give the owner a pre-send review gate.
- As an audit mechanism, BCC is adequate and valuable. As a preventive control, it
  provides no protection.

The gate conditions must acknowledge this distinction and must not represent BCC as
equivalent to pre-send owner review. Conditions that do misrepresent BCC as a preventive
control create a false sense of protection and could be cited against the company if a
problematic email is sent and the BCC did not prevent it.

BCC is mandatory as an audit tool. It is not a substitute for the preventive controls
(allowlist enforcement, content restrictions, C-AS5 no-legal-commitment rule).

### G. Compliance-backlog Item 6 / C-E4 -- BLOCKING (Q6)

This is the same finding as GR-020 (Eco autonomous send gate, Eyal, 2026-08-01) and
T-0047 (inbox triage, Eyal, 2026-07-26/07-27).

The autonomous composition step runs through the LLM. Shelly drafts the email text using
the LLM. If the email is directed to or references a named, identifiable individual, the
composition step constitutes LLM processing of that individual's personal data (their
name, relationship, context). This triggers the C-E4 requirement.

Israeli PPL Amendment 13, read against the compliance-backlog Item 6 analysis, requires
a formal Data Processing Agreement (DPA) with Anthropic to be in place before LLM
processing of third-party personal data occurs at scale. The current Claude Code MAX
subscription is a Consumer Terms product and does NOT auto-incorporate the Anthropic DPA.
The DPA is available only under Commercial Terms (Console/API account).

As documented in owner's Path A decision (gate-register GR-020, 2026-08-01): Path A
requires opening an API/Console account (Lital estimate approximately $13-28/month). The
Path A decision for GR-020 would also resolve C-E4 for this gate (GR-021). Both gates
unblock on the same owner action.

C-E4 STATUS: OPEN AND BLOCKING. No go-live on autonomous send (GR-021) until C-E4 is
resolved. This is the identical finding as GR-020 and T-0047.

---

## Verdict: CLEAR-WITH-CONDITIONS

On legal terms and obligations, CLEARED on all dimensions EXCEPT C-E4.

Dimensions cleared: Google API ToS (CLEAR, no autonomous-send prohibition), MIT license
(CLEAR, no new terms), Israeli anti-spam Amendment 40 (CLEAR for personal/administrative
content with conditions), attribution/disclosure (CLEAR with disclosure footer condition),
Israeli PPL (manageable with conditions).

C-E4 (Anthropic DPA, compliance-backlog Item 6) BLOCKS go-live. No other legal dimension
blocks this gate.

IMPORTANT: This verdict covers the Eyal (Legal) leg only. It does NOT authorize
installation or go-live. Rambo security review (parallel, filed separately in
company/security/reports/) is ALSO required. AND C-E4 must close before autonomous send
is enabled, regardless of both gate legs clearing. No installation authority derives from
this verdict alone.

---

## Conditions (Eyal, binding)

C-AS1 (BLOCKING -- go-live hard gate): C-E4 (Anthropic DPA, compliance-backlog Item 6)
   must be resolved before any autonomous send capability is enabled. The composition
   step LLM-processes third-party personal data. No autonomous send may go live until
   the Anthropic DPA is in place under Commercial Terms (Console/API account). The
   Path A resolution of GR-020's C-E4 (opening a Console account) unblocks this gate
   simultaneously.

C-AS2 (MANDATORY): Agent-authorship disclosure footer on EVERY autonomously composed
   and sent email. Example text: "This message was composed and sent by an AI assistant
   on behalf of [Owner Name]." This is a legal risk-reduction measure against
   misrepresentation claims under Israeli civil law. Not confirmed as a statutory mandate
   under Israeli law through August 2025. Flag to local counsel before extending scope
   to business counterparties or before any dispute arises regarding an autonomous send.

C-AS3 (HARD): No commercial or marketing content on the autonomous send path. Content
   must be transactional, administrative, or personal only. Any commercial solicitation,
   promotional message, or business offer to a recipient who has not provided opt-in
   consent would violate Israeli Communications Law Amendment 40. This restriction applies
   regardless of whether the recipient is on the allowlist.

C-AS4 (ACKNOWLEDGED, no waiver): Owner BCC is a detective audit control ONLY. It is not
   a preventive gate. Gate conditions must not represent BCC as equivalent to pre-send
   owner review. Shelly's own risk R2 characterization is legally accurate. No conditions
   may misrepresent the nature of the BCC control or treat it as substituting for
   preventive content or recipient controls.

C-AS5 (HARD): No legal commitments, contractual offers, factual representations creating
   reliance, warranty statements, or any content that could constitute a binding obligation
   under Israeli contract law in autonomously composed emails. If Shelly's composition
   includes any such content, the email must be held and routed to the owner for in-session
   review before send. The agent must not assess this independently -- if there is any
   doubt, hold and route.

C-AS6: The frozen split-send architecture (composer writes frozen message, separate send-job
   flushes stored bytes, no composition at send time) is a legal risk reducer in addition to
   a security one. It is a required structural control. It limits the window for injected
   content to reach the send path. Rambo to confirm technical enforcement. This gate endorses
   the structural requirement as legally significant.

C-AS7: Send log mandatory. Every autonomously sent email must generate an internal log entry
   containing: To address, Subject, Timestamp, brief content summary (not verbatim body --
   PPL minimization). Log must be retained in a retrievable internal file for at least 2
   years (consistent with CS-0001 Eyal EA-2 retention precedent). Owner must be able to
   produce this log on request.

C-AS8: Allowlist expansion scope. This gate clears the legal analysis for the allowlist as
   seeded at gate time. Any addition of business counterparties, external vendors, or
   commercial contacts must be treated as a scope expansion requiring fresh Eyal legal
   review. Adding business contacts changes the Amendment 40 opt-in analysis and the
   misrepresentation-risk profile materially.

---

## GR number flag (repeat for Eco clarity)

GR-020 is occupied (Eco autonomous send gate, 2026-08-01). This gate is GR-021.
Update T-0049 board row, all Shelly handoffs, and downstream references accordingly.
The file name of this memo (gate-gr020-...) follows the task envelope naming; the
gate ID is GR-021.

Full legal findings: this file.
Eyal sign-off date: 2026-08-02

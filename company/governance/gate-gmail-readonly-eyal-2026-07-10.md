# Gate Review -- Legal Leg
## Gmail READ-ONLY Connector (claude.ai, inbound read capability)

**Date:** 2026-07-10
**Reviewer:** Eyal (Legal, L3)
**Tasked by:** Eco (CEO), 2026-07-10
**Tool:** claude.ai Gmail connector -- `mcp__claude_ai_Gmail__*`
**Account:** eco.synthetic.org@gmail.com
**Scope under review:** inbound read capability (search_threads, get_thread) added so agents can catch APS design partner (Adam) replies. Draft capability (create_draft) already in GR-012 (Rambo, 2026-07-09).
**Baseline rows:** GR-012 (Rambo, 2026-07-09); GR-009 Eyal leg (2026-07-01 / 2026-07-08); Drive + Calendar gate bypass (owner A1, 2026-06-12). Decisions-log 2026-07-10 (Adam correspondence channel change, owner A1).

This review is the data-protection leg for the inbound read surface. GR-012 noted "no separate Eyal review required" based on the T-0037 draft-capability leg. That was the write-side analysis. The inbound read use case -- personal correspondence of an identified third party entering LLM context -- is a distinct legal question. Not a contradiction of GR-012: a supplement.

---

## Q1 -- Correspondence Content and Ingest Rule

**Personal data classification.** Adam's emails are personal data of an identified individual under Israeli Privacy Protection Law (PPL) 5741-1981. PPL definition: any information relating to an identified or identifiable person. Adam is identified by name, email address, and institutional affiliation (Ben-Gurion University / Hadassah). His replies contain his views, his professional communications, and references to third parties he chooses to mention. All of this is personal data. PPL applies.

**Future inbox risk.** eco.synthetic.org@gmail.com is a general company inbox. As APS progresses it could receive:
- University / college staff correspondence -- identified third-party personal data.
- Student-adjacent content (forwarded content, references to student progress or performance) -- this is the highest-sensitivity category under Israeli law. Student educational records carry elevated sensitivity even under PPL; cross-border considerations arise if any US institutions are involved.
- Clinical case material if Adam shares patient scenario content by email.

The existing CLAUDE.md ingest rule ("never store raw email content in tracked files; summaries only; never send personal correspondence to a summarization model without A1 + privacy review") is the correct legal framework and is required under PPL data-minimisation. However, read literally, the "no summarization without A1 + privacy review" clause blocks every email body read through an LLM -- operationally unworkable. The resolution: this gate is the standing A1 pre-authorization for the bounded-purpose use case (Adam / APS coordination). The rule is satisfied by this gate IF the bounded conditions below hold.

**Conclusion on Q1.** The existing CLAUDE.md rule is legally sufficient as a framework. It must be extended explicitly to cover Gmail inbound reads (get_thread, search_threads) with the bounded-purpose grant recorded in this gate. The rule currently names storage in tracked files; it must equally constrain what body content enters LLM context.

---

## Q2 -- Purpose Limitation

PPL 5741-1981 + Amendment 13 require that personal data be processed only for the purpose for which it was collected or a directly compatible purpose.

**Stated purpose.** Reading inbound replies from Adam (APS design partner) at eco.synthetic.org@gmail.com, in response to coordination emails the owner sent from that account, for APS pilot coordination. This is specific, defined, and directly compatible with the reason Adam's address is in the inbox.

**Mission-creep risk.** Without a bounded-query rule, an agent with search_threads access could search and read unrelated correspondence from other senders. That would be a purpose-limitation violation -- the connector was authorized for APS coordination, not general inbox surveillance. The existing CLAUDE.md "never search broadly" prohibition covers this at a high level; the condition below makes it concrete for Gmail inbound.

**Purpose statement (for gate row and CLAUDE.md update).** "Reading inbound correspondence from Adam [named APS design partner] at eco.synthetic.org@gmail.com, bounded by Adam's sender address and/or active APS pilot thread subjects, for APS pilot coordination. No general inbox surveillance. Correspondence from any other sender requires separate in-session A1."

---

## Q3 -- Delta: Mail Content vs Drive Docs in Processing Chain

**Google terms: no delta.** Google API Services User Data Policy applies equally to Drive, Gmail, and Calendar for internal single-account use. The 2026-06-12 gate bypass and GR-009 Eyal leg (2026-07-01) cleared the Google vendor relationship. No new Google terms obligation arises from adding Gmail inbound read.

**Anthropic processing chain: meaningful delta on content sensitivity.** When an agent calls get_thread and the email body enters Claude's context, that content is processed by Anthropic (same subscription, same T-0013 / GR-012 rationale -- no new vendor). But the content type is different:
- Drive docs = primarily internal working files created by or for the company.
- Email bodies = personal correspondence of identified third parties (the sender) who did not consent to having their communications processed by an LLM on behalf of the recipient.

Email is categorically higher-sensitivity input under PPL because it contains another person's communications. PPL minimisation requires that processing go no further than necessary for the stated purpose.

**Anthropic DPA gap.** Compliance-backlog Item 6 (Anthropic DPA formal execution) is still open as of 2026-07-10. The gap predates Gmail access -- Drive content processing through the LLM has the same unresolved gap. However, email body content is a higher-sensitivity trigger for the same gap because it is personal correspondence of identified third parties. Having an LLM summarize Adam's reply is processing personal data through a third-party processor (Anthropic) without a formally executed DPA satisfying PPL Amendment 13 processor obligations. This is not a new risk created by this gate but it is escalated in urgency by it.

Header / metadata reads (sender, subject, date) do not raise the same DPA concern -- they do not pass substantive personal data through the model. Body reads do.

**Injection surface delta.** Email is a higher injection-risk vector than Drive docs. Third parties can send emails specifically composed to manipulate agent behavior. Rambo's GR-012 C-G2 (tainted-content rule) already addresses this. Eyal concurs and adds a legal dimension: an injected instruction that causes an agent to process personal data beyond the authorized purpose is a PPL purpose-limitation violation in addition to a security incident. C-G2 is legally necessary, not optional.

**Anti-spam and Communications Law.** Israeli Communications Law Amendment 40 (anti-spam) is not triggered. These conditions govern receiving email, not sending. No issue.

---

## Q4 -- Verdict

**CLEAR-WITH-CONDITIONS.**

Google / vendor terms: already cleared at baseline; no delta; no new terms obligation.
Conditions below are data-protection conditions under Israeli PPL, not vendor-terms conditions.

---

### Conditions

**C-E1 -- PURPOSE SCOPE.** Agents may use search_threads and get_thread only with queries bounded to Adam's sender address and / or active APS pilot thread subjects. No general inbox search. Reading correspondence from any other sender requires separate in-session A1 from owner or Eco.

**C-E2 -- INGEST RULE (extended to Gmail inbound).** Thread metadata (sender, subject, date) may be read and summarized freely within bounded query scope. Email body content: (a) no verbatim body stored in any tracked file; (b) agent may produce summaries stating topic, key action items for APS coordination, and follow-up questions -- no more; (c) no personal data included in summaries beyond what is operationally necessary for APS coordination.

**C-E3 -- STUDENT AND CLINICAL CONTENT HARD STOP.** If any email body accessed contains student names, student performance data, health information, clinical case details, or other sensitive personal data: agent must NOT ingest the body content into tracked files or LLM context. Flag to owner immediately. Not a judgment call -- hard stop regardless of apparent relevance to APS coordination.

**C-E4 -- ANTHROPIC DPA PRECONDITION.** Reading thread metadata to locate Adam's reply is acceptable before Item 6 closes. Having the LLM summarize the body of Adam's reply before compliance-backlog Item 6 (Anthropic DPA) is closed = residual PPL processor-obligation gap. If the owner authorizes body reads before Item 6 closes, that must be an explicit in-session A1 residual-risk-acceptance decision. Recommended: prioritize Item 6 close before first agent body-content read.

**C-E5 -- NO AUTONOMOUS POLLING.** Each use of get_thread or search_threads requires explicit in-session direction from owner or Eco. No standing automated inbox read or polling cadence without per-session A1.

---

## Notes for Eco (post-gate)

1. CLAUDE.md "Google Workspace connectors -- Gmail" section must be updated to extend the bounded-purpose grant to inbound read (get_thread, search_threads) with conditions C-E1 through C-E5. Eco executes after owner A1 grant.
2. Compliance-backlog Item 6 (Anthropic DPA): owner should prioritize closing this item before agents are directed to summarize email body content. Urgency increased by this gate.
3. Owner OAuth re-consent for the Gmail connector is still required to make read tools functional. That is owner browser action; not a gate condition.
4. GR-012 Eyal posture ("No separate Eyal review required") was based on the T-0037 draft-capability leg. This document is the formal inbound-read data-protection leg. Eco to append a reference to GR-012 pointing to this file.
5. Nothing in this analysis accepts, enables, or activates any tool. Owner performs OAuth consent. Eco updates CLAUDE.md and gate-register row after A2 / A1 grant.

**Eyal (Legal) -- 2026-07-10**

---

## C-E5-ADDENDUM -- Runner Automation Privacy Review
**Date:** 2026-07-10
**Reviewer:** Eyal (Legal)
**Trigger:** owner A1 granted 2026-07-10 for standing Gmail automation (decisions-log: "Runner email trigger approved"). Eco tasked Eyal to confirm the recurring automated shape stays within PPL purpose limitation as registered.
**Source read:** integrations/runner/agent-prompts.md (Rambo -- Adam Inbox Screen block); decisions-log 2026-07-10 ("Runner email trigger approved").

**Question:** does the 2h recurring Rambo-screen -> Eco-process pipeline stay within the PPL purpose limitation registered in Q2 (catching Adam's APS pilot coordination replies)?

**Analysis:**

Purpose match: YES. The runner job queries `from:Adam` on active APS threads only -- exactly the registered purpose. No wider inbox access. The Rambo prompt makes this explicit: "NEVER query anything else. NEVER read other senders, even if a thread contains them."

Time-boxing: POSITIVE under PPL minimisation. Expiry at 2026-07-14 or on Adam's first reply (whichever comes first) means the automation is strictly bounded to the concrete operational need. Once Adam replies, step 0 of the Rambo prompt self-terminates the job. Processing personal data only for as long as necessary is a PPL Amendment 13 requirement; the design satisfies it.

Two-stage architecture: STRONGER than a per-session read for PPL purposes. Raw email body is processed by Rambo only; Eco processes a Rambo-curated summary, never the raw content. C-E3 (student/clinical hard stop) is embedded in Stage 1 before any content reaches Stage 2. This limits the scope of personal data processing to one agent and one purpose-filtered output -- consistent with data-minimisation.

C-E2 (ingest rule) -- short-quote allowance: the Rambo prompt permits "short quotes needed for fidelity on the B1/B2 answers -- session-count choice a/b/c and sign-off confirmation." This is a narrow, purpose-justified exception. For binary factual choices (did Adam say a, b, or c on the session-count question; did he confirm sign-off?), paraphrase risks introducing error. Short quotes limited to that factual determination are within PPL minimisation -- they are the minimum necessary for accurate APS coordination. Wholesale body quoting remains prohibited; this allowance covers only the choice-confirmation phrases.

C-E3 (hard stop): correctly embedded. Rambo QUARANTINE verdict = no content summary, owner-only file, no Stage 2 processing. Implementation is correct.

C-E4 (Anthropic DPA gap): owner A1 accepted residual risk for the Adam business thread only (decisions-log 2026-07-10). That acceptance is on record and covers Rambo's LLM processing of Adam's email body in this automation. No new condition needed.

General inbox surveillance: ruled out by the expiry mechanism, the `from:Adam` hard-bound at step 1, and the per-message new-mail check at step 2 (stops immediately if nothing new).

**VERDICT: APPROVED-AS-SHAPED.**

The recurring automated shape stays within PPL purpose limitation as registered. The two-stage screen-then-process architecture is materially compliant with PPL data-minimisation -- it is stricter, not looser, than a per-session read on most dimensions.

No new conditions. The short-quote allowance (Rambo step 4) is a C-E2-compliant narrow exception; Rambo must keep quotes to the minimum needed for choice-confirmation fidelity (a/b/c and sign-off), not wholesale body excerpts.

**Eyal (Legal) -- 2026-07-10 (C-E5 addendum)**

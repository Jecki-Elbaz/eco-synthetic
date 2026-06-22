# Eco-Synthetic: Policy Framework

- **Owner:** Dalia (Quality & Governance)
- **Version:** 0.1 (initial, 2026-06-22)
- **Status:** DRAFT -- advance to A2 (Eco approves framework structure) then A1 (owner) for full activation
- **Authority:** owner direction 2026-06-15 (decisions-log, item 2 of 6-part decision)
- **Reference:** company/constitution.md (section 3, 5, 13); company/soul.md; CLAUDE.md

---

## 1. What is a company policy?

A policy is a standing rule that governs behavior across the company (or a defined group or domain).
A document qualifies as a policy only if it meets ALL of the following criteria:

1. **Real need.** A recurring situation exists that requires a consistent rule. One-off decisions
   are not policies; they belong in decisions-log.md.
2. **Clear value.** The rule reduces ambiguity, prevents errors, or enforces a standard that matters.
   Policies that merely restate what the constitution or soul doc already says are not needed.
3. **No contradiction.** The rule does not conflict with the constitution, the soul doc, CLAUDE.md,
   or any red line. If a conflict exists, it must be resolved before the policy is adopted.
4. **No overload.** The rule is scoped narrowly enough that agents can follow it without excessive
   cognitive load. Overly long or complex policies are sent back for tightening.
5. **Owner or appropriate gate.** The policy has an identified owner (a live agent or Dalia as interim)
   who is responsible for maintaining it.

Dalia reviews every proposed policy against these five criteria before it enters the A2/A1 approval path.

---

## 2. Where policies live

All company policies live in company/policies/.

- Each policy is its own file: company/policies/<kebab-case-name>.md.
- File names use lowercase and hyphens only. No spaces. No versioned suffixes in the filename; version
  is tracked inside the file.
- The policy-framework.md (this file) is the index and meta-standard. It is updated when a new policy
  is added or retired.
- No policy lives outside company/policies/ except where the constitution or soul doc IS the policy
  (those are not duplicated here).

---

## 3. Access

- company/policies/ is part of company/ (restricted per access-matrix.md).
- Read: Eco, Dalia (Q&G), Anat (HR), Rambo (Security), Eyal (Legal), Lital (CFO), and any agent
  that needs a specific policy to do its job (need-to-know).
- Write: Dalia (drafts and framework); other owners draft their policy domain, Dalia reviews before A2.
- All agents are governed by active policies regardless of whether they have direct read access.
  Eco ensures policies reach agents via role-file updates, soul propagation, or onboarding.

---

## 4. Version control

- Every policy file carries a version block in its header: ID, version number, status, owner, and a
  change-log table.
- Version numbering: 0.x = draft; 1.0 = first activated version; increment major on substantive
  rule change, minor on clarifications.
- Status values: DRAFT | ACTIVE | SUPERSEDED | RETIRED.
- An activated policy's version 1.0 entry must be logged in decisions-log.md (A1 or A2 gate, per scope).
- Retired policies are marked RETIRED and kept in company/policies/ for history; they are not deleted.

---

## 5. Approval gates

| Scope | Gate | Notes |
|-------|------|-------|
| Policy framework (this doc) | A2 (Eco) + A1 (owner) | Owner decides what counts as a company-wide policy standard |
| Company-wide behavioral policy (e.g., communication, tone) | A1 (owner) | Affects every agent; owner gate required |
| Domain policy (e.g., CS-0001, security baseline) | A2 (Eco); owner notified | Domain owner drafts; Dalia reviews; Eco approves; A1 if it touches red lines or agent scope |
| Q&G-internal process note | A3 (Dalia) | Governance operating notes, not binding company-wide rules |

---

## 6. Policy index

| Policy ID | Name | File | Owner | Status | Gate | Activated |
|-----------|------|------|-------|--------|------|-----------|
| POL-001 | Human-Communication Policy | human-communication-policy.md | Dalia (Q&G) | DRAFT v0.2 | A1 required | pending |
| CS-0001 | Customer-Communication Policy | (not yet created) | Mike (VP CS) | not started | A1 + product-live | blocked on Mike + product |

---

## 7. Proposing a new policy

Any agent may propose a policy by writing a draft in company/policies/ and routing it to Dalia
for a framework-criteria check (section 1). Dalia returns a finding within her normal audit cadence
or on-demand if time-sensitive. After Dalia confirms the criteria are met, the draft enters the
appropriate approval gate (section 5). Dalia logs the approval in decisions-log.md.

Do not write policy-like rules into agent role files, CLAUDE.md, or the soul doc as a substitute for
this process. Those files govern their own domain; policies go here.

---

## 8. Dalia's R&R note (A1 flag)

The 2026-06-15 owner decision assigns policy-framework ownership to Dalia and requires a Dalia role-file
update to reflect this responsibility. That role-file edit is A1 (red line 6; .claude/agents/ is
owner/CEO-only). Dalia does NOT self-edit her role file. This flag is recorded here so the owner can
action it in the next Claude Code session.

Specifically needed in Dalia.md: add "policy framework ownership" and "policy approval gate review" to
Responsibilities; add company/policies/ to Key files; add policy-review cadence to Triggers.

**Owner A1 required to execute the role-file update.**

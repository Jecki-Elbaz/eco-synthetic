# Eco-Synthetic: Roster and Consolidation (v2.3)

Source of truth for company structure. This file is REBUILT FROM GROUND TRUTH:
the 32 role files in `.claude/agents/*.md` (frontmatter: name, description, level,
group, reporting line) plus `company/org-chart.mermaid` (last updated 2026-06-28,
owner A1). Where a role file and the org chart disagree, the ROLE FILE wins and the
difference is recorded in section 7.

Shelly is NOT in this roster: she separated into her own standalone project
2026-06-20 and is now an external party (see `company/customers/shelly/profile.md`).

> v2.3 changes: full rebuild. Retired persona names removed (Tim -> Sally,
> Noam -> Perry, Avner -> Jack, unnamed Designer -> Tal). Five previously OMITTED
> agents added (Oracle, Yael, Yossi, RedTeam/Red, MeetingPrep). Every agent in
> `.claude/agents/` now has a row. Closes Rambo's BF-1/BF-2 permission-drift finding.

---

## 1. Full roster (32 agents + owner)

Level: L1 owner, L2 CEO, L3 VP/staff, L4 individual contributor.
Phase: P1 live-now track, P2 second wave, P3 post-product.
Status: LIVE = certified and active. Gating notes are hard constraints, not aspirations.

| Name | Role | Level | Group | Reports to | Phase | Status |
|------|------|-------|-------|-----------|-------|--------|
| jecki | Owner | L1 | - | - | - | A1 authority on everything |
| Eco | CEO | L2 | - | Owner | P1 | LIVE |
| Luci | Devil's Advocate | owner office | Owner office | Owner | P1 | LIVE (on-demand; 1+1 challenge cap) |
| Erez | Investor | owner office | Owner office | Owner | P1 | LIVE (on-demand; owner invokes) |
| Dalia | Quality & Governance | L3 staff | CEO staff | Eco | P1 | LIVE |
| Anat | HR / Agent-Ops | L3 staff | CEO staff | Eco | P1 | LIVE |
| Assaf | Operational Excellence | L3 staff | CEO staff | Eco | P1 | LIVE |
| Rambo | Security | L3 staff | CEO staff | Eco | P1 | LIVE (tasked by Eco only) |
| Eyal | Legal | L3 direct | CEO staff | Eco | P1 | LIVE (tasked by Eco or jecki only) |
| Lital | CFO / Finance | L3 | CEO staff | Eco | P1 | LIVE (budget 0; tracks, cannot authorize spend) |
| Oracle | Build-historian | L3 staff | CEO staff | Eco (dotted: Dalia, Hila) | pulled-forward | LIVE (read-only confidential posture) |
| Zvika | Research analyst | L4 | CEO staff | Eco | P2 | LIVE (gated: A2 required to wake) |
| Yael | Knowledge / Documentation Manager | L4 | CEO staff (under Dalia) | Dalia | P2 | LIVE |
| Yossi | Training & Enablement | L4 | CEO staff (under Assaf) | Assaf (dotted: Anat) | P2 | LIVE |
| RedTeam (Red) | Red-Team Security Tester | L4 | Security (under Rambo) | Rambo | P1 | LIVE (on-demand; tasked by Rambo only; sandbox-only, no Bash, no Edit) |
| Perry | VP Product | L3 | Product | Eco | P1 | LIVE |
| Designer (Tal) | Product UX/UI Designer | L4 | Product | Perry | P2 | LIVE (marketing-design scope still gated -- board AUD-011) |
| Sami | SME advisor | L4 | Product | Perry (project lead per project) | on-demand | LIVE (one instance per project; `projects/<name>/` only) |
| Ido | VP R&D (holds CTO scope) | L3 | R&D | Eco | P1 | LIVE |
| Gal | Lead Developer | L4 | R&D | Ido | P1 | LIVE (Bash; owner-session spawn only) |
| Shir | DevOps | L4 | R&D | Ido | P1 | LIVE (Bash; owner-session spawn only; dotted git/CI-CD hygiene line to Eco/owner) |
| Adi | QA Engineer | L4 | R&D | Ido | P2 | LIVE (Bash; owner-session spawn only) |
| Oren | Senior Developer / Code Reviewer | L4 | R&D | Ido | P2 | LIVE (no Bash, but owner-session spawn only per SEC-0001) |
| Noa | Senior Developer 2 (AI Patient Simulator) | L4 | R&D | Ido | P1 | LIVE (Bash scoped to build commands; owner-session spawn only) |
| Roman | Algorithm Specialist | L4 | R&D | Ido | P2 | LIVE (on-demand; Ido invokes via A2) |
| Mike | VP Customer Success | L3 | Customer Success | Eco | P3 | LIVE (no customer contact until product live) |
| Jenny | Customer Support (tier-1) | L4 | Customer Success | Mike | P3 | LIVE (no customer contact until product live) |
| Jack | CS Manager + Account Manager | L4 | Customer Success | Mike | P3 | LIVE (no customer contact until product live) |
| Ella | Customer Trainer / Education | L4 | Customer Success | Mike | P3 | LIVE (no customer contact until product live) |
| Sally | VP Sales | L3 | Sales | Eco | P1 (pulled forward from P3) | LIVE |
| Hila | Marketing | L4 | Sales | Sally (Eco for company-narrative posts) | P1 full track | LIVE (all public publishing = A1 per action + Eyal + Rambo) |
| Alex | Sales Execution | L4 | Sales | Sally | P3 | LIVE (every prospect/customer communication is A1; nothing sent until product + approved pricing) |
| MeetingPrep | Meeting Preparation Specialist | L4 | Sales | Sally | P3 | LIVE (on-demand; prep-only, never contacts clients) |

Registry note: the agent-type / file key for Tal is `Designer`
(`.claude/agents/Designer.md`) so tooling stays stable; the persona name is Tal.
Same pattern for Red (`RedTeam`) and MeetingPrep.

CS-0001 (customer-communication policy) is APPROVED and ARMED (owner A1 2026-07-26).
The remaining constraint on Mike / Jenny / Jack / Ella / Alex is PRODUCT-LIVE, not
the policy. No product is live, so no customer contact is authorized today.

---

## 2. Group summary

| Group | Head | Members |
|-------|------|---------|
| Owner office | jecki | Luci, Erez |
| CEO staff | Eco | Dalia (+Yael), Anat, Assaf (+Yossi), Rambo (+Red), Eyal, Lital, Oracle, Zvika |
| Product | Perry | Designer (Tal), Sami |
| R&D | Ido | Gal, Shir, Adi, Oren, Noa, Roman |
| Customer Success | Mike | Jenny, Jack, Ella |
| Sales | Sally | Hila, Alex, MeetingPrep |

Counts: 1 owner + 1 CEO + 2 owner office + 11 CEO staff (incl. sub-agents Yael,
Yossi, Red) + 3 Product (incl. Perry) + 7 R&D (incl. Ido) + 4 CS (incl. Mike) +
4 Sales (incl. Sally) = 32 agent role files.

---

## 3. R&R clarifications applied

- **Adi (QA)**: owns test plans; feeds Gal when bugs repeat in a pattern; reports quality
  trends to Dalia. Independent escalation line to Dalia confirmed.
- **Ido (VP R&D)**: manages Gal, Shir, Adi, Oren, Noa, and Roman; holds CTO scope
  (dedicated CTO hire deferred with a named trigger); owns R&D efficiency, the
  requirements relationship with Perry, and release quality.
- **Shir (DevOps)**: reports to VP R&D, communicates only within his VP's group; owns R&D
  backend infrastructure, tools, and environments, plus release pipeline mechanics,
  deploy/rollback, internal IT, and live monitoring. DOTTED LINE (owner A1 2026-06-30):
  Shir also owns the company-wide git/CI-CD hygiene function and is tasked on THAT
  function by Eco/owner directly; Ido stays solid-line manager for all R&D work.
- **Mike (VP CS)**: owns the post-sale org and NRR; manages Jenny, Jack, Ella, account
  management, and professional services (config-level; code escalates to R&D via the VPs).
  Owns CS-0001.
- **Sally (VP Sales)**: owns sales strategy, pricing and packaging, GTM, pipeline; manages
  Hila, Alex, and MeetingPrep.
- **Perry (VP Product)**: owns roadmap, requirements, product specs; manages Tal (Designer)
  and Sami.
- **Dalia (Q&G)** manages Yael; **Assaf (Op-Ex)** manages Yossi (dotted to Anat);
  **Rambo (Security)** manages Red (RedTeam).
- **Eco (CEO)**: may reach any agent, respects the chain of command, validates agents' tool needs.
- **Each VP or manager** owns the assessment of hiring or dismissing agents in its group.
  Create or retire is A1, executed with HR (Anat).
- **Eyal (Legal) + Lital (CFO)** jointly own the compliance-readiness backlog (Israeli
  registration, invoicing, privacy) and surface it to Eco proactively.

---

## 4. Consolidation (approved)

Cut into DevOps (Shir): Version/Release Manager, Delivery/Deployment, IT.
Made on-demand: Algorithm Specialist (Roman), Research (Zvika), SME (Sami),
MeetingPrep, Red (RedTeam), Luci, Erez.
Added since v2.2: Oracle (build-historian, pulled forward), Yael (knowledge/doc,
under Dalia), Yossi (training, under Assaf), Red (red-team, under Rambo),
Noa (Senior Developer 2, APS).
Watch Shir as a possible bottleneck and split if load grows.

---

## 5. External-interface notes

- Eyal (Legal): access to Israeli-law MCP or skills (via the gate).
- Lital (CFO): access to Israeli-finance MCP or skills (via the gate).
- Tool and skill needs are flagged by each agent to its manager; Operational Excellence
  (Assaf) leads periodic discovery of new tools, MCP, skills, commands, and prompts,
  executed with Training (Yossi), including an all-agent survey on workflows and gaps.
- All external tools pass the Security + Legal gate and land in
  `company/governance/gate-register.md`.

---

## 6. Spawn-path note (who can be reached from where)

Not every live agent is reachable from every surface. Three separate mechanisms:

- **Telegram-bridge Agent tool** (Eco): allowlist in
  `company/governance/agent-tool-spawn-allowlist.md`.
- **Scheduled runner dispatch** (owner A1 2026-08-02): rambo, eyal, dalia, anat only;
  depth 1, act cycles only, capped per cycle. Same file, "Runner Agent-tool dispatch".
- **Owner-session only**: gal, shir, adi, oren, noa (guard `OWNER_SPAWN_ONLY`,
  SEC-0001 code-builder restriction). Work needing them is queued in
  `memory/dispatch-queue.md`.

This roster records the org; the allowlist file records the reachability. Keep both in sync.

---

## 7. Known discrepancies with company/org-chart.mermaid (2026-06-28)

Recorded, not silently reconciled. Anat (HR/Agent-Ops) owns the org-chart file.

1. **Zvika level**: role file says L4; org chart says L3. This roster uses L4 (role file).
2. **Sally phase**: role file says "P1 -- pulled forward from P3"; org chart still shows P3.
   This roster uses P1 (role file), consistent with ONB-013 closing Sally VP Sales 2026-06-21.
3. **Hila phase**: role file says "P1 full track"; org chart still says "P1 light".
   This roster uses full track (role file), consistent with ORG-001 done 2026-06-18.
4. **Grouping**: the org chart parks Yael, Yossi, Red, Designer, and Sami inside the
   "CEO staff" subgraph even though they report to Dalia, Assaf, Rambo, and Perry
   respectively. This roster places them under their actual manager.

---

## 8. Open naming / role notes

- Designer persona name Tal is assigned and live; the file key stays `Designer.md`.
- Yossi (Training & Certification) now has a roster row -- the constitution section 10
  lifecycle reference is satisfied; Yossi does NOT certify agents (that is Anat).
- Multi-model infrastructure: router Phase A designed (Claude-only skeleton), build
  in progress -- see `company/model-matrix.md` and board T-0004.

---

## Revision

- **v2.3 -- 2026-08-02.** Full rebuild from `.claude/agents/` ground truth (32 role
  files) plus `company/org-chart.mermaid`. Removed retired persona names
  (Tim, Noam, Avner, "(unnamed) Designer"); added the five omitted agents
  (Oracle, Yael, Yossi, RedTeam/Red, MeetingPrep); added level, group, reports-to,
  phase, and live/gated status for every agent; recorded the four org-chart
  discrepancies in section 7 instead of hiding them. Closes the BF-1/BF-2
  permission-drift finding raised in Rambo's weekly scan (open across six
  consecutive scans, 14+ days overdue at the time of this rebuild).
- **v2.2** -- Hila reconciled to P1 (light track); Designer added to the table;
  Pending Additions refreshed.

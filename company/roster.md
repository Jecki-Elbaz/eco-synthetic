# Eco-Synthetic: Roster and Consolidation (v2.2)

Current source of truth for structure. Full per-agent role files regenerate from the template as each agent is built; Eco, Shelly, Hila, and Designer are drafted in `.claude/agents/`.

> v2.2 changes: Hila reconciled to P1 (light track); Designer added to the table (role file drafted); Pending Additions refreshed.

---

## 1. Final names

| Name | Role | Level | Phase | Reports to |
|------|------|-------|-------|-----------|
| jecki | Owner | L1 | - | - |
| Eco | CEO | L2 | P1 | Owner |
| Ido | VP R&D | L3 | P1 | CEO |
| Mike | VP Customer Success | L3 | P3 | CEO |
| Tim | VP Sales | L3 | P3 | CEO |
| Lital | CFO / Finance | L3 | P1 | CEO |
| Eyal | Legal | L3 (direct) | P1 | CEO |
| Dalia | Quality & Governance | L3 staff | P1 | CEO |
| Noam | Product | L3 staff | P1 | CEO |
| Zvika | Research (gated) | L3 staff | P2 | CEO |
| Anat | HR / Agent-Ops | L3 staff | P1 | CEO |
| Assaf | Operational Excellence | L3 staff | P1 | CEO |
| Rambo | Security | L3 staff | P1 | CEO |
| Gal | Lead Developer | L4 | P1 | VP R&D |
| Shir | DevOps | L4 | P1 | VP R&D |
| Adi | QA | L4 | P2 | VP R&D |
| Roman | Algorithm Specialist (on-demand) | L4 | P2 | VP R&D |
| (unnamed) | Senior Developer / Code Reviewer | L4 | P2 | VP R&D |
| (unnamed) | Designer (Product UX/UI) | L4 | P2 | Product (Noam) |
| Jenny | Support | L4 | P3 | VP CS |
| Avner | Customer Success | L4 | P3 | VP CS |
| Ella | Customer Training | L4 | P3 | VP CS |
| Alex | Sales | L4 | P3 | VP Sales |
| Hila | Marketing | L4 | P1 (light) | VP Sales |
| Shelly | Office Manager | owner office | P1 | Owner |
| Luci | Devil's Advocate | owner office | P1 | Owner |
| Erez | Investor (on-demand) | owner office | P1 created | Owner |
| Sami | SME advisor (on-demand, per project) | advisory | as needed | invoking function |

The Senior Developer and the Designer still need names; Anat (HR) and Eco assign them during build, with the owner's pre-approval.

- **Eyal (Legal) + Lital (CFO)** jointly own a compliance-readiness backlog (Israeli registration, invoicing, privacy) and surface it to Eco proactively so it is prioritized and never a surprise.

---

## 2. R&R clarifications applied

- **Adi (QA)**: owns test plans; feeds Gal when bugs repeat in a pattern; reports quality trends to Dalia. Independent escalation line to Dalia confirmed.
- **Ido (VP R&D)**: manages Gal, Shir, Adi, Roman, and the Senior Developer; owns R&D efficiency, the requirements relationship with Noam, and release quality. Eco assigns Ido the task to consider the suggested scope additions (definition-of-done and release gate, technical-debt and architecture across projects, R&D capacity and prioritization, regression-prevention, when to invoke Roman or Sami) and to propose a course of action acceptable to both Eco and Ido.
- **Shir (DevOps)**: reports to VP R&D, communicates only within his VP's group; owns R&D backend infrastructure, tools, and environments (config, availability, alternatives), plus release pipeline mechanics, deploy/rollback, internal IT, and live monitoring. Only VP R&D approves his plans; VP R&D is itself bound by policy and limits.
- **Mike (VP CS)**: owns the post-sale org and NRR; manages Jenny, Avner, Ella, account management, project management (if needed), and professional services (config-level; code escalates to R&D via the VPs). Absorbs the former Service-Operations Lead. Operations agent deferred.
- **Eco (CEO)**: may reach any agent, respects the chain of command, validates agents' tool needs, and decides the VP Product question.
- **Each VP or manager** owns the assessment of hiring or dismissing agents in its group for efficiency; create or retire is A1, executed with HR (Anat).

---

## 3. Consolidation (approved)

Cut into DevOps (Shir): Version/Release Manager, Delivery/Deployment, IT. Made on-demand: Algorithm Specialist (Roman). Single generalist: Research (Zvika). Added: Senior Developer / Code Reviewer (2-round cap), SME pool (Sami). Watch Shir as a possible bottleneck and split if load grows.

---

## 4. External-interface notes

- Eyal (Legal): access to Israeli-law MCP or skills (via the gate).
- Lital (CFO): access to Israeli-finance MCP or skills (via the gate).
- Documentation and notes store: Obsidian (approved) or repo markdown.
- Tool and skill needs are flagged by each agent to its manager; Operational Excellence (Assaf) leads periodic discovery of new tools, MCP, skills, commands, and prompts, executed with Training (Yossi), including an all-agent survey on workflows and gaps.

---

## 5. Pending additions (status)

- **Designer (product group)**: role file **drafted** — L4, P2, reports to Noam; see `.claude/agents/Designer.md`. Open: Eco decides at go-live whether it also covers marketing design; name assigned by Anat + Eco at build (owner pre-approval).
- **Multi-model infrastructure**: router **designed (Phase A)** — Claude-only skeleton; see `company/model-matrix.md`. Adding any second model is deferred (local) / shelved (hosted, A1).
- **Claw evaluation**: **decided — shelved**; NanoClaw held in reserve only as a future gated, sandboxed tool after a Rambo security review.

---

## 6. Open naming / role notes

- Senior Developer and Designer: names assigned at build by Anat + Eco, owner pre-approval.
- Training & Certification (Yossi) is referenced in the constitution lifecycle (§10) but has no row above — add a roster entry/owner if Training becomes a standing agent rather than a function of HR + OE.

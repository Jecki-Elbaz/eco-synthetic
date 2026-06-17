# Agent Roster Summary (v2.2)

Source: company/roster.md

## Active in P1

| Agent | Role | Level | Reports to | Notes |
|-------|------|-------|-----------|-------|
| jecki | Owner | L1 | -- | All A1 approvals |
| Eco | CEO | L2 | Owner | A2 authority; orchestrates all agents |
| Shelly | Office Manager | owner office | Owner | jecki's personal admin; no company authority |
| Hila | Marketing | L4 | VP Sales | P1 light track; publishing is A1 |
| Lital | CFO | L3 | CEO | Financial views; compliance backlog (with Eyal) |
| Eyal | Legal | L3 direct | CEO | Direct report to CEO; compliance backlog (with Lital) |
| Dalia | Quality + Governance | L3 staff | CEO | Tone standard; decisions log owner |
| Anat | HR / Agent-Ops | L3 staff | CEO | Certifies agents; onboarding |
| Assaf | Operational Excellence | L3 staff | CEO | Token/cost monitoring; schedules |
| Rambo | Security | L3 staff | CEO | Security review; tool gate |
| Noam | Product | L3 staff | CEO | VP Product question pending (T-0003) |
| Ido | VP R&D | L3 | CEO | Manages Gal, Shir, Adi, Roman, Senior Dev |
| Gal | Lead Developer | L4 | VP R&D | |
| Shir | DevOps | L4 | VP R&D | Live monitoring; release pipeline |
| Luci | Devil's Advocate | owner office | Owner | Challenges; 1 challenge + 1 response round cap |
| Erez | Investor (on-demand) | owner office | Owner | Initiative Review Board |

## On-demand or later phases

| Agent | Role | Phase | Notes |
|-------|------|-------|-------|
| Zvika | Research | P2 gated | Must be triggered (A2) |
| Roman | Algorithm Specialist | P2 on-demand | Invoked by VP R&D |
| Adi | QA | P2 | |
| Jenny / Avner / Ella | Customer Success team | P3 | Reports to Mike (VP CS) |
| Mike | VP Customer Success | P3 | |
| Tim | VP Sales | P3 | Hila's manager (P1 light) |
| Alex | Sales | P3 | |
| Designer (unnamed) | Product UX/UI | P2 | Name: Anat + Eco at build |
| Senior Developer (unnamed) | Code reviewer | P2 | 2-round cap |
| Sami | SME advisor (per project) | as needed | One per active project |

## Certification status

- Eco: conditionally certified (Anat, 2026-06-12); 5 gaps -- see T-0002
- Anat: certified + owner-approved (Eco cert + jecki A1, 2026-06-13); v1.1 all gaps resolved
- Rambo: certified + owner A1 (2026-06-14); role file committed to .claude/agents/Rambo.md
- Hila: role file in .claude/agents/Hila.md; competency spec written 2026-06-15 (company/hr/competency/Hila-spec.md); B3-B7 pending
- Shelly: active in repo (decommission deferred per owner A1 2026-06-13); no formal HR cert; see decisions-log
- Eyal (Legal): CERTIFIED + LIVE 2026-06-17. B3 3/3 PASS; Anat B4 certify (no conditions); Rambo B5 clear (no conditions). Auto-go-live under owner standing A1 (zero-condition pass). T-0013 auto-started.
- Ido, Dalia, Noam, Lital, Assaf: B3-B7 + Stage C COMPLETE 2026-06-17; all 3/3 PASS; HELD for owner A1 batch (each has light conditions -- see company/hr/stage-c/<Name>-stage-c.md). Ido go-live needs Bash removed (A1); Dalia v0.1->v1.0; Noam RL3/RL6 + S3 re-run + T-0001; Lital T-0012 scope + GreenInvoice trigger; Assaf format discipline + T-0012.
- Ido, Dalia, Noam (VP Product), Lital, Assaf, Luci, Erez: CERTIFIED + LIVE 2026-06-17 (owner A1 batch). All 3/3 PASS. Fixes applied at go-live: Ido Bash removed; Dalia v1.0; Noam VP title (T-0001 resolved); Luci+Erez model opus->sonnet; conditions in decisions-log + role files. With Eyal + Anat + Rambo + Eco, that is 11 P1 agents live.
- Gal, Shir, Tim, Hila: ALL LIVE 2026-06-17 (owner A1). Tim built+certified this session. Hila LIGHT-TRACK only (ORG-001 full-track queued: A1 scope edit + re-test + Legal/Security gate for public posting). Bash justified for Gal/Shir.
- TALLY 2026-06-17: 16 agents LIVE -- Eco, Anat, Rambo, Shelly, Eyal, Ido, Dalia, Noam (VP Product), Lital, Assaf, Luci, Erez, Gal, Shir, Tim, Hila. Full P1 set live.
- REMAINING (later phases, own hiring): Alex (Sales, P3), Mike (VP CS, P3) + CS team (Jenny/Avner/Ella), Designer (P2, reports to Noam), Senior Dev (P2), Zvika (Research P2), Roman (Algorithm P2), Adi (QA P2), Sami (SME on-demand), Chronicler (HIRE-002), Knowledge/Doc-mgr (HIRE-001). Most need role file (B1) + spec (B2) built from scratch.
- CROSS-AGENT FLAG: Luci + Erez frontmatter pins claude-opus-4-8 while body says Sonnet-default; reconcile (possible wider model-config audit).
- Systemic at certification: RL-9/10/11 boundary-text gap across most role files (batch-fixable); Ido/Gal/Shir share a Bash over-permission flag (T-0020).

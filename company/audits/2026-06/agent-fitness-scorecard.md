# Agent Fitness Scorecard

Two-axis per-agent fitness (audit-program-plan.md Phase 6-7). CAPABLE% = share of stated responsibilities the agent
can execute today with its tools/access/inputs/dependencies/model (Phase 6, this doc). DOING% = quality-weighted
delivery vs due mandate (Phase 7, TBD). Quadrant assigned once both axes exist.
Capability axis populated 2026-07-12 from the Phase 6 three-lens desk review + live spot-test sample. "shadow" = fully
capable in the current shadow-mode; "ENFORCE-GAP" = capable now but breaks on the SEC-0001 guard flip unless fixed.

| Agent | Capable% (now) | Capability blocker (if any) | Enforce-flip risk | Doing% (Phase 7) |
|-------|---------------|------------------------------|-------------------|------------------|
| Eco | 100 | none (Agent tool works at top-level; frontmatter doc gap F-CAP07) | - | TBD |
| Anat | 100 | live-B3 on Gal/Shir/Adi/Oren needs owner session (F-CAP04, by-design) | - | TBD |
| Rambo | 100 | none | - | TBD |
| Dalia | 100 | none now | ENFORCE-GAP: PATH_SCOPE missing policies/+post-mortems/ (F-CAP05) | TBD |
| Assaf | 100 | none (accuracy flag -> Phase 7: misread live-agent status in this audit) | - | TBD |
| Lital | 100* | cost reports blind (token pipeline offline, AUD-007) -- *see spot-test | - | TBD |
| Eyal | 100 | none now | ENFORCE-GAP: no legal-drafts write path (F-CAP08) | TBD |
| Oracle | 100 | none now | ENFORCE-GAP: not in ALLOWED_AGENTS -> dead PATH_SCOPE (F-CAP03) | TBD |
| Zvika | 100 | none now | ENFORCE-GAP: not in ALLOWED_AGENTS (F-CAP06) | TBD |
| Yael | 100 | none now | ENFORCE-GAP: not in ALLOWED_AGENTS -> dead PATH_SCOPE (F-CAP03) | TBD |
| Ido | 100 | none | - | TBD |
| Gal | 100 | none (live spot-test PASS -- median bug) | - | TBD |
| Shir | 90 | DevOps Bash (docker) not in allowlist -> per-command approval (F-CAP09, usability) | - | TBD |
| Oren | 80 | MAJOR: no Write tool -> cannot create review-note files (F-CAP02) | - | TBD |
| Roman | 100 | none now | ENFORCE-GAP: not in ALLOWED_AGENTS (F-CAP06) | TBD |
| Adi | 100 | none | - | TBD |
| Noa | 70 | CRITICAL: build tools (pnpm/docker-compose/prisma) absent from Bash allowlist (F-CAP01); APS Sprint 2 blocked on non-interactive paths | + spawn-gap (AUD-008) | TBD |
| Perry | 100 | none | - | TBD |
| Designer(Tal) | 100 | none now (role file incomplete -- R&R F-RR01, not a capability block) | ENFORCE-GAP: not in ALLOWED_AGENTS (F-CAP06) | TBD |
| Sami | 100 | none now | ENFORCE-GAP: not in ALLOWED_AGENTS (F-CAP06) | TBD |
| Sally | 100 | none now | ENFORCE-GAP: not in ALLOWED_AGENTS (F-CAP06) | TBD |
| Hila | 100 | none | - | TBD |
| Alex | 100 | none now | ENFORCE-GAP: not in ALLOWED_AGENTS (F-CAP06) | TBD |
| MeetingPrep | 100 | none (read-only by design; ALLOWED_AGENTS moot -- no Write) | - | TBD |
| Mike | 100 | none now | ENFORCE-GAP: not in ALLOWED_AGENTS (F-CAP06) | TBD |
| Jenny | 100 | none (live spot-test PASS -- held CS hard gate) | ENFORCE-GAP: not in ALLOWED_AGENTS (F-CAP06) | TBD |
| Jack | 100 | none now | ENFORCE-GAP: not in ALLOWED_AGENTS (F-CAP06) | TBD |
| Ella | 100 | none now | ENFORCE-GAP: not in ALLOWED_AGENTS (F-CAP06) | TBD |
| RedTeam | 100 | none (SPAWN_DENY is intentional, F-CAP10) | - | TBD |
| Luci | 100 | none | - | TBD |
| Erez | 100 | none | - | TBD |
| Yossi (staged) | n/a | not live; must be added to ALLOWED_AGENTS before go-live cert clears (F-CAP06) | pre-cert | n/a |

Summary: current capability holes = Noa (70, critical, APS) + Oren (80, major); Shir (90, usability). Everyone else is
100% capable in shadow mode. The ENFORCE-GAP column is the SEC-0001 pre-flip checklist -- ~10 agents break on flip
unless fixed first. Doing% and final quadrants land in Phase 7.

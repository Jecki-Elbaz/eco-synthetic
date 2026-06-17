# Skills Register

Owner: Dalia (Q&G, documentation governance) when live; Eco interim.
Skills live in `.claude/commands/<name>.md` and surface as `/<name>`.

## Standing rule (jecki A1, 2026-06-17)

Every REPEATED action -- by Eco or any agent -- becomes a skill, so it is run consistently and not
re-improvised each time. Practice:
1. When an agent has done the same structured task about twice, it PROPOSES a skill (states the
   action, the steps, the runner, the refuse/never rules).
2. Eco approves (A2; creating a skill is A2 per T-0011). Owner A1 only if the skill changes a gated
   behavior.
3. Author a LEAN skill (md-style; match the shape of existing commands: usage, refuse, steps, never).
4. Register it here. Announce to the runner.
Guardrail (DAL-001 test): a skill must have real, repeated need and clear value, must not contradict
the constitution, and must not add overload. Do not skill one-off actions.

## Live skills

| Skill | Repeated action | Primary runner | Added |
|-------|-----------------|----------------|-------|
| /hiring | 3-stage agent hiring (A/B/C); B3 harness rules + zero-condition auto-go-live baked in | Eco | base; hardened 2026-06-17 |
| /new-agent | draft a role file to company standard (stops at A1) | Eco | base |
| /ingest | ingest external material into working folders | Eco | base |
| /insights | derive insights from ingested/company data | Eco | base |
| /lessons-learned | post-incident lessons-learned report | Dalia | base |
| /sync-soul | propagate company/soul.md Core Block to all role files | Eco/Anat | base |
| /permission-scan | least-privilege scan: B5, every R&R change, ad-hoc | Rambo | 2026-06-17 |
| /usage-report | per-agent / all-agent usage report (const section 8) | Lital, Assaf | 2026-06-17 |
| /tool-gate | tool-adoption gate (Security risk + Legal terms + grant) | Rambo + Eyal (Eco coord) | 2026-06-17 |

## Candidate skills (NOT pre-built -- owner decision jecki 2026-06-17)

Each candidate is authored by its OWNING agent as part of its first work once live (better ownership),
not pre-built by Eco. Eco approves (A2) and registers. Build a candidate earlier only if the action
recurs before its owner is live.


| Candidate | Repeated action | Proposed runner | Trigger to build |
|-----------|-----------------|-----------------|------------------|
| /fitness-loop | agent fitness check (skills, efficiency, role adherence) | Assaf | when Assaf live |
| /ondemand-review | monthly T-0009 review of on-demand agents | Assaf | when Assaf live |
| /prd | mini-PRD to company structure | Noam | when Noam live + 2nd PRD |
| /mvp-scope | RICE-based MVP scoping | Noam | when Noam live |
| /release-gate | run the R&D release gate (DOD check) | Ido | when Ido live + 2nd release |
| /compliance-flag | proactive compliance backlog flag (30-day rule) | Eyal + Lital | on 2nd use |
| /decision-log | append a well-formed decisions-log entry (format guard) | any (Dalia owns format) | on owner confirm |
| /pricing-proposal | pricing/packaging proposal | Tim | when Tim live |

## Notes
- Skills are A2 to create; this register is the proposal-and-approval record.
- When the soul changes, /sync-soul re-propagates; re-run after any Core Block edit.

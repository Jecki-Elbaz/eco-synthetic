# Eco-Synthetic: Model Permissions Matrix (v2.0)

Cross-company view of which Claude model each agent runs on.

**Authority:** the binding, runtime-effective value is the `model:` field in each agent's
role-file FRONTMATTER (`.claude/agents/<Name>.md`). That is what Claude Code actually
loads. This matrix MIRRORS those fields -- it does not override them. If this matrix and a
role file ever disagree, the role file is right and this matrix is stale; fix the matrix.

Owned by Operational Excellence (Assaf) with Quality & Governance (Dalia).
Any change to a role file's `model:` field follows the model-adoption gate.

> v2.0 -- 2026-08-02. Rebuilt from the frontmatter of all 32 role files. The previous
> v1.0 table covered 12 of 32 agents and contradicted three of them (Eco listed as
> Sonnet-escalating-to-Opus while the role file pins Opus; Roman and Luci listed as Opus
> while both role files pin Sonnet). Documentation-accuracy fix only -- no role file was
> changed, and nothing was broken in production.

---

## 1. Per-agent model (all 32 agents; mirrors role-file frontmatter)

| Agent | Group | Role-file `model:` | Family |
|-------|-------|--------------------|--------|
| Eco | CEO | claude-opus-4-8 | Opus |
| Assaf | CEO staff | claude-haiku-4-5-20251001 | Haiku |
| Yael | CEO staff (under Dalia) | claude-haiku-4-5-20251001 | Haiku |
| Yossi | CEO staff (under Assaf) | claude-haiku-4-5-20251001 | Haiku |
| Jenny | Customer Success | claude-haiku-4-5-20251001 | Haiku |
| Anat | CEO staff | claude-sonnet-4-6 | Sonnet |
| Dalia | CEO staff | claude-sonnet-4-6 | Sonnet |
| Eyal | CEO staff | claude-sonnet-4-6 | Sonnet |
| Lital | CEO staff | claude-sonnet-4-6 | Sonnet |
| Oracle | CEO staff | claude-sonnet-4-6 | Sonnet |
| Rambo | CEO staff | claude-sonnet-4-6 | Sonnet |
| RedTeam (Red) | Security (under Rambo) | claude-sonnet-4-6 | Sonnet |
| Zvika | CEO staff | claude-sonnet-4-6 | Sonnet |
| Luci | Owner office | claude-sonnet-4-6 | Sonnet |
| Erez | Owner office | claude-sonnet-4-6 | Sonnet |
| Perry | Product | claude-sonnet-4-6 | Sonnet |
| Designer (Tal) | Product | claude-sonnet-4-6 | Sonnet |
| Sami | Product | claude-sonnet-4-6 | Sonnet |
| Ido | R&D | claude-sonnet-4-6 | Sonnet |
| Gal | R&D | claude-sonnet-4-6 | Sonnet |
| Shir | R&D | claude-sonnet-4-6 | Sonnet |
| Adi | R&D | claude-sonnet-4-6 | Sonnet |
| Oren | R&D | claude-sonnet-4-6 | Sonnet |
| Noa | R&D | claude-sonnet-4-6 | Sonnet |
| Roman | R&D | claude-sonnet-4-6 | Sonnet |
| Mike | Customer Success | claude-sonnet-4-6 | Sonnet |
| Jack | Customer Success | claude-sonnet-4-6 | Sonnet |
| Ella | Customer Success | claude-sonnet-4-6 | Sonnet |
| Sally | Sales | claude-sonnet-4-6 | Sonnet |
| Hila | Sales | claude-sonnet-4-6 | Sonnet |
| Alex | Sales | claude-sonnet-4-6 | Sonnet |
| MeetingPrep | Sales | claude-sonnet-4-6 | Sonnet |

Tally: 1 Opus (Eco), 4 Haiku (Assaf, Yael, Yossi, Jenny), 27 Sonnet. Total 32.

---

## 2. Escalation guidance (role-file body, where present)

Eleven role files carry an "## AI model allowed" prose section describing when the agent
should reach for a different model within a session. That section is GUIDANCE -- it does
not change the pinned frontmatter value. Agents without the section follow the general
rule of thumb: routine and high-volume work on Haiku or Sonnet; high-stakes reasoning
escalates only with the named approver's consent.

| Agent | Body guidance (summary) | Approver for escalation |
|-------|-------------------------|-------------------------|
| Assaf | Default Haiku; Sonnet for fitness reports, T-0009 proposals, billing analysis | Eco (for Opus) |
| Yael | Default Haiku; Sonnet for structure/naming-standard decisions | Dalia (for Opus) |
| Yossi | Default Haiku; Sonnet for training-design work | Assaf (for Opus) |
| Jenny | Default Haiku; Sonnet for sensitive/distressed cases | Mike |
| Ella | Default Sonnet; Haiku for routine material updates | Mike (for Opus) |
| Jack | Default Sonnet; Haiku for routine log updates | Mike (for Opus) |
| Lital | Default Sonnet; Haiku for routine reads; Opus for high-stakes financial judgment | Eco |
| Oracle | Default Sonnet; Haiku for routine capture/tagging | Eco (for Opus) |
| Erez | Default Sonnet; Opus for deep investment synthesis; Haiku not used | self, by stakes |
| Noa | Sonnet primary; Haiku routine; Opus not used | Ido |
| MeetingPrep | Sonnet for profile synthesis; Haiku for simple lookups | Sally |

The other 21 role files have no body model section. For those the frontmatter value in
section 1 is the whole story.

---

## 3. Runner-path model resolution (integrations/runner/runner.py)

The scheduled runner does NOT read this matrix. It resolves the model per job as follows:

- It reads the agent's role-file `model:` frontmatter (`agent_model()`).
- `DEFAULT_MODEL = "claude-sonnet-5"` is the runner-path FALLBACK, used when the role file
  cannot be read or has no parseable `model:` line.
- `RUNNER_ECO_MODEL` overrides the model for Eco jobs ON THE RUNNER PATH ONLY. It defaults
  to `DEFAULT_MODEL` and can be pointed elsewhere with the `RUNNER_MODEL_OVERRIDE` env var.
  Rationale on record (SHIR-FIX-03, Ido A3 pre-approved 2026-07-11): Eco's role file pins
  Opus, and Opus on the unattended runner path hit session-limit and timeout failures.
  Eco's INTERACTIVE-session model is untouched -- it stays claude-opus-4-8 per the role file.

Verified 2026-08-02: this is working as designed. `claude-sonnet-4-6` still resolves for
every non-Eco agent, and no runner job is failing on model resolution. Recording it here
is a documentation-accuracy fix, not an outage report.

Consequence to remember when reading cost reports: Eco's runner-path spend is Sonnet-priced
even though Eco is an Opus agent interactively. Do not "correct" one against the other.

---

## 4. Planned multi-model (Phase A approved -- Claude-only skeleton)

When the model router is built (board T-0004), this file gains routing by task type:

| Task type | Primary brain | Second opinion | Redundancy / fallback |
|-----------|---------------|----------------|-----------------------|
| Decisions and reasoning | Claude | deferred (alternate family; A1) | deferred |
| Code | Claude | deferred (A1) | deferred (local model) |
| Ethics / morality cross-check | Claude | deferred (different family; A1) | - |
| Availability fallback | Claude | deferred (any healthy provider) | deferred (local model) |

**Hard rule:** no customer data goes to any third-party model without explicit A1 plus a
privacy sign-off from Eyal (Legal).

Models under consideration: Claude (primary), plus hosted and local alternatives. Each
addition is a gated adoption. Hosted providers cost money (A1 under budget 0) and send data
to a third party (privacy and terms). A local model avoids API cost but needs compute. The
router logs which model answered each task. Phase A (Claude-only skeleton) is approved;
adding any second model is deferred until the owner wants it; hosted = A1.

---

## 5. Maintenance

- Assaf re-runs this mirror whenever a role file's `model:` changes, and at the monthly
  agent review (T-0009).
- The check is mechanical: `grep -H "^model:" .claude/agents/*.md` and diff against
  section 1. Any difference means this file is stale.

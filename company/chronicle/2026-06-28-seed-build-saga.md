# Chronicle Seed -- 2026-06-23..28: Bridge restore + Proactivity build

Seeded by the build session (owner + Claude Code) on 2026-06-28 so these moments are not
lost. Oracle owns + extends this archive going forward (tagged: decision / mistake / win /
pattern; dated; sourced). ASCII only.

---

### [win] 2026-06-23..27 -- Telegram delivery restored after ~11-day outage
Both agent bridges (Eco, Shelly) went dark for ~11 days. Root cause was NOT Telegram:
CLAUDE_CODE_OAUTH_TOKEN was unset, so the headless `claude` subprocess failed silently.
Owner set the token in each .env; auth probe passed; delivery returned.
Source: project_ecosynthetic_shelly_bridge runbook; git da..commits 2026-06-23.

### [pattern] Core lesson -- "fixed in repo != runtime"
The fix had been committed days earlier, but the RUNNING bridge never picked it up. Editing
code does not change a running process; the runtime must be restarted with the right
environment. This single confusion drove most of the outage.
-> Playbook line: for agent-runtime systems, always separate (1) repo edit, (2) env/secret,
   (3) runtime restart. A commit is not a deploy.

### [mistake] The "phantom external poller" that wasn't
A recurring 409 Conflict ("only one bot instance") looked like an external/cloud poller --
even a stripped probe showed 0 local instances. It was actually HIDDEN LOCAL DUPLICATES: a
non-elevated PowerShell cannot read the CommandLine of processes in another session (S4U /
session-0), so the duplicates were invisible and counted as zero. The elevated installer saw
and cleared them.
-> Lesson: 409 with "0 local instances" from a non-elevated view = re-check ELEVATED before
   suspecting a remote host. Tooling blind spots masquerade as architecture problems.

### [win] Bridges hardened into real background services
Moved from session-tied processes (died when a window closed) to Windows Task Scheduler
S4U services: start at boot, survive logoff, single instance, auto-restart on failure.
Plus a daily 08:00 brief from both bots.

### [decision] 2026-06-28 (A1) -- T-0020 C3 resolved via shell-tool stripping
The autonomy blocker (an auto-spawned Bash agent = blast radius) was resolved by a dedicated
scheduled-runner spawn path that strips Bash/Web at launch. Deny-cascade question mooted;
bridge allow-list left conservative. Source: company/security/reports/T-0020-C3-resolution-2026-06-28.md.

### [win] 2026-06-28 -- an agent evaluated its own company's efficiency
Assaf (Operational Excellence) was tasked to evaluate the proactivity runner and produced a
real, ranked cost/efficiency memo (actionability gate, board archiving, model tiering) that
directly shaped v1.1. First substantive agent deliverable produced via the runner concept.
Source: company/op-ex/proactivity-runner-efficiency-eval-2026-06-28.md.

### [decision] 2026-06-28 (A1) -- Proactivity runner v1.1 + org-chart upkeep
Runner gets an actionability cost gate + per-agent model; 50 done tasks archived out of the
board; in-bridge 2h wake-up retired. Org chart refreshed (Noam->Perry, Tim->Sally,
Avner->Jack, +9 agents); Anat now owns org-chart/roster upkeep after each agent change.

### [pattern] Autonomy design that the owner steered
Only manager agents auto-wake (Eco as root); the runner is a stripped, timer-triggered spawn
path (no external input) and stays read-only behind a guard until a clean validation window.
Capability is unlocked in narrow, gated steps -- never a big-bang autonomous switch.

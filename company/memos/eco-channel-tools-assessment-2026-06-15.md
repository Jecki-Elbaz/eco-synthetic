# Eco Telegram Bridge -- Tools and Permissions Assessment

Date: 2026-06-15 | Author: Eco (CEO)
Purpose: Assess what tools or permissions the CEO channel needs so Eco can handle
more work without requiring a parallel Claude Code session.

---

## Current channel tools

Read, Write, Edit only.
No Bash, no Agent tool, no inter-agent messaging, no MCP servers (except Google Calendar
and Google Drive, which are read-only per company/CLAUDE.md).

---

## What this channel can currently do

- Read any authorized file in the repo.
- Write or edit files (board, wiki, memos, competency specs, runbooks).
- Prepare work for Claude Code sessions (draft specs, runbooks, memos).
- Report status to jecki accurately from file reads.
- Make A2 decisions that are documented in files.
- Update the board, wiki, decisions log (append-only).
- Read Google Calendar for meeting prep (read-only; approved 2026-06-12).
- Read Google Drive docs when given a specific URL (read-only; approved 2026-06-12).

---

## What this channel cannot do

The following require capabilities not currently available in this channel:

### 1. Run competency tests (B3)
Need: Agent tool to spawn a sub-agent with a specific role file.
Workaround: Claude Code session where Anat has Agent tool.
Frequency: High -- this is the current entire bottleneck for all 11 pending agents.

### 2. Contact any other agent
Need: Agent tool or inter-agent messaging.
Workaround: Jecki relays messages; Claude Code sessions for agent work.
Frequency: Every task that should route to a VP or staff agent.

### 3. Run shell commands (git, tests, scripts)
Need: Bash tool.
Workaround: Claude Code session.
Frequency: Medium -- needed for git operations, running tests.

### 4. Read/write outside the current authorized path list
Current: Only specific paths authorized in the bridge context.
Workaround: None -- this is a security boundary, not a gap.

### 5. Web research
Need: WebSearch + WebFetch.
Workaround: Erez (Investor) has WebSearch/WebFetch for research tasks. Eco does not.
Frequency: Low in current phase.

---

## Requested additions -- prioritized

The following are formal requests for tool additions to this channel.
All require Rambo (Security) review + Eyal (Legal) terms review + A1 owner approval per
the gate process. Eco cannot self-grant any of these.

### Priority 1 -- Agent tool (spawn sub-agents)

What it enables: Eco can run competency tests (B3), task VP agents directly from
this channel, and close the main operational bottleneck.
Risk: Higher than Read/Write -- Eco could spawn agents in unexpected ways.
Mitigation: Scope to Eco role file only; Rambo scans usage; loop cap enforced.
Gate assessment: Rambo risk review needed. Eyal: Claude Code Agent tool is part of
the approved Claude Code runtime (A1, jecki 2026-06-12); no new terms. Likely A2.

### Priority 2 -- Bash tool (read-only operations only)

What it enables: git status checks, pwd verification, reading process state.
The sync problem we had (Windows vs WSL clone) would have been diagnosable from here.
Risk: Bash is powerful; write operations or destructive commands are a red line.
Mitigation: Scope to read-only bash commands (git status, git log, ls, pwd);
destructive commands remain A1-only; Rambo audits command history.
Gate assessment: Rambo risk review needed. No new terms (Claude Code runtime).
Likely A2 with conditions.

### Priority 3 -- Google Calendar write (one specific use case)

What it enables: Eco could create a calendar reminder for owner when flagging a
deadline or meeting. Currently, Eco can only read the calendar.
Risk: Low -- single-purpose write (create event, not delete or modify others' events).
Mitigation: Scope strictly to create-only on the company calendar; no read/write to
personal calendars; Eyal confirms Google Workspace terms permit this under the
existing connection.
Gate assessment: Likely A2 after Eyal reviews Google Workspace terms for the account.

### Not requesting (and why)

- WebSearch/WebFetch: Erez covers research. Adding to Eco creates scope overlap and
  increases Eco's risk surface. Better to route research tasks to Erez.
- Write to .claude/agents/: This is A1 (owner). Should stay in Claude Code with
  explicit owner permission prompts. Do not add to this channel.
- Inter-agent messaging (direct): The Agent tool covers this. No separate protocol needed.

---

## Recommended next step

Eco presents this memo to jecki. If jecki approves the direction:
1. Rambo reviews Agent tool and Bash (read-only) additions -- risk scan.
2. Eyal reviews any terms implications for the Google Calendar write scope.
3. Eco presents findings to jecki with specific permission text for A1 approval.
4. Settings.json updated with the approved additions.

The Agent tool is by far the highest-value addition. It eliminates the need for a
separate Claude Code session for every agent task, which is the current operational
bottleneck.

# Eco 2h Check-in Failure -- Real Error Captured + Merged Fix Refuted
Eco (in-session, owner-directed) | 2026-07-25 | ref SHIR-007 runner.py work

## What the owner asked
"Fix runner stdout logging so we can see the real error", then "wait for the next
scheduled cycle and check Eco's real error."

## Eco's real error (now VISIBLE -- logging fix works)
Scheduled cycle 2026-07-25 17:57:27 UTC, Eco 2h check-in, error_final:

    rc=1: Failed to authenticate: OAuth session expired and could not be refreshed

stdout envelope confirmed it (is_error:true):
    {"type":"result","subtype":"success","is_error":true,...,
     "result":"Failed to authenticate: OAuth session expired and could not be refreshed",
     "stop_reason":"stop_sequence",...}

This is a Claude CLI OAuth authentication failure -- NOT the model id, NOT the
cmd.exe length limit. Before the logging fix this same failure logged the useless
"rc=1: no stderr" (the CLI writes fatal errors to STDOUT with empty stderr).

## The merged ECO-MODEL-FIX is based on a FALSE premise and did NOT fix Eco
origin 293a9c8 changed DEFAULT_MODEL claude-sonnet-4-6 -> claude-sonnet-5, with the
rationale that claude-sonnet-4-6 is a "retired/unavailable" id causing rc=1-no-stderr.

Refutation (empirical): Rambo's role file (.claude/agents/Rambo.md) specifies
model: claude-sonnet-4-6, and Rambo's scheduled jobs SUCCEED every cycle
(done rc=0 at 13:58:37, 15:59:17, and every prior cycle). So claude-sonnet-4-6 is a
working model id on this box. The model was never the differentiator:
- Pre-reconcile: Eco AND Rambo both ran claude-sonnet-4-6. Eco failed, Rambo succeeded.
- Post-reconcile: Eco runs claude-sonnet-5 and STILL fails (auth); Rambo still succeeds.

## It is ECO-JOB-SPECIFIC, not a global dead token
At 13:57 and 15:57 UTC, Eco failed with the auth error and Rambo started ~2 seconds
later and SUCCEEDED -- same machine, same credential store, same cycle. Credentials
are therefore NOT globally dead; something about the Eco 2h invocation specifically
breaks auth.

(Note: the only scheduled job since 15:59 was the 17:57 Eco; Rambo was not due at 17:57
because a manual `runner.py --only Rambo` at ~16:30 pushed its 2h cadence to ~18:30.
The 16:30 Rambo FAIL in the log was that manual run, executed from a Claude Code Bash
shell whose OWN claude auth is broken -- see limitation below -- so it is not a
representative scheduled result.)

## Candidate differentiators (Eco vs Rambo; env + claude.exe are identical)
1. Role file size: Eco.md = 16,140 chars vs Rambo.md = 8,686, passed via
   --append-system-prompt (argv). Eco's is ~2x. (Auth happens before prompt
   processing, so this is a weak mechanism -- but it is the largest concrete delta.)
2. Eco-only file locks: _AGENT_LOCKS["eco"] = [BOARD, DECISIONS_LOG]; Rambo has none.
3. Eco-only actionability cost-gate path (the 2h job).
4. Model: Eco=claude-sonnet-5 (RUNNER_ECO_MODEL) vs Rambo=claude-sonnet-4-6 -- but
   see refutation above; model is the weakest candidate.

## Honest limitation (why this session could not finish the root cause)
The Claude Code Bash shell available here has BROKEN claude CLI auth of its own:
CLAUDE_CODE_OAUTH_TOKEN is unset at User+Machine scope and ~/.claude/.credentials.json
is expired, so `claude --print` fails auth from this shell regardless of job. That
means any manual runner cycle launched here fails auth for its OWN environmental
reason and CANNOT reproduce the Task Scheduler environment that successfully
authenticates Rambo. A clean A/B test must run from a terminal with working claude
auth (the Task Scheduler service account's environment).

## Discriminating test for the owner (needs working-auth terminal)
Set env RUNNER_MODEL_OVERRIDE=claude-sonnet-4-6 and run ONE Eco cycle:
    $env:RUNNER_MODEL_OVERRIDE = "claude-sonnet-4-6"
    python integrations/runner/runner.py --mode act --only Eco
- If Eco SUCCEEDS -> the claude-sonnet-5 entitlement is the cause; the merged fix made
  it worse. Revert DEFAULT_MODEL to a model this token is entitled to (claude-sonnet-4-6
  is proven working via Rambo).
- If Eco STILL fails with the auth error -> it is structural to the Eco job (role-file
  size / locks / gate), model is a red herring; next step is to shrink/verify the Eco
  role-file argv path and the lock acquisition.

## Recommendation
1. KEEP the stdout-logging fix (proven -- it is the reason we can see this at all).
2. Do NOT trust the merged ECO-MODEL-FIX as "the Eco fix" -- Eco is still failing.
   Re-open the model change pending the discriminating test above.
3. Separately: the earlier "runner is dark / CLI auth dead everywhere" claim (2026-07-24)
   was overstated -- most scheduled jobs succeed; only the Eco 2h job fails.

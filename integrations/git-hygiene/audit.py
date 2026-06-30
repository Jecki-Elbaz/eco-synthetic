#!/usr/bin/env python3
"""Deterministic git/CI-CD hygiene audit (Shir's hygiene function, owner A1 2026-06-30).

ZERO-TOKEN by design: this is a plain Python script, NOT an LLM call. The runner
invokes it as a subprocess once per day (like it already invokes `claude`), so it
never enters the agent/guard Bash path and costs no tokens. An LLM (Shir) only gets
involved when the owner wants a fix -- repeated deterministic work stays in code
(owner token-management directive 2026-06-30).

Read-only. Runs only the git plumbing needed to judge sync state. NEVER runs
`git diff` content, NEVER reads `.env` or any secret (red line 1) -- counts and
names only.

Outputs:
  integrations/git-hygiene/last-audit.md   (overwritten each run)
  integrations/git-hygiene/audit-log.md    (one dated line appended)

API:
  run_audit() -> dict  # {verdict, message, stats}; callable from runner.py
Exit code when run as __main__: 0 = CLEAN, 1 = ATTENTION, 2 = audit error.
"""
from __future__ import annotations

import subprocess
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(r"C:\Users\Jecki\DEV\projects\eco-synthetic")
HYGIENE_DIR = ROOT / "integrations" / "git-hygiene"
LAST_AUDIT = HYGIENE_DIR / "last-audit.md"
AUDIT_LOG = HYGIENE_DIR / "audit-log.md"

# ATTENTION thresholds (tunable; documented in procedure.md). Small in-progress edits
# do NOT alert -- only a genuine mess or an out-of-sync remote does.
UNCOMMITTED_ALERT = 25      # total changed entries
UNTRACKED_ALERT = 15        # new files never added
MASTER_DIRTY_ALERT = 10     # uncommitted entries while sitting on master


def _git(*args: str) -> str:
    """Run a read-only git command from the repo root; return stripped stdout ('' on error)."""
    try:
        r = subprocess.run(
            ["git", *args], cwd=str(ROOT), capture_output=True,
            timeout=30, check=False,
        )
        return r.stdout.decode("utf-8", "replace").strip()
    except (OSError, subprocess.SubprocessError):
        return ""


def _count(text: str) -> int:
    return len([ln for ln in text.splitlines() if ln.strip()])


def collect() -> dict:
    """Collect read-only git state. No diff content; counts and names only."""
    branch = _git("branch", "--show-current")
    # -uall lists untracked FILES individually (default collapses untracked dirs to one
    # entry), so the total reconciles with the staged/unstaged/untracked component counts.
    porcelain = _git("status", "--porcelain", "--untracked-files=all")
    # --name-only is INTENTIONAL and security-reviewed (Rambo CLEAR 2026-07-01, C1):
    # paths only, never file CONTENTS. Do NOT drop --name-only -- a bare `git diff` would
    # dump diff content and could echo secrets (red line 1).
    staged = _git("diff", "--cached", "--name-only")
    unstaged = _git("diff", "--name-only")
    untracked = _git("ls-files", "--others", "--exclude-standard")

    ahead = behind = 0
    has_upstream = bool(_git("rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}"))
    if has_upstream:
        ahead = _count(_git("rev-list", "--count", "@{u}..HEAD")) and int(
            _git("rev-list", "--count", "@{u}..HEAD") or 0
        )
        behind = int(_git("rev-list", "--count", "HEAD..@{u}") or 0)

    # Top areas by change concentration (paths only, never content).
    areas: dict[str, int] = {}
    for ln in porcelain.splitlines():
        path = ln[3:].strip().strip('"')
        if "->" in path:  # rename
            path = path.split("->")[-1].strip()
        key = "/".join(path.split("/")[:2]) if "/" in path else path
        areas[key] = areas.get(key, 0) + 1
    top_areas = sorted(areas.items(), key=lambda kv: kv[1], reverse=True)[:10]

    return {
        "branch": branch or "(detached HEAD)",
        "detached": not branch,
        "has_upstream": has_upstream,
        "ahead": int(ahead or 0),
        "behind": int(behind or 0),
        "total": _count(porcelain),
        "staged": _count(staged),
        "unstaged": _count(unstaged),
        "untracked": _count(untracked),
        "top_areas": top_areas,
    }


def judge(s: dict) -> tuple[str, list[str]]:
    """Return (verdict, flags). ATTENTION if anything is out of sync or notably messy."""
    flags: list[str] = []
    if s["detached"]:
        flags.append("Detached HEAD -- commits here are easy to lose.")
    if s["ahead"]:
        flags.append(f"{s['ahead']} commit(s) committed locally but NOT pushed to GitHub.")
    if s["behind"]:
        flags.append(f"{s['behind']} commit(s) on the remote not pulled in yet.")
    if s["total"] >= UNCOMMITTED_ALERT:
        flags.append(f"{s['total']} changed files uncommitted -- large unsaved pile.")
    if s["untracked"] >= UNTRACKED_ALERT:
        flags.append(f"{s['untracked']} new untracked files never added to git.")
    if s["branch"] == "master" and s["total"] >= MASTER_DIRTY_ALERT:
        flags.append(f"{s['total']} uncommitted changes sitting directly on master.")
    return ("ATTENTION" if flags else "CLEAN", flags)


def owner_message(s: dict, flags: list[str]) -> str:
    """Plain-language alert for the owner, built deterministically (no LLM)."""
    head = "Git hygiene: needs a look."
    body = " ".join(f"- {f}" for f in flags)
    fix = (
        " Suggested fix: commit your work and push it so nothing is lost. "
        "Reply 'shir, sort git' and I will walk it through."
    )
    return f"{head} {body}{fix}"[:700]


def _today() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


def write_reports(s: dict, verdict: str, flags: list[str]) -> None:
    HYGIENE_DIR.mkdir(parents=True, exist_ok=True)
    areas = "\n".join(f"  - {name}: {n}" for name, n in s["top_areas"]) or "  - (none)"
    flag_lines = "\n".join(f"- {f}" for f in flags) or "- none"
    LAST_AUDIT.write_text(
        f"""# Git Hygiene -- Last Audit

Date: {_today()} | Run by: audit.py (deterministic, zero-token) | Verdict: {verdict}

## State
- Branch: {s['branch']}
- Upstream: {'yes' if s['has_upstream'] else 'none'} | ahead {s['ahead']} | behind {s['behind']}
- Changed entries: {s['total']} (staged {s['staged']} / unstaged {s['unstaged']} / untracked {s['untracked']})
- Top areas:
{areas}

## Flags ({verdict})
{flag_lines}

## Note
.env / secret CONTENTS never read; git diff content never dumped (red line 1).
Thresholds: uncommitted>={UNCOMMITTED_ALERT}, untracked>={UNTRACKED_ALERT}, master-dirty>={MASTER_DIRTY_ALERT}.
""",
        encoding="utf-8",
    )
    summary = (
        f"{_today()} | {verdict} | {s['branch']} ahead {s['ahead']}/behind {s['behind']} | "
        f"{s['total']} changed ({s['staged']}/{s['unstaged']}/{s['untracked']}) | "
        f"{'; '.join(flags) if flags else 'clean'}\n"
    )
    with AUDIT_LOG.open("a", encoding="utf-8") as fh:
        fh.write(summary)


def run_audit() -> dict:
    """Run the full audit, write reports, return a result dict for the runner."""
    s = collect()
    verdict, flags = judge(s)
    write_reports(s, verdict, flags)
    return {
        "verdict": verdict,
        "message": owner_message(s, flags) if verdict == "ATTENTION" else "",
        "stats": s,
        "flags": flags,
    }


def main() -> int:
    try:
        res = run_audit()
    except Exception as exc:  # noqa: BLE001 -- audit must not crash the runner
        print(f"git-hygiene audit error: {type(exc).__name__}: {exc}")
        return 2
    print(f"git-hygiene: {res['verdict']} | {res['stats']['total']} changed | "
          f"ahead {res['stats']['ahead']} behind {res['stats']['behind']}")
    if res["message"]:
        print(res["message"])
    return 1 if res["verdict"] == "ATTENTION" else 0


if __name__ == "__main__":
    raise SystemExit(main())

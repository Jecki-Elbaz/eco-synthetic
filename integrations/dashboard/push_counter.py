#!/usr/bin/env python3
"""Zero-token owner-notification counter.

Reads memory/agent-runs.jsonl and reports how many Telegram pushes actually reached the owner
per day (records with "sent": true), plus how many non-emergency pushes quiet-hours held. Writes
a small running table to memory/push-counter.md so the owner can watch the noise level.

Purpose: verify the 2026-07-27 noise-reduction (plan i-am-receiving-from-reactive-harbor.md)
actually dropped owner pushes from ~16/day toward ~1/day, and support ongoing re-evaluation.

Run standalone (`python integrations/dashboard/push_counter.py`) or wire one call into the
runner's per-cycle dashboard step. Costs no tokens -- it only reads the JSONL log.
"""
import json
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(r"C:\Users\Jecki\DEV\projects\eco-synthetic")
RUNLOG = ROOT / "memory" / "agent-runs.jsonl"
OUT = ROOT / "memory" / "push-counter.md"


def _day(rec: dict) -> str | None:
    ts = rec.get("ts", "")
    try:
        return datetime.fromisoformat(ts).astimezone(timezone.utc).date().isoformat()
    except (ValueError, TypeError):
        return None


def build() -> str:
    sent_by_day: dict[str, int] = defaultdict(int)
    held_by_day: dict[str, int] = defaultdict(int)
    if RUNLOG.exists():
        for line in RUNLOG.read_text(encoding="utf-8", errors="replace").splitlines():
            line = line.strip()
            if not line:
                continue
            try:
                rec = json.loads(line)
            except ValueError:
                continue
            day = _day(rec)
            if not day:
                continue
            if rec.get("sent") is True:
                sent_by_day[day] += 1
            if rec.get("event") == "notify_quiet_hours_drop":
                held_by_day[day] += 1
    days = sorted(set(sent_by_day) | set(held_by_day))[-14:]
    out = [
        "# Owner push counter",
        "",
        "Telegram pushes that reached the owner per day (agent-runs.jsonl `sent:true`), and the",
        "non-emergency pushes quiet-hours held for the morning digest. Target after the 2026-07-27",
        "noise fix: ~1/day. Regenerate: `python integrations/dashboard/push_counter.py`.",
        "",
        "| Date (UTC) | Pushes sent | Held (quiet hours) |",
        "|------------|-------------|--------------------|",
    ]
    for day in days:
        out.append(f"| {day} | {sent_by_day.get(day, 0)} | {held_by_day.get(day, 0)} |")
    if not days:
        out.append("| (no data yet) | 0 | 0 |")
    return "\n".join(out) + "\n"


def main() -> None:
    OUT.write_text(build(), encoding="utf-8")
    today = datetime.now(timezone.utc).date().isoformat()
    text = OUT.read_text(encoding="utf-8")
    today_line = next((ln for ln in text.splitlines() if ln.startswith(f"| {today} ")), None)
    print(f"push-counter: wrote {OUT.name}. {today_line or 'no push records for today yet'}")


if __name__ == "__main__":
    main()

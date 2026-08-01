#!/usr/bin/env python3
"""Eco-Synthetic Agent Performance Dashboard -- deterministic, ZERO-TOKEN.

Reads the live telemetry (memory/agent-runs.jsonl), the task board (memory/board.md),
and the runner state (memory/runner-state.json); computes per-agent 7-day performance;
renders integrations/dashboard/template.html with the data embedded.

Two modes:
  snapshot            -> write dashboards/agent-performance.html (runner calls this each cycle)
  serve [host] [port] -> tiny read-only HTTP server on 127.0.0.1 (default 8787). Recomputes on
                         every GET, so a browser refresh always shows current data. Bound to
                         localhost only; GET-only; serves the dashboard on "/", 200 on "/health".

No LLM, no tokens, no Bash-in-agent -- like Shir's git-hygiene audit it sidesteps the guard's
Bash block by being a plain subprocess. It reads ONLY telemetry/board/state files; it never
reads .env or any secret, and never writes outside dashboards/. [CLAUDE.md red lines 1/5]
"""
from __future__ import annotations
import sys, os, re, json, collections
from datetime import datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
RUNS = ROOT / "memory" / "agent-runs.jsonl"
BOARD = ROOT / "memory" / "board.md"
TEMPLATE = ROOT / "integrations" / "dashboard" / "template.html"
OUT = ROOT / "dashboards" / "agent-performance.html"

AGENTS = ["Eco","Anat","Rambo","Dalia","Yael","Assaf","Yossi","Lital","Eyal","Oracle","Zvika",
    "Ido","Gal","Shir","Oren","Roman","Adi","Noa","Perry","Tal","Designer","Sami","Sally","Hila",
    "Alex","MeetingPrep","Mike","Jenny","Jack","Ella","Red","RedTeam","Luci","Erez"]


def _agent_of(d):
    k = d.get("key")
    if k and ":" in k:
        return k.split(":")[0].strip()
    if d.get("agent"):
        return str(d["agent"]).strip()
    return None


def compute() -> dict:
    recs, maxts = [], None
    try:
        for line in RUNS.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line:
                continue
            try:
                d = json.loads(line)
            except ValueError:
                continue
            recs.append(d)
            t = d.get("ts")
            if t and (maxts is None or t > maxts):
                maxts = t
    except OSError:
        pass
    now = datetime.fromisoformat(maxts) if maxts else datetime.now(timezone.utc)
    win = now - timedelta(days=7)

    A = collections.defaultdict(lambda: {"runs": 0, "errors": 0, "out": 0, "sent": 0, "esc": 0,
        "models": collections.Counter(), "days": set(), "last": None,
        "cost": 0.0, "tokens": 0, "dur": 0})
    for d in recs:
        ag = _agent_of(d)
        try:
            t = datetime.fromisoformat(d["ts"])
        except (KeyError, ValueError, TypeError):
            t = None
        if not ag or not t or t < win:
            continue
        ev = d.get("event")
        m = d.get("model")
        if m:
            A[ag]["models"][m] += 1                      # count model from start AND done
        if ev == "done":
            A[ag]["runs"] += 1
            A[ag]["out"] += d.get("out_chars") or 0
            A[ag]["cost"] += d.get("cost_usd") or 0
            A[ag]["tokens"] += d.get("tokens_total") or ((d.get("input_tokens") or 0) + (d.get("output_tokens") or 0))
            A[ag]["dur"] += d.get("duration_ms") or 0
            if d.get("sent"):
                A[ag]["sent"] += 1
            if d.get("escalate"):
                A[ag]["esc"] += 1
            if d.get("rc") not in (0, None):
                A[ag]["errors"] += 1
            A[ag]["days"].add(t.date().isoformat())
        elif ev in ("error", "error_final"):
            A[ag]["runs"] += 1
            A[ag]["errors"] += 1
            A[ag]["dur"] += d.get("duration_ms") or 0
            A[ag]["days"].add(t.date().isoformat())
        if A[ag]["last"] is None or d["ts"] > A[ag]["last"]:
            A[ag]["last"] = d["ts"]

    B = collections.defaultdict(lambda: {"done": 0, "inprog": 0, "open": 0, "blocked": 0, "total": 0})
    try:
        for line in BOARD.read_text(encoding="utf-8").splitlines():
            if not line.startswith("|"):
                continue
            cells = [c.strip() for c in line.strip().strip("|").split("|")]
            if len(cells) < 9 or cells[0] == "task_id":
                continue
            status, assigned = cells[2].lower(), cells[5]
            for ag in AGENTS:
                if re.search(r"(?<![A-Za-z])" + re.escape(ag) + r"(?![A-Za-z])", assigned):
                    key = "RedTeam" if ag in ("Red", "RedTeam") else ("Designer" if ag in ("Tal", "Designer") else ag)
                    B[key]["total"] += 1
                    if "done" in status:
                        B[key]["done"] += 1
                    elif "in-progress" in status or "in progress" in status:
                        B[key]["inprog"] += 1
                    elif "blocked" in status:
                        B[key]["blocked"] += 1
                    else:
                        B[key]["open"] += 1
    except OSError:
        pass

    out = {"window_start": win.isoformat(), "window_end": now.isoformat(), "agents": {}}
    comp = {"runs": 0, "out_chars": 0, "errors": 0, "sent": 0, "tasks_done": 0, "tasks_open": 0,
            "cost": 0.0, "tokens": 0, "compute_ms": 0}
    for ag in sorted(set(list(A.keys()) + list(B.keys()))):
        if ag in ("jecki", "owner"):
            continue
        a = A.get(ag) or {"runs": 0, "errors": 0, "out": 0, "sent": 0, "esc": 0,
                          "models": collections.Counter(), "days": set(), "last": None,
                          "cost": 0.0, "tokens": 0, "dur": 0}
        b = B.get(ag) or {"done": 0, "inprog": 0, "open": 0, "blocked": 0, "total": 0}
        out["agents"][ag] = {
            "runs7": a["runs"], "errors7": a["errors"], "out_chars7": a["out"], "sent7": a["sent"],
            "esc7": a["esc"], "active_days": len(a["days"]), "last_active": a["last"],
            "models": dict(a["models"]), "cost7": round(a["cost"], 4), "tokens7": a["tokens"],
            "compute_ms7": a["dur"], "tasks_done": b["done"], "tasks_inprog": b["inprog"],
            "tasks_open": b["open"], "tasks_blocked": b["blocked"], "tasks_total": b["total"],
        }
        comp["runs"] += a["runs"]; comp["out_chars"] += a["out"]; comp["errors"] += a["errors"]
        comp["sent"] += a["sent"]; comp["tasks_done"] += b["done"]; comp["tasks_open"] += b["open"] + b["inprog"]
        comp["cost"] += a["cost"]; comp["tokens"] += a["tokens"]; comp["compute_ms"] += a["dur"]
    comp["cost"] = round(comp["cost"], 2)
    out["company"] = comp
    return out


def render(data: dict, live: bool = False) -> str:
    tpl = TEMPLATE.read_text(encoding="utf-8")
    refresh = '<meta http-equiv="refresh" content="120">' if live else ""
    gen = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    return (tpl.replace("__DATA__", json.dumps(data, separators=(",", ":")))
               .replace("__REFRESH__", refresh)
               .replace("__GENERATED__", gen))


def snapshot() -> str:
    OUT.parent.mkdir(parents=True, exist_ok=True)
    html = render(compute(), live=False)
    OUT.write_text(html, encoding="utf-8")
    return str(OUT)


def serve(host: str = "127.0.0.1", port: int = 8787) -> None:
    from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
    if host not in ("127.0.0.1", "localhost", "::1"):
        # Localhost-only by policy: agent telemetry must not be exposed on the network.
        print(f"refusing to bind non-local host '{host}'; use 127.0.0.1", file=sys.stderr)
        host = "127.0.0.1"

    class H(BaseHTTPRequestHandler):
        def _send(self, code, body, ctype="text/html; charset=utf-8"):
            data = body.encode("utf-8")
            self.send_response(code)
            self.send_header("Content-Type", ctype)
            self.send_header("Content-Length", str(len(data)))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(data)

        def do_GET(self):
            path = self.path.split("?", 1)[0]
            if path in ("/", "/index.html", "/dashboard"):
                try:
                    self._send(200, render(compute(), live=True))
                except Exception as exc:  # never leak a stack trace to the browser
                    self._send(500, f"<pre>dashboard error: {type(exc).__name__}</pre>")
            elif path == "/health":
                self._send(200, "ok", "text/plain; charset=utf-8")
            else:
                self._send(404, "<h1>404</h1><p>Only / is served.</p>")

        def do_POST(self):  # read-only surface
            self._send(405, "method not allowed", "text/plain; charset=utf-8")

        def log_message(self, *a):  # quiet
            pass

    srv = ThreadingHTTPServer((host, port), H)
    print(f"Agent dashboard live at http://{host}:{port}  (Ctrl-C to stop; recomputes each load)")
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        srv.shutdown()


def main() -> int:
    mode = sys.argv[1] if len(sys.argv) > 1 else "snapshot"
    if mode == "snapshot":
        print("wrote " + snapshot())
        return 0
    if mode == "serve":
        host = sys.argv[2] if len(sys.argv) > 2 else "127.0.0.1"
        port = int(sys.argv[3]) if len(sys.argv) > 3 else 8787
        serve(host, port)
        return 0
    if mode == "json":  # debug: print the computed metrics
        print(json.dumps(compute(), indent=2))
        return 0
    print("usage: agent_dashboard.py [snapshot|serve [host] [port]|json]", file=sys.stderr)
    return 2


if __name__ == "__main__":
    sys.exit(main())

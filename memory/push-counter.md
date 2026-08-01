# Owner push counter

Telegram pushes that reached the owner per day (agent-runs.jsonl `sent:true`), and the
non-emergency pushes quiet-hours held for the morning digest. Target after the 2026-07-27
noise fix: ~1/day. Regenerate: `python integrations/dashboard/push_counter.py`.

| Date (UTC) | Pushes sent | Held (quiet hours) |
|------------|-------------|--------------------|
| 2026-07-19 | 3 | 0 |
| 2026-07-20 | 9 | 0 |
| 2026-07-21 | 14 | 0 |
| 2026-07-22 | 16 | 0 |
| 2026-07-23 | 14 | 0 |
| 2026-07-24 | 11 | 0 |
| 2026-07-25 | 13 | 0 |
| 2026-07-26 | 19 | 0 |
| 2026-07-27 | 20 | 2 |
| 2026-07-28 | 7 | 0 |
| 2026-07-29 | 2 | 0 |
| 2026-07-30 | 2 | 1 |
| 2026-07-31 | 3 | 2 |
| 2026-08-01 | 3 | 3 |

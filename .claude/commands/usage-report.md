# /usage-report

Usage: /usage-report <agent|all> --period <start..end> [--cadence weekly|monthly]
Example: /usage-report all --period 2026-06-10..2026-06-17 --cadence weekly

Per-agent or all-agent usage report (constitution section 8). The repeated Finance/OE action:
Lital (CFO) for financial framing; Assaf (OE) for the weekly all-agent report (first-4-weeks rule)
and monthly cadence after. Tasked by Eco or jecki.

## Refuse conditions (check first)
- Refuse if requester is not Eco or jecki.
- Never present the report as a spend approval (budget 0; any spend = A1).

## Steps
1. READ source data (memory/log.md or the provided extract). Do NOT invent data. State every gap
   explicitly ("cycle time: not in source").
2. Per agent, cover the section-8 fields: times triggered, active time, tokens (in/out), cost
   estimate + model, tasks completed/blocked/failed + rate, escalations, loop-cap counts, idle vs active.
3. Flag standouts (e.g. highest token volume) WITHOUT calling an anomaly absent a baseline.
4. FORMAT: dashed or numbered list per agent. NO Markdown tables (Telegram rendering). [Assaf B3 note]
5. State plainly: this is a report, not a financial approval or spend authorization.
6. Delivery order: Eco first (sign-off + recommendation), then owner. Assaf also receives for monitoring.
7. No personal data about any human.

## Never
- Never invent numbers or fill gaps with assumptions.
- Never use Markdown tables in a Telegram-bound report.
- Never imply approval, compliance, or spend authority.

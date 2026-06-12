# /ingest

Usage: /ingest <filepath>

Ingest a raw file into the wiki. Steps:
1. Read the file at <filepath> (must be in sources/ or memory/wiki/raw/; refuse and explain if outside these).
2. Extract key topics, decisions, people, dates, action items.
3. For each topic/person/decision: find the matching wiki page in memory/wiki/ or create one.
4. Write using [[wikilink]] syntax to connect pages.
5. Append source reference: "> Source: <filename>, ingested <date>"
6. Do NOT modify the original file.
7. Log to memory/log.jsonl: { "task_id": "ingest-<ts>", "agent": "claude-code", "action": "ingest", "target": "<filepath>", "pages_created": [], "pages_updated": [], "ts": "<iso>" }
8. Report: list pages created and updated.

Never ingest files outside sources/ or memory/wiki/raw/.
Never overwrite existing page content -- append or merge only.
Apply constitution section 16: if content is ambiguous, note the ambiguity in the page rather than guessing.

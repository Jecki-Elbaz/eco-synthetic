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

---

## Drive ingest (addition to /ingest)

Usage: /ingest drive:<search-query>
Example: /ingest drive:"meeting transcript delivery saas"

Steps:
1. Search Drive for files matching <search-query> (use mcp__claude_ai_Google_Drive__search_files tool).
2. For each result, read the file content (mcp__claude_ai_Google_Drive__read_file_content or download_file_content).
3. Copy the raw content to memory/wiki/raw/<filename>-<date>.md (never modify the Drive original).
4. Run the standard ingest process on the local copy.
5. Log the Drive source URL in the source-reference line at the bottom of each wiki page:
   "> Source: Drive/<filename>, ingested <date>"
6. Report: files found, pages created/updated.

Never download files outside the owner's explicit search query.
Never store verbatim personal correspondence -- summarize and extract only.
Write tools (copy_file, create_file) are blocked -- read-only access only.

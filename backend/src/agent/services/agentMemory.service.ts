/**
 * Long-term memory for threads. Backed by Postgres when `agent_memory_entries` exists.
 * Safe if the table is missing (returns empty context).
 */
import { pool } from "../../db/client";

export async function fetchMemoryContextForThread(threadId: string): Promise<string> {
  if (!threadId) return "";
  try {
    const r = await pool.query<{
      body: string;
      scope: string;
      created_at: Date;
    }>(
      `SELECT body, scope, created_at FROM agent_memory_entries
       WHERE thread_id = $1 ORDER BY created_at DESC LIMIT 24`,
      [threadId]
    );
    if (r.rows.length === 0) return "";
    return r.rows
      .map((row) => `[${row.scope}] ${row.body}`)
      .reverse()
      .join("\n");
  } catch {
    return "";
  }
}

/** Optional: call from tools or Memory agent when you persist facts. */
export async function appendMemoryEntry(
  threadId: string,
  body: string,
  scope = "note"
): Promise<void> {
  if (!threadId || !body.trim()) return;
  try {
    await pool.query(
      `INSERT INTO agent_memory_entries (thread_id, scope, body) VALUES ($1, $2, $3)`,
      [threadId, scope, body.trim()]
    );
  } catch {
    /* table may not exist yet */
  }
}

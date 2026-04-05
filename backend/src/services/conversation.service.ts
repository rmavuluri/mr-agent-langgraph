import { randomUUID } from "crypto";
import { pool } from "../db/client";
import * as q from "../db/conversation.queries";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

export function titleFromFirstMessage(message: string, maxLen = 80): string {
  const oneLine = message.replace(/\s+/g, " ").trim();
  if (!oneLine) return "New chat";
  return oneLine.length <= maxLen ? oneLine : `${oneLine.slice(0, maxLen - 1)}…`;
}

export type ConversationListItem = {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
};

export async function listConversations(userId: string): Promise<ConversationListItem[]> {
  const r = await pool.query<{
    id: string;
    title: string;
    created_at: Date;
    updated_at: Date;
  }>(q.listConversationsForUser, [userId]);
  return r.rows.map((row) => ({
    id: row.id,
    title: row.title,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  }));
}

export async function getConversationWithMessages(
  conversationId: string,
  userId: string
): Promise<{
  conversation: ConversationListItem;
  messages: Array<{ role: string; content: string }>;
} | null> {
  const cr = await pool.query<{
    id: string;
    title: string;
    created_at: Date;
    updated_at: Date;
  }>(q.selectConversationByIdForUser, [conversationId, userId]);
  if (cr.rows.length === 0) return null;
  const c = cr.rows[0];
  const mr = await pool.query<{ role: string; content: string }>(
    q.selectMessagesForConversation,
    [conversationId]
  );
  return {
    conversation: {
      id: c.id,
      title: c.title,
      created_at: c.created_at.toISOString(),
      updated_at: c.updated_at.toISOString(),
    },
    messages: mr.rows,
  };
}

export async function deleteConversation(
  conversationId: string,
  userId: string
): Promise<boolean> {
  const r = await pool.query(q.deleteConversationForUser, [conversationId, userId]);
  return (r.rowCount ?? 0) > 0;
}

/**
 * Resolve thread id for LangGraph and ensure a conversation row exists for logged-in users.
 */
export async function ensureConversationForChat(
  userId: string,
  conversationId: string | undefined,
  firstMessage: string
): Promise<{ conversationId: string; isNew: boolean }> {
  if (conversationId) {
    if (!isUuid(conversationId)) {
      throw Object.assign(new Error("Invalid conversation_id."), { statusCode: 400 });
    }
    const check = await pool.query(q.selectConversationByIdForUser, [conversationId, userId]);
    if (check.rows.length === 0) {
      throw Object.assign(new Error("Conversation not found."), { statusCode: 404 });
    }
    return { conversationId, isNew: false };
  }
  const id = randomUUID();
  const title = titleFromFirstMessage(firstMessage);
  await pool.query(q.insertConversation, [id, userId, title]);
  return { conversationId: id, isNew: true };
}

export async function appendTurn(
  conversationId: string,
  userContent: string,
  assistantContent: string
): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(q.insertConversationMessage, [conversationId, "user", userContent]);
    await client.query(q.insertConversationMessage, [
      conversationId,
      "assistant",
      assistantContent,
    ]);
    await client.query(q.touchConversationUpdatedAt, [conversationId]);
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

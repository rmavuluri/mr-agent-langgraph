/**
 * Chat route: send a message to the orchestrator agent and get a response.
 * When user_id is present, persists the turn to Postgres and uses conversation id as LangGraph thread_id.
 */
import { Router, Request, Response } from "express";
import { runAgent } from "../agent";
import * as conversationService from "../services/conversation.service";

const router = Router();

type ChatBody = {
  message?: string;
  thread_id?: string;
  conversation_id?: string;
  messages?: Array<{ role?: string; content?: unknown }>;
  user_id?: string;
};

function parseChatBody(body: ChatBody): { message: string; thread_id?: string } {
  let message = typeof body.message === "string" ? body.message.trim() : "";

  if (!message && Array.isArray(body.messages)) {
    for (let i = body.messages.length - 1; i >= 0; i--) {
      const m = body.messages[i];
      if (m?.role === "user" && typeof m.content === "string") {
        message = m.content.trim();
        break;
      }
    }
  }

  const tid =
    typeof body.thread_id === "string" && body.thread_id.trim()
      ? body.thread_id.trim()
      : typeof body.conversation_id === "string" && body.conversation_id.trim()
        ? body.conversation_id.trim()
        : undefined;

  return { message, thread_id: tid };
}

router.post("/", async (req: Request, res: Response) => {
  const body = (req.body ?? {}) as ChatBody;
  const { message, thread_id } = parseChatBody(body);
  const userId = typeof body.user_id === "string" ? body.user_id.trim() : "";

  if (!message) {
    res.status(400).json({ error: "Invalid request", message: "message (string) is required." });
    return;
  }

  try {
    if (userId && conversationService.isUuid(userId)) {
      const { conversationId, isNew } = await conversationService.ensureConversationForChat(
        userId,
        thread_id,
        message
      );
      let priorTurnsFromDb: Array<{ role: string; content: string }> | undefined;
      if (!isNew) {
        const existing = await conversationService.getConversationWithMessages(conversationId, userId);
        priorTurnsFromDb = existing?.messages ?? [];
      }
      const out = await runAgent({
        message,
        thread_id: conversationId,
        priorTurnsFromDb,
      });
      await conversationService.appendTurn(conversationId, message, out.message);
      res.status(200).json({
        message: out.message,
        thread_id: out.thread_id,
        conversation_id: conversationId,
        content: [{ type: "text", text: out.message }],
      });
      return;
    }

    const out = await runAgent({ message, thread_id });
    res.status(200).json({
      message: out.message,
      thread_id: out.thread_id,
      conversation_id: out.thread_id,
      content: [{ type: "text", text: out.message }],
    });
  } catch (err) {
    const statusCode =
      err && typeof err === "object" && "statusCode" in err && typeof (err as { statusCode: unknown }).statusCode === "number"
        ? (err as { statusCode: number }).statusCode
        : 500;
    const msg = err instanceof Error ? err.message : "Agent request failed";
    res.status(statusCode).json({ error: "Error", message: msg });
  }
});

export default router;

/**
 * Conversations for sidebar: list, load messages, delete. Scoped by user_id query param.
 */
import { Router, Request, Response } from "express";
import * as conversationService from "../services/conversation.service";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const userId = typeof req.query.user_id === "string" ? req.query.user_id.trim() : "";
  if (!userId || !conversationService.isUuid(userId)) {
    res.status(400).json({ error: "Invalid request", message: "user_id (UUID) query param is required." });
    return;
  }
  try {
    const conversations = await conversationService.listConversations(userId);
    res.status(200).json({ conversations });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to list conversations";
    res.status(500).json({ error: "Error", message: msg });
  }
});

router.get("/:conversationId", async (req: Request, res: Response) => {
  const userId = typeof req.query.user_id === "string" ? req.query.user_id.trim() : "";
  const conversationId = req.params.conversationId?.trim() ?? "";
  if (!userId || !conversationService.isUuid(userId)) {
    res.status(400).json({ error: "Invalid request", message: "user_id (UUID) query param is required." });
    return;
  }
  if (!conversationId || !conversationService.isUuid(conversationId)) {
    res.status(400).json({ error: "Invalid request", message: "Invalid conversation id." });
    return;
  }
  try {
    const data = await conversationService.getConversationWithMessages(conversationId, userId);
    if (!data) {
      res.status(404).json({ error: "Not found", message: "Conversation not found." });
      return;
    }
    res.status(200).json(data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to load conversation";
    res.status(500).json({ error: "Error", message: msg });
  }
});

router.delete("/:conversationId", async (req: Request, res: Response) => {
  const userId = typeof req.query.user_id === "string" ? req.query.user_id.trim() : "";
  const conversationId = req.params.conversationId?.trim() ?? "";
  if (!userId || !conversationService.isUuid(userId)) {
    res.status(400).json({ error: "Invalid request", message: "user_id (UUID) query param is required." });
    return;
  }
  if (!conversationId || !conversationService.isUuid(conversationId)) {
    res.status(400).json({ error: "Invalid request", message: "Invalid conversation id." });
    return;
  }
  try {
    const deleted = await conversationService.deleteConversation(conversationId, userId);
    if (!deleted) {
      res.status(404).json({ error: "Not found", message: "Conversation not found." });
      return;
    }
    res.status(204).send();
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to delete conversation";
    res.status(500).json({ error: "Error", message: msg });
  }
});

export default router;

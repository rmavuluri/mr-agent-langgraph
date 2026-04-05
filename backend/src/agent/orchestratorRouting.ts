/**
 * LLM-based routing: memory vs reactive vs direct (default).
 * Web search is not a separate branch — the direct agent decides when to call Tavily.
 */
import type { BaseMessage } from "@langchain/core/messages";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { getBoundChatModel } from "./chatModel";
import type { OrchestratorBranch } from "./types";
import { isOrchestratorBranch } from "./types";

const noTools: [] = [];

function contentToPlainText(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") return part;
        if (part && typeof part === "object" && "text" in part) {
          const t = (part as { text?: unknown }).text;
          return typeof t === "string" ? t : "";
        }
        return "";
      })
      .join("");
  }
  return "";
}

/** Latest human message text in the thread (for routing the current turn). */
export function lastHumanText(messages: BaseMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m.getType() === "human") {
      return contentToPlainText(m.content).trim();
    }
  }
  return "";
}

export function parseRouteFromModelOutput(text: string): OrchestratorBranch {
  const m = text.toLowerCase().match(/\b(direct|memory|reactive)\b/);
  if (m && isOrchestratorBranch(m[1])) return m[1];
  return "direct";
}

/**
 * Classify which subgraph should handle this turn. Web search is handled inside **direct**, not here.
 */
export async function classifyOrchestratorBranch(userText: string): Promise<OrchestratorBranch> {
  const trimmed = userText.trim();
  if (!trimmed) return "direct";

  try {
    const model = getBoundChatModel(noTools);
    const sys = new SystemMessage(
      "You are a router for a multi-agent assistant. Reply with exactly ONE word from this set:\n" +
        "- direct — default: general chat, coding, reasoning, analysis, and questions that may OR MAY NOT need web search " +
        "(the direct agent will call web search itself if needed).\n" +
        "- memory — user refers to stored preferences, \"what did I tell you\", \"remember I said\", saved notes, long-term personal facts.\n" +
        "- reactive — explicit multi-step tool use or \"use your tools\" / recording observations in a structured way.\n\n" +
        "Do NOT output \"research\" — web lookup is not a separate route. If unsure, choose direct.\n" +
        "Output ONLY that single word, lowercase, no punctuation or explanation."
    );
    const res = await model.invoke([sys, new HumanMessage(trimmed)]);
    const raw = contentToPlainText(
      typeof res === "object" && res !== null && "content" in res
        ? (res as { content: unknown }).content
        : ""
    );
    return parseRouteFromModelOutput(raw);
  } catch {
    return "direct";
  }
}

/**
 * Agent entry: orchestrator graph with conversation memory (thread_id).
 */
import { AIMessage, HumanMessage, type BaseMessage } from "@langchain/core/messages";
import { orchestratorGraph } from "./agents/orchestratorAgent";

export { orchestratorGraph } from "./agents/orchestratorAgent";
export { memoryGraph } from "./agents/memoryAgent";
export { reactiveGraph } from "./agents/reactiveAgent";
export { directGraph } from "./agents/directAgent";
export { AgentState } from "./state";
export type { OrchestratorBranch } from "./types";
export { appendMemoryEntry, fetchMemoryContextForThread } from "./services/agentMemory.service";

export type AgentInput = {
  message: string;
  thread_id?: string;
  /** Prior turns from Postgres when LangGraph checkpoint is empty (e.g. after restart). */
  priorTurnsFromDb?: Array<{ role: string; content: string }>;
};
export type AgentOutput = { message: string; thread_id: string };

function dbTurnsToMessages(turns: Array<{ role: string; content: string }>): BaseMessage[] {
  return turns.map((m) =>
    m.role === "assistant" ? new AIMessage(m.content) : new HumanMessage(m.content)
  );
}

function textFromMessageContent(content: unknown): string {
  if (typeof content === "string") return content.trim();
  if (!Array.isArray(content)) return "";
  return content
    .map((part) => {
      if (typeof part === "string") return part;
      if (part && typeof part === "object" && "text" in part) {
        const t = (part as { text?: unknown }).text;
        return typeof t === "string" ? t : "";
      }
      return "";
    })
    .join("")
    .trim();
}

/**
 * Run the agent with one user message. Pass thread_id for conversation memory.
 */
export async function runAgent(input: AgentInput): Promise<AgentOutput> {
  const threadId = input.thread_id ?? `thread-${Date.now()}`;
  const config = { configurable: { thread_id: threadId } };

  let inputMessages: BaseMessage[];
  try {
    const snap = await orchestratorGraph.getState(config);
    const existing = snap?.values?.messages;
    const hasCheckpoint = Array.isArray(existing) && existing.length > 0;
    if (hasCheckpoint) {
      inputMessages = [new HumanMessage(input.message)];
    } else if (input.priorTurnsFromDb?.length) {
      inputMessages = [...dbTurnsToMessages(input.priorTurnsFromDb), new HumanMessage(input.message)];
    } else {
      inputMessages = [new HumanMessage(input.message)];
    }
  } catch {
    inputMessages =
      input.priorTurnsFromDb?.length && input.priorTurnsFromDb.length > 0
        ? [...dbTurnsToMessages(input.priorTurnsFromDb), new HumanMessage(input.message)]
        : [new HumanMessage(input.message)];
  }

  const result = await orchestratorGraph.invoke({ messages: inputMessages }, config);

  const last = result.messages[result.messages.length - 1];
  const raw = last && typeof last === "object" ? (last as { content?: unknown }).content : undefined;
  const text = textFromMessageContent(raw);
  const content = text || "I couldn't generate a response.";

  return { message: content, thread_id: threadId };
}

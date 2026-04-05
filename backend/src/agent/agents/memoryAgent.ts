/**
 * Memory agent (skeleton): load thread-scoped notes from DB, then respond with LLM + context.
 */
import { StateGraph, START, END } from "@langchain/langgraph";
import type { RunnableConfig } from "@langchain/core/runnables";
import { SystemMessage } from "@langchain/core/messages";
import { AgentState } from "../state";
import { getBoundChatModel } from "../chatModel";
import { fetchMemoryContextForThread } from "../services/agentMemory.service";

const noTools: [] = [];

async function loadMemory(
  _state: typeof AgentState.State,
  config?: RunnableConfig
): Promise<Partial<typeof AgentState.State>> {
  const threadId = String(config?.configurable?.thread_id ?? "");
  const memoryContext = await fetchMemoryContextForThread(threadId);
  return { memoryContext: memoryContext || undefined };
}

async function respondWithContext(state: typeof AgentState.State) {
  const block = state.memoryContext?.trim()
    ? state.memoryContext
    : "(No rows in agent_memory_entries for this thread yet.)";
  const sys = new SystemMessage(
    `You are the Memory agent. Use stored context when it helps; do not invent facts not present below.\n\n--- Stored memory ---\n${block}`
  );
  const response = await getBoundChatModel(noTools).invoke([sys, ...state.messages]);
  return { messages: [response] };
}

export const memoryGraph = new StateGraph(AgentState)
  .addNode("load_memory", loadMemory)
  .addNode("respond", respondWithContext)
  .addEdge(START, "load_memory")
  .addEdge("load_memory", "respond")
  .addEdge("respond", END)
  .compile();

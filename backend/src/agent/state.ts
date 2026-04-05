/**
 * Shared graph state: LangGraph message list plus slots for orchestration and agent handoffs.
 */
import { Annotation, MessagesAnnotation } from "@langchain/langgraph";

export const AgentState = Annotation.Root({
  ...MessagesAnnotation.spec,
  /** Set by orchestrator routing (see orchestratorAgent). */
  activeAgent: Annotation<string | undefined>(),
  /** Injected by Memory agent from DB / retrieval (skeleton). */
  memoryContext: Annotation<string | undefined>(),
  /** Research agent output / citations summary (skeleton). */
  researchBrief: Annotation<string | undefined>(),
});

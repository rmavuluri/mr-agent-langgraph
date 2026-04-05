/**
 * ReAct-style agent (skeleton): model ↔ tools loop. Replace stub tool with real actions.
 */
import { StateGraph, START, END } from "@langchain/langgraph";
import { ToolNode, toolsCondition } from "@langchain/langgraph/prebuilt";
import { DynamicTool } from "@langchain/core/tools";
import { AgentState } from "../state";
import { getBoundChatModel } from "../chatModel";

/** DynamicTool avoids TS2589 from `tool()` + Zod inference depth in this toolchain. */
const recordObservation = new DynamicTool({
  name: "record_observation",
  description:
    "Record a short factual note during reasoning (replace with real tools later). Input: the note text.",
  func: async (input: string) => `Recorded (stub): ${input}`,
});

const reactiveTools = [recordObservation];

async function callModel(state: typeof AgentState.State) {
  const response = await getBoundChatModel(reactiveTools).invoke(state.messages);
  return { messages: [response] };
}

const toolNode = new ToolNode(reactiveTools);

export const reactiveGraph = new StateGraph(AgentState)
  .addNode("agent", callModel)
  .addNode("tools", toolNode)
  .addEdge(START, "agent")
  .addConditionalEdges("agent", toolsCondition, ["tools", END])
  .addEdge("tools", "agent")
  .compile();

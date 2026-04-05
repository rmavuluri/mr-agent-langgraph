/**
 * Default chat agent: model answers from its own knowledge first.
 * It may call tavily_web_search only when it needs current web facts or is unsure / out of date.
 * Same tool as before; no separate "research-only" subgraph.
 */
import { StateGraph, START, END } from "@langchain/langgraph";
import { ToolNode, toolsCondition } from "@langchain/langgraph/prebuilt";
import { SystemMessage } from "@langchain/core/messages";
import { AgentState } from "../state";
import { getBoundChatModel } from "../chatModel";
import { createTavilyWebSearchTool } from "../tools/tavilySearch.tool";

const directTools = [createTavilyWebSearchTool()];
const toolNode = new ToolNode(directTools);

async function directCallModel(state: typeof AgentState.State) {
  const sys = new SystemMessage(
    "You are a helpful assistant.\n\n" +
      "1) Answer from your general knowledge when you can do so accurately and the information is not time-sensitive.\n" +
      "2) Call the tool **tavily_web_search** with a short, focused query when the user needs **recent or web-only** facts " +
      "(news, live data, prices, weather, sports, \"today\", \"latest\", or anything you are not confident about).\n" +
      "3) If the tool returns results, ground your answer in them and cite titles or URLs when useful.\n" +
      "4) If web search is not configured (tool says TAVILY_API_KEY missing), say clearly that you cannot browse the web.\n\n" +
      "Do not call the tool for questions you already answer well without it."
  );
  const response = await getBoundChatModel(directTools).invoke([sys, ...state.messages]);
  return { messages: [response] };
}

export const directGraph = new StateGraph(AgentState)
  .addNode("agent", directCallModel)
  .addNode("tools", toolNode)
  .addEdge(START, "agent")
  .addConditionalEdges("agent", toolsCondition, ["tools", END])
  .addEdge("tools", "agent")
  .compile();

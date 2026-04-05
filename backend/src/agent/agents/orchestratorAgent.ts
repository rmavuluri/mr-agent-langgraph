/**
 * Orchestrator: route → memory | reactive | direct (default).
 * **Direct** subgraph = chat + optional Tavily (model decides when to search).
 */
import { StateGraph, START, END, MemorySaver } from "@langchain/langgraph";
import { env } from "../../config/env";
import { AgentState } from "../state";
import type { OrchestratorBranch } from "../types";
import { isOrchestratorBranch } from "../types";
import {
  classifyOrchestratorBranch,
  lastHumanText,
} from "../orchestratorRouting";
import { memoryGraph } from "./memoryAgent";
import { reactiveGraph } from "./reactiveAgent";
import { directGraph } from "./directAgent";

function devForcedRoute(): OrchestratorBranch | null {
  const raw = env.agentDefaultRoute.trim().toLowerCase();
  if (!raw) return null;
  // Legacy env value: research is folded into direct (Tavily inside direct agent).
  if (raw === "research") return "direct";
  return isOrchestratorBranch(raw) ? raw : null;
}

async function routeIntent(
  state: typeof AgentState.State
): Promise<Partial<typeof AgentState.State>> {
  const forced = devForcedRoute();
  if (forced !== null) {
    return { activeAgent: forced };
  }

  const userText = lastHumanText(state.messages);
  if (!userText) {
    return { activeAgent: "direct" };
  }

  const branch = await classifyOrchestratorBranch(userText);
  return { activeAgent: branch };
}

function routeAfterPlan(state: typeof AgentState.State): OrchestratorBranch {
  const a = state.activeAgent ?? "direct";
  return isOrchestratorBranch(a) ? a : "direct";
}

export const orchestratorGraph = new StateGraph(AgentState)
  .addNode("route", routeIntent)
  .addNode("memory", memoryGraph)
  .addNode("reactive", reactiveGraph)
  .addNode("direct", directGraph)
  .addEdge(START, "route")
  .addConditionalEdges("route", routeAfterPlan, {
    memory: "memory",
    reactive: "reactive",
    direct: "direct",
  })
  .addEdge("memory", END)
  .addEdge("reactive", END)
  .addEdge("direct", END)
  .compile({ checkpointer: new MemorySaver() });

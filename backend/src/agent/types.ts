/** Orchestrator branch: direct = default chat (+ optional Tavily inside directAgent). */
export type OrchestratorBranch = "direct" | "memory" | "reactive";

export function isOrchestratorBranch(v: string): v is OrchestratorBranch {
  return v === "direct" || v === "memory" || v === "reactive";
}

# Agent (LangGraph)

## Layout

- **state.ts** – Messages + `activeAgent`, `memoryContext`, `researchBrief`.
- **types.ts** – `OrchestratorBranch`: `direct` | `memory` | `reactive` (no separate **research** branch).
- **chatModel.ts** – OpenAI / Anthropic / Gemini via env.
- **services/agentMemory.service.ts** – Postgres `agent_memory_entries` read/write (safe if table missing).
- **agents/orchestratorAgent.ts** – **Route** → **memory** | **reactive** | **direct**; optional `AGENT_DEFAULT_ROUTE`. Checkpointer: `MemorySaver` + `thread_id`.
- **orchestratorRouting.ts** – Router LLM: `classifyOrchestratorBranch()` (web search is **not** routed here).
- **agents/directAgent.ts** – **Default path**: one LLM with optional **`tavily_web_search`** (ReAct). Model answers from knowledge first; it **chooses** when to call the tool.
- **tools/tavilySearch.tool.ts** + **services/tavily.service.ts** – Single Tavily tool used by **directAgent** (and reactive uses its own stub tool).
- **agents/memoryAgent.ts** – Load thread memory → LLM with system context.
- **agents/reactiveAgent.ts** – ReAct loop with stub `record_observation` tool.
- **index.ts** – `runAgent()`, graph exports.

## Flow

1. `POST /api/chat` → **orchestratorGraph**.
2. **route** picks **memory** / **reactive** / **direct** (LLM or `AGENT_DEFAULT_ROUTE`). **`research` env value maps to `direct`.**
3. **direct** = ReAct graph: assistant may reply **without** tools, or call **tavily_web_search**, then reply again.

## Env

- LLM keys: `src/config/env.ts`, `.env.example`.
- **AGENT_DEFAULT_ROUTE** – `direct` | `memory` | `reactive` (optional). Legacy `research` is treated as `direct`.
- **TAVILY_API_KEY** – Enables real web search when the **direct** model invokes the tool.

## DB

Apply `sql/schema.sql` (includes `agent_memory_entries`).

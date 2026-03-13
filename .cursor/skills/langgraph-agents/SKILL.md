---
name: langgraph-agents
description: Builds or modifies LangGraph agents and subagents (state graphs, tools, checkpointing, subgraphs). Use when adding or changing agent logic, graph nodes, tools, or subagent flows in this project.
---

# LangGraph Agents

## When to use
Apply when working on agent or subagent code: graph definition, state schema, nodes, tools, checkpointing, or subgraphs.

## Quick reference
- **State**: Define with `StateSchema` and `MessagesValue` (or reducers). Return partial updates from nodes; never mutate in place.
- **Subagents**: Implement as subgraphs. Compile the child graph and add it as a node in the parent; define a clear state in/out contract.
- **Tools**: Bind to the LLM; use `ToolNode` from `@langchain/langgraph/prebuilt` for execution. Handle tool errors and return fallback state.
- **Persistence**: Use `MemorySaver` or `AsyncPostgresSaver`; pass `thread_id` in `config.configurable`; set checkpointer at compile time.
- **Routing**: Use `addConditionalEdges`; do not hardcode flow inside nodes. Always wire to an explicit `END` node.

## Project context
- Agent code may live under `backend/src/agent/` or a dedicated package. Keep graphs and tools in one place.
- Follow the project rule file `.cursor/rules/langgraph-agent.mdc` for full conventions (state example, error handling, testing, naming).

/**
 * LangChain tool: web search via Tavily (string in/out to avoid deep Zod inference issues).
 */
import { DynamicTool } from "@langchain/core/tools";
import { env } from "../../config/env";
import { tavilySearch } from "../services/tavily.service";

export function createTavilyWebSearchTool(): DynamicTool {
  return new DynamicTool({
    name: "tavily_web_search",
    description:
      "Search the public web for current facts, news, prices, or anything that may have changed after your knowledge cutoff. " +
      "Input must be a single concise search query string (not JSON).",
    func: async (input: string) => {
      const query = (input ?? "").trim();
      if (!query) {
        return "Error: empty search query.";
      }
      const key = env.tavilyApiKey;
      if (!key) {
        return "Tavily is not configured (set TAVILY_API_KEY on the server).";
      }
      return tavilySearch(key, { query, maxResults: 5, searchDepth: "basic" });
    },
  });
}

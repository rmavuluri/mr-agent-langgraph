/**
 * Tavily Search API (https://tavily.com) — used by the Research agent tool.
 */
const TAVILY_SEARCH_URL = "https://api.tavily.com/search";

export type TavilySearchOptions = {
  query: string;
  maxResults?: number;
  searchDepth?: "basic" | "advanced" | "fast" | "ultra-fast";
};

type TavilyResponse = {
  answer?: string;
  results?: Array<{ title?: string; url?: string; content?: string }>;
  error?: string;
};

export async function tavilySearch(
  apiKey: string,
  options: TavilySearchOptions
): Promise<string> {
  const body = {
    api_key: apiKey,
    query: options.query.trim(),
    max_results: options.maxResults ?? 5,
    search_depth: options.searchDepth ?? "basic",
  };

  const res = await fetch(TAVILY_SEARCH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  if (!res.ok) {
    return `Tavily HTTP ${res.status}: ${text.slice(0, 600)}`;
  }

  let data: TavilyResponse;
  try {
    data = JSON.parse(text) as TavilyResponse;
  } catch {
    return `Tavily returned non-JSON: ${text.slice(0, 400)}`;
  }

  if (data.error) {
    return `Tavily error: ${data.error}`;
  }

  const parts: string[] = [];
  if (data.answer) {
    parts.push(`Summary: ${data.answer}`);
  }
  if (data.results?.length) {
    for (const r of data.results) {
      const snippet = (r.content ?? "").replace(/\s+/g, " ").trim().slice(0, 800);
      parts.push(
        `Title: ${r.title ?? "(no title)"}\nURL: ${r.url ?? ""}\n${snippet}`
      );
    }
  }

  return parts.length > 0 ? parts.join("\n\n---\n\n") : "No results returned.";
}

import type { StructuredToolInterface } from '@langchain/core/tools';
import type { Runnable } from '@langchain/core/runnables';
import { ChatAnthropic } from '@langchain/anthropic';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatOpenAI } from '@langchain/openai';
import { llmKeys, resolveLlmProvider } from '../config/env';

const OPENAI_MODEL = 'gpt-4o-mini';
const ANTHROPIC_MODEL = 'claude-haiku-4-5';
const GEMINI_MODEL = 'gemini-2.0-flash';

const cache = new WeakMap<object, Runnable>();

function createBoundChatModel(tools: StructuredToolInterface[]): Runnable {
  const provider = resolveLlmProvider();
  const temperature = 0;

  switch (provider) {
    case 'openai':
      return new ChatOpenAI({
        model: OPENAI_MODEL,
        temperature,
        apiKey: llmKeys.openai,
      }).bindTools(tools);
    case 'anthropic':
      return new ChatAnthropic({
        model: ANTHROPIC_MODEL,
        temperature,
        anthropicApiKey: llmKeys.anthropic,
      }).bindTools(tools);
    case 'gemini':
      return new ChatGoogleGenerativeAI({
        model: GEMINI_MODEL,
        temperature,
        apiKey: llmKeys.gemini,
      }).bindTools(tools);
  }
}

/** Lazy, cached per tools list so the server can start before keys are validated. */
export function getBoundChatModel(tools: StructuredToolInterface[]): Runnable {
  const key = tools as unknown as object;
  let m = cache.get(key);
  if (!m) {
    m = createBoundChatModel(tools);
    cache.set(key, m);
  }
  return m;
}

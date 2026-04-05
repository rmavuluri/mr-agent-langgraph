import dotenv from 'dotenv';

dotenv.config();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (value === undefined || value === '') {
    throw new Error(`Missing required env: ${name}`);
  }
  return value;
}

function trimEnv(name: string): string {
  return (process.env[name] ?? '').trim();
}

/** Which LLM backend to use for the agent (resolved keys + optional LLM_PROVIDER). */
export type LlmProvider = 'openai' | 'anthropic' | 'gemini';

export const llmKeys = {
  openai: trimEnv('OPENAI_API_KEY'),
  anthropic: trimEnv('ANTHROPIC_API_KEY'),
  gemini: trimEnv('GEMINI_API_KEY') || trimEnv('GOOGLE_API_KEY'),
} as const;

/**
 * Pick the LLM provider for /api/chat. Call when building the model (lazy), not at import time.
 * - If LLM_PROVIDER is set, it must match a configured key.
 * - If exactly one key is set, that provider is used.
 * - If multiple keys are set, LLM_PROVIDER is required.
 */
export function resolveLlmProvider(): LlmProvider {
  const raw = process.env.LLM_PROVIDER?.trim().toLowerCase();
  const hasOpenai = Boolean(llmKeys.openai);
  const hasAnthropic = Boolean(llmKeys.anthropic);
  const hasGemini = Boolean(llmKeys.gemini);
  const count =
    (hasOpenai ? 1 : 0) + (hasAnthropic ? 1 : 0) + (hasGemini ? 1 : 0);

  if (raw === 'openai' || raw === 'anthropic' || raw === 'gemini') {
    if (raw === 'openai' && !hasOpenai) {
      throw new Error('LLM_PROVIDER=openai but OPENAI_API_KEY is missing.');
    }
    if (raw === 'anthropic' && !hasAnthropic) {
      throw new Error('LLM_PROVIDER=anthropic but ANTHROPIC_API_KEY is missing.');
    }
    if (raw === 'gemini' && !hasGemini) {
      throw new Error(
        'LLM_PROVIDER=gemini but GEMINI_API_KEY or GOOGLE_API_KEY is missing.'
      );
    }
    return raw;
  }

  if (raw) {
    throw new Error(
      `Invalid LLM_PROVIDER "${process.env.LLM_PROVIDER}". Use openai, anthropic, or gemini.`
    );
  }

  if (count === 0) {
    throw new Error(
      'No LLM API key configured. Set one of OPENAI_API_KEY, ANTHROPIC_API_KEY, GEMINI_API_KEY (or GOOGLE_API_KEY).'
    );
  }
  if (count > 1) {
    throw new Error(
      'Multiple LLM API keys are set. Set LLM_PROVIDER to openai, anthropic, or gemini.'
    );
  }
  if (hasOpenai) return 'openai';
  if (hasAnthropic) return 'anthropic';
  return 'gemini';
}

export const env = {
  port: Number(process.env.PORT) || 3001,
  nodeEnv: process.env.NODE_ENV ?? 'development',
  databaseUrl: requireEnv('DATABASE_URL'),
  /** OpenAI API key (optional if another provider is selected). */
  openaiApiKey: llmKeys.openai,
  /** Anthropic API key (optional if another provider is selected). */
  anthropicApiKey: llmKeys.anthropic,
  /** Google Gemini API key from GEMINI_API_KEY or GOOGLE_API_KEY. */
  geminiApiKey: llmKeys.gemini,
  /** Optional explicit provider when more than one LLM key is set. */
  llmProviderRaw: process.env.LLM_PROVIDER?.trim() ?? '',
  /**
   * Optional: force orchestrator branch (direct | memory | reactive).
   * Value "research" is treated as direct (Tavily lives inside directAgent). Empty = LLM router.
   */
  agentDefaultRoute: trimEnv('AGENT_DEFAULT_ROUTE'),
  /** Tavily API key for Research agent web search (optional). */
  tavilyApiKey: trimEnv('TAVILY_API_KEY'),
} as const;

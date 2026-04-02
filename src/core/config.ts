import type { AIProviderConfig, AIProviderType } from './types';
import { ConfigError } from './errors';

export interface AppConfig {
  provider: AIProviderType;
  ai: AIProviderConfig;
}

export function getConfig(): AppConfig {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new ConfigError(
      'VITE_GEMINI_API_KEY is not set. Copy .env.example to .env and add your API key.',
    );
  }

  return {
    provider: import.meta.env.VITE_AI_PROVIDER || 'gemini',
    ai: {
      apiKey,
      model: import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash',
    },
  };
}

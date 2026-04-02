import type { IAIProvider } from '@/core/ai-provider.interface';
import type { AIProviderConfig, AIProviderType } from '@/core/types';
import { GeminiAdapter } from './gemini-adapter';
import { LangChainAdapter } from './langchain-adapter';

export function createAIProvider(type: AIProviderType, config: AIProviderConfig): IAIProvider {
  switch (type) {
    case 'gemini':
      return new GeminiAdapter(config);
    case 'langchain':
      return new LangChainAdapter(config);
  }
}

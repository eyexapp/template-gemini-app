---
name: code-quality
type: knowledge
version: 1.0.0
agent: CodeActAgent
triggers:
  - code quality
  - naming
  - typescript
  - adapter
  - types
---

# Code Quality — Gemini App (Vanilla TypeScript)

## Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Class | PascalCase | `GeminiAdapter`, `ChatOrchestrator` |
| Interface | PascalCase | `AIAdapter`, `ChatMessage` |
| Function | camelCase | `buildPrompt()`, `countTokens()` |
| Variable | camelCase | `messageHistory` |
| Constant | UPPER_SNAKE | `MAX_TOKENS`, `DEFAULT_MODEL` |
| Enum | PascalCase + PascalCase members | `ModelProvider.Gemini` |
| File | kebab-case | `gemini-adapter.ts` |
| DOM element ID | kebab-case | `chat-container` |

## Type Safety

```typescript
// Strong typing for all AI interactions
interface ModelConfig {
  provider: 'gemini' | 'openai' | 'langchain';
  model: string;
  temperature: number;
  maxTokens: number;
}

// Exhaustive adapter factory
function createAdapter(config: ModelConfig): AIAdapter {
  switch (config.provider) {
    case 'gemini': return new GeminiAdapter(getApiKey('gemini'));
    case 'openai': return new OpenAIAdapter(getApiKey('openai'));
    case 'langchain': return new LangChainAdapter(getApiKey('langchain'));
    default: {
      const _exhaustive: never = config.provider;
      throw new Error(`Unknown provider: ${_exhaustive}`);
    }
  }
}
```

## Error Handling

```typescript
// Custom error hierarchy
class AIError extends Error {
  constructor(message: string, public readonly provider: string, public readonly code?: string) {
    super(message);
    this.name = 'AIError';
  }
}

class RateLimitError extends AIError {
  constructor(provider: string, retryAfter?: number) {
    super(`Rate limited by ${provider}`, provider, 'RATE_LIMIT');
  }
}

class AuthenticationError extends AIError {
  constructor(provider: string) {
    super(`Invalid API key for ${provider}`, provider, 'AUTH_ERROR');
  }
}

// Adapter wraps provider errors
async chat(messages: ChatMessage[]): Promise<string> {
  try {
    // ... provider call
  } catch (error) {
    if (error instanceof Error && error.message.includes('429')) {
      throw new RateLimitError(this.name);
    }
    throw new AIError(error instanceof Error ? error.message : 'Unknown error', this.name);
  }
}
```

## Vanilla DOM Patterns

```typescript
// Type-safe DOM helpers
function $(selector: string): HTMLElement {
  const el = document.querySelector<HTMLElement>(selector);
  if (!el) throw new Error(`Element not found: ${selector}`);
  return el;
}

function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs?: Record<string, string>,
  children?: (HTMLElement | string)[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (attrs) Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  children?.forEach(c => el.append(typeof c === 'string' ? document.createTextNode(c) : c));
  return el;
}
```

## Prompt Building

```typescript
// core/prompt-builder.ts
export function buildSystemPrompt(context: { role?: string; rules?: string[] }): string {
  const parts: string[] = [];
  if (context.role) parts.push(`You are ${context.role}.`);
  if (context.rules?.length) parts.push(`Rules:\n${context.rules.map(r => `- ${r}`).join('\n')}`);
  return parts.join('\n\n');
}
```

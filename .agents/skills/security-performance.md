---
name: security-performance
type: knowledge
version: 1.0.0
agent: CodeActAgent
triggers:
  - security
  - performance
  - api key
  - streaming
  - bundle size
---

# Security & Performance — Gemini App

## Security

### API Key Handling

```typescript
// Keys stored in localStorage — user provides their own
// Never hardcode API keys
const KEY_PREFIX = 'ai_key_';

export function getApiKey(provider: string): string {
  const key = localStorage.getItem(`${KEY_PREFIX}${provider}`);
  if (!key) throw new AuthenticationError(provider);
  return key;
}

export function setApiKey(provider: string, key: string): void {
  localStorage.setItem(`${KEY_PREFIX}${provider}`, key);
}

export function removeApiKey(provider: string): void {
  localStorage.removeItem(`${KEY_PREFIX}${provider}`);
}
```

### Input Sanitization

```typescript
// Sanitize user messages before display
function sanitizeForDisplay(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Never use innerHTML with AI responses
messageEl.textContent = response;
```

### Content Security Policy

```html
<meta http-equiv="Content-Security-Policy"
  content="default-src 'self'; connect-src https://generativelanguage.googleapis.com https://api.openai.com; script-src 'self';">
```

### Rate Limiting (Client-Side)

```typescript
class RateLimiter {
  private timestamps: number[] = [];
  constructor(private maxRequests: number, private windowMs: number) {}

  canProceed(): boolean {
    const now = Date.now();
    this.timestamps = this.timestamps.filter(t => now - t < this.windowMs);
    if (this.timestamps.length >= this.maxRequests) return false;
    this.timestamps.push(now);
    return true;
  }
}

const limiter = new RateLimiter(10, 60_000); // 10 req/min
```

## Performance

### Streaming Responses

```typescript
// Always prefer streaming for chat — better UX
for await (const chunk of chat.sendStream(userMessage)) {
  responseEl.textContent += chunk;
  chatContainer.scrollTop = chatContainer.scrollHeight;
}
```

### Message Virtualization

```typescript
// For long conversations, only render visible messages
function renderVisibleMessages(messages: ChatMessage[], viewport: HTMLElement) {
  const scrollTop = viewport.scrollTop;
  const height = viewport.clientHeight;
  // Calculate visible range and only create DOM for those
}
```

### Bundle Size

```typescript
// Dynamic import for adapters — only load what's needed
async function loadAdapter(provider: string): Promise<AIAdapter> {
  switch (provider) {
    case 'gemini': {
      const { GeminiAdapter } = await import('./adapters/gemini-adapter');
      return new GeminiAdapter(getApiKey('gemini'));
    }
    case 'openai': {
      const { OpenAIAdapter } = await import('./adapters/openai-adapter');
      return new OpenAIAdapter(getApiKey('openai'));
    }
    default: throw new Error(`Unknown provider: ${provider}`);
  }
}
```

### Conversation Persistence

```typescript
// Persist conversations to localStorage
const STORAGE_KEY = 'conversations';

function saveConversation(id: string, messages: ChatMessage[]): void {
  const all = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
  all[id] = messages;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}
```

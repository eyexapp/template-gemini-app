---
name: testing
type: knowledge
version: 1.0.0
agent: CodeActAgent
triggers:
  - test
  - vitest
  - mock
  - adapter test
---

# Testing — Gemini App (Vitest)

## Adapter Tests (Mock)

```typescript
// adapters/__tests__/gemini-adapter.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GeminiAdapter } from '../gemini-adapter';
import type { ChatMessage } from '../types';

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: () => ({
      startChat: () => ({
        sendMessage: vi.fn().mockResolvedValue({
          response: { text: () => 'Hello from Gemini' },
        }),
      }),
    }),
  })),
}));

describe('GeminiAdapter', () => {
  let adapter: GeminiAdapter;

  beforeEach(() => {
    adapter = new GeminiAdapter('test-api-key');
  });

  it('returns chat response', async () => {
    const messages: ChatMessage[] = [{ role: 'user', content: 'Hi' }];
    const response = await adapter.chat(messages);
    expect(response).toBe('Hello from Gemini');
  });

  it('has correct name', () => {
    expect(adapter.name).toBe('gemini');
  });
});
```

## Chat Orchestrator Tests

```typescript
// core/__tests__/chat.test.ts
import { describe, it, expect, vi } from 'vitest';
import { ChatOrchestrator } from '../chat';
import type { AIAdapter } from '../../adapters/types';

function createMockAdapter(): AIAdapter {
  return {
    name: 'mock',
    chat: vi.fn().mockResolvedValue('Mock response'),
    stream: vi.fn().mockImplementation(async function* () {
      yield 'Mock ';
      yield 'stream';
    }),
  };
}

describe('ChatOrchestrator', () => {
  it('sends message and stores history', async () => {
    const adapter = createMockAdapter();
    const chat = new ChatOrchestrator(adapter);

    const response = await chat.send('Hello');

    expect(response).toBe('Mock response');
    expect(adapter.chat).toHaveBeenCalledWith(
      expect.arrayContaining([{ role: 'user', content: 'Hello' }])
    );
  });

  it('streams response chunks', async () => {
    const adapter = createMockAdapter();
    const chat = new ChatOrchestrator(adapter);

    const chunks: string[] = [];
    for await (const chunk of chat.sendStream('Hello')) {
      chunks.push(chunk);
    }

    expect(chunks).toEqual(['Mock ', 'stream']);
  });

  it('swaps adapter at runtime', async () => {
    const adapter1 = createMockAdapter();
    const adapter2 = createMockAdapter();
    (adapter2.chat as ReturnType<typeof vi.fn>).mockResolvedValue('Adapter 2');

    const chat = new ChatOrchestrator(adapter1);
    chat.setAdapter(adapter2);
    const response = await chat.send('Hi');

    expect(response).toBe('Adapter 2');
  });
});
```

## Running Tests

```bash
npx vitest
npx vitest --coverage
npx vitest --watch
```

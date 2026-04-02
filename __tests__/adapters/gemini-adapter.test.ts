import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GeminiAdapter } from '@/adapters/gemini-adapter';
import type { AIMessage } from '@/core/types';

vi.mock('@google/generative-ai', () => {
  const sendMessage = vi.fn().mockResolvedValue({
    response: {
      text: () => 'Hello from Gemini',
      candidates: [{ finishReason: 'STOP' }],
    },
  });

  const sendMessageStream = vi.fn().mockResolvedValue({
    stream: (async function* () {
      yield { text: () => 'Hello ' };
      yield { text: () => 'World' };
    })(),
  });

  return {
    GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
      getGenerativeModel: vi.fn().mockReturnValue({
        startChat: vi.fn().mockReturnValue({
          sendMessage,
          sendMessageStream,
        }),
      }),
    })),
  };
});

describe('GeminiAdapter', () => {
  let adapter: GeminiAdapter;
  const messages: AIMessage[] = [
    { role: 'user', parts: [{ type: 'text', text: 'Hello' }] },
  ];

  beforeEach(() => {
    adapter = new GeminiAdapter({ apiKey: 'test-key', model: 'gemini-2.5-flash' });
  });

  it('should generate a response', async () => {
    const result = await adapter.generate(messages);
    expect(result.text).toBe('Hello from Gemini');
    expect(result.finishReason).toBe('STOP');
  });

  it('should stream chunks', async () => {
    const chunks: string[] = [];
    for await (const chunk of adapter.stream(messages)) {
      chunks.push(chunk.text);
    }
    expect(chunks).toContain('Hello ');
    expect(chunks).toContain('World');
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AIService } from '@/services/ai-service';
import type { IAIProvider } from '@/core/ai-provider.interface';
import type { AIMessage } from '@/core/types';

function createMockProvider(): IAIProvider {
  return {
    generate: vi.fn().mockResolvedValue({ text: '**Bold text**', finishReason: 'STOP' }),
    stream: vi.fn().mockImplementation(async function* () {
      yield { text: 'Hello ', done: false };
      yield { text: 'World', done: false };
      yield { text: '', done: true };
    }),
  };
}

describe('AIService', () => {
  let service: AIService;
  let provider: IAIProvider;
  const messages: AIMessage[] = [
    { role: 'user', parts: [{ type: 'text', text: 'Test' }] },
  ];

  beforeEach(() => {
    provider = createMockProvider();
    service = new AIService(provider);
  });

  it('should generate a response', async () => {
    const result = await service.generate(messages);
    expect(result.text).toBe('**Bold text**');
    expect(provider.generate).toHaveBeenCalledWith(messages, undefined);
  });

  it('should generate markdown HTML', async () => {
    const html = await service.generateMarkdown(messages);
    expect(html).toContain('<strong>Bold text</strong>');
  });

  it('should stream raw text', async () => {
    const chunks: string[] = [];
    for await (const chunk of service.streamRaw(messages)) {
      chunks.push(chunk);
    }
    expect(chunks).toEqual(['Hello ', 'World']);
  });

  it('should stream markdown HTML', async () => {
    const results: string[] = [];
    for await (const html of service.streamMarkdown(messages)) {
      results.push(html);
    }
    expect(results.length).toBe(2);
    expect(results[1]).toContain('Hello World');
  });
});

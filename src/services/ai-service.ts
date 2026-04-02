import MarkdownIt from 'markdown-it';
import type { IAIProvider } from '@/core/ai-provider.interface';
import type { AIMessage, AIResponse, GenerateOptions } from '@/core/types';

const md = new MarkdownIt();

export class AIService {
  constructor(private readonly provider: IAIProvider) {}

  async generate(messages: AIMessage[], options?: GenerateOptions): Promise<AIResponse> {
    return this.provider.generate(messages, options);
  }

  async generateMarkdown(messages: AIMessage[], options?: GenerateOptions): Promise<string> {
    const response = await this.provider.generate(messages, options);
    return md.render(response.text);
  }

  async *streamMarkdown(
    messages: AIMessage[],
    options?: GenerateOptions,
  ): AsyncGenerator<string> {
    let accumulated = '';

    for await (const chunk of this.provider.stream(messages, options)) {
      if (chunk.done) break;
      accumulated += chunk.text;
      yield md.render(accumulated);
    }
  }

  async *streamRaw(messages: AIMessage[], options?: GenerateOptions): AsyncGenerator<string> {
    for await (const chunk of this.provider.stream(messages, options)) {
      if (chunk.done) break;
      yield chunk.text;
    }
  }
}

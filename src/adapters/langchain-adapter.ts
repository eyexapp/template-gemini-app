import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage, AIMessage as LCAIMessage, SystemMessage } from '@langchain/core/messages';
import type { IAIProvider } from '@/core/ai-provider.interface';
import type {
  AIMessage,
  AIProviderConfig,
  AIResponse,
  ContentPart,
  GenerateOptions,
  StreamChunk,
} from '@/core/types';
import { AIProviderError } from '@/core/errors';

function toMessageContent(parts: ContentPart[]) {
  return parts.map((part) => {
    if (part.type === 'text') return { type: 'text' as const, text: part.text };
    return {
      type: 'image_url' as const,
      image_url: `data:${part.mimeType};base64,${part.data}`,
    };
  });
}

function toLangChainMessages(messages: AIMessage[], systemInstruction?: string) {
  const lcMessages = [];

  if (systemInstruction) {
    lcMessages.push(new SystemMessage(systemInstruction));
  }

  for (const msg of messages) {
    if (msg.role === 'user') {
      lcMessages.push(new HumanMessage({ content: toMessageContent(msg.parts) }));
    } else {
      const text = msg.parts
        .filter((p) => p.type === 'text')
        .map((p) => p.text)
        .join('');
      lcMessages.push(new LCAIMessage(text));
    }
  }

  return lcMessages;
}

export class LangChainAdapter implements IAIProvider {
  private readonly model: ChatGoogleGenerativeAI;

  constructor(config: AIProviderConfig) {
    this.model = new ChatGoogleGenerativeAI({
      apiKey: config.apiKey,
      model: config.model,
    });
  }

  async generate(messages: AIMessage[], options?: GenerateOptions): Promise<AIResponse> {
    try {
      const lcMessages = toLangChainMessages(messages, options?.systemInstruction);

      if (options?.temperature !== undefined) this.model.temperature = options.temperature;
      if (options?.maxTokens !== undefined) this.model.maxOutputTokens = options.maxTokens;

      const result = await this.model.invoke(lcMessages);

      return {
        text: typeof result.content === 'string' ? result.content : JSON.stringify(result.content),
        finishReason: result.response_metadata?.finishReason as string | undefined,
      };
    } catch (error) {
      throw new AIProviderError('LangChain generation failed', 'langchain', error);
    }
  }

  async *stream(messages: AIMessage[], options?: GenerateOptions): AsyncGenerator<StreamChunk> {
    try {
      const lcMessages = toLangChainMessages(messages, options?.systemInstruction);

      if (options?.temperature !== undefined) this.model.temperature = options.temperature;
      if (options?.maxTokens !== undefined) this.model.maxOutputTokens = options.maxTokens;

      const stream = await this.model.stream(lcMessages);

      for await (const chunk of stream) {
        const text =
          typeof chunk.content === 'string' ? chunk.content : JSON.stringify(chunk.content);
        yield { text, done: false };
      }

      yield { text: '', done: true };
    } catch (error) {
      throw new AIProviderError('LangChain streaming failed', 'langchain', error);
    }
  }
}

import { GoogleGenerativeAI } from '@google/generative-ai';
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

function toGeminiParts(parts: ContentPart[]) {
  return parts.map((part) => {
    if (part.type === 'text') return { text: part.text };
    return { inlineData: { data: part.data, mimeType: part.mimeType } };
  });
}

function toGeminiHistory(messages: AIMessage[]) {
  return messages.map((msg) => ({
    role: msg.role === 'model' ? 'model' : 'user',
    parts: toGeminiParts(msg.parts),
  }));
}

export class GeminiAdapter implements IAIProvider {
  private readonly client: GoogleGenerativeAI;
  private readonly model: string;

  constructor(config: AIProviderConfig) {
    this.client = new GoogleGenerativeAI(config.apiKey);
    this.model = config.model;
  }

  async generate(messages: AIMessage[], options?: GenerateOptions): Promise<AIResponse> {
    try {
      const model = this.client.getGenerativeModel({
        model: this.model,
        ...(options?.systemInstruction && {
          systemInstruction: options.systemInstruction,
        }),
      });

      const history = toGeminiHistory(messages.slice(0, -1));
      const lastMessage = messages[messages.length - 1];

      const chat = model.startChat({
        history,
        generationConfig: {
          ...(options?.temperature !== undefined && { temperature: options.temperature }),
          ...(options?.maxTokens !== undefined && { maxOutputTokens: options.maxTokens }),
        },
      });

      const result = await chat.sendMessage(toGeminiParts(lastMessage.parts));
      const response = result.response;

      return {
        text: response.text(),
        finishReason: response.candidates?.[0]?.finishReason,
      };
    } catch (error) {
      throw new AIProviderError('Gemini generation failed', 'gemini', error);
    }
  }

  async *stream(messages: AIMessage[], options?: GenerateOptions): AsyncGenerator<StreamChunk> {
    try {
      const model = this.client.getGenerativeModel({
        model: this.model,
        ...(options?.systemInstruction && {
          systemInstruction: options.systemInstruction,
        }),
      });

      const history = toGeminiHistory(messages.slice(0, -1));
      const lastMessage = messages[messages.length - 1];

      const chat = model.startChat({
        history,
        generationConfig: {
          ...(options?.temperature !== undefined && { temperature: options.temperature }),
          ...(options?.maxTokens !== undefined && { maxOutputTokens: options.maxTokens }),
        },
      });

      const result = await chat.sendMessageStream(toGeminiParts(lastMessage.parts));

      for await (const chunk of result.stream) {
        const text = chunk.text();
        yield { text, done: false };
      }

      yield { text: '', done: true };
    } catch (error) {
      throw new AIProviderError('Gemini streaming failed', 'gemini', error);
    }
  }
}

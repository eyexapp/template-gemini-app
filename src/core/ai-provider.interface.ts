import type { AIMessage, AIResponse, GenerateOptions, StreamChunk } from './types';

export interface IAIProvider {
  generate(messages: AIMessage[], options?: GenerateOptions): Promise<AIResponse>;
  stream(messages: AIMessage[], options?: GenerateOptions): AsyncGenerator<StreamChunk>;
}

export type AIProviderType = 'gemini' | 'langchain';

export interface TextPart {
  type: 'text';
  text: string;
}

export interface ImagePart {
  type: 'image';
  data: string;
  mimeType: string;
}

export type ContentPart = TextPart | ImagePart;

export interface AIMessage {
  role: 'user' | 'model';
  parts: ContentPart[];
}

export interface GenerateOptions {
  temperature?: number;
  maxTokens?: number;
  systemInstruction?: string;
}

export interface AIResponse {
  text: string;
  finishReason?: string;
}

export interface StreamChunk {
  text: string;
  done: boolean;
}

export interface AIProviderConfig {
  apiKey: string;
  model: string;
}

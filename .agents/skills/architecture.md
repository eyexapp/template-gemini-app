---
name: architecture
type: knowledge
version: 1.0.0
agent: CodeActAgent
triggers:
  - architecture
  - gemini
  - ai
  - adapter
  - langchain
  - vanilla typescript
---

# Architecture — Gemini App (Vanilla TS + AI Adapters)

## Project Structure

```
src/
├── index.ts                    ← Entry point
├── adapters/                   ← AI Provider Adapters
│   ├── types.ts                ← Shared interface
│   ├── gemini-adapter.ts       ← Google Gemini
│   ├── openai-adapter.ts       ← OpenAI
│   └── langchain-adapter.ts    ← LangChain
├── core/
│   ├── chat.ts                 ← Chat orchestration
│   ├── prompt-builder.ts       ← Prompt templates
│   └── token-counter.ts        ← Token estimation
├── services/
│   ├── conversation.ts         ← Conversation management
│   └── storage.ts              ← LocalStorage persistence
├── ui/
│   ├── chat-view.ts            ← Chat UI (vanilla DOM)
│   ├── settings-view.ts        ← Settings panel
│   └── components/
│       ├── message-bubble.ts
│       └── typing-indicator.ts
├── config/
│   └── models.ts               ← Model configurations
└── types/
    └── index.ts
```

## Adapter Pattern

```typescript
// adapters/types.ts
export interface AIAdapter {
  readonly name: string;
  chat(messages: ChatMessage[], options?: ChatOptions): Promise<string>;
  stream(messages: ChatMessage[], options?: ChatOptions): AsyncIterable<string>;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
}
```

## Gemini Adapter

```typescript
// adapters/gemini-adapter.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { AIAdapter, ChatMessage, ChatOptions } from './types';

export class GeminiAdapter implements AIAdapter {
  readonly name = 'gemini';
  private client: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.client = new GoogleGenerativeAI(apiKey);
  }

  async chat(messages: ChatMessage[], options?: ChatOptions): Promise<string> {
    const model = this.client.getGenerativeModel({
      model: options?.model ?? 'gemini-2.0-flash',
    });
    const chat = model.startChat({
      history: messages.slice(0, -1).map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
    });
    const result = await chat.sendMessage(messages.at(-1)!.content);
    return result.response.text();
  }

  async *stream(messages: ChatMessage[], options?: ChatOptions): AsyncIterable<string> {
    const model = this.client.getGenerativeModel({
      model: options?.model ?? 'gemini-2.0-flash',
    });
    const chat = model.startChat({
      history: messages.slice(0, -1).map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
    });
    const result = await chat.sendMessageStream(messages.at(-1)!.content);
    for await (const chunk of result.stream) {
      yield chunk.text();
    }
  }
}
```

## Chat Orchestrator

```typescript
// core/chat.ts
import type { AIAdapter, ChatMessage } from '../adapters/types';

export class ChatOrchestrator {
  private adapter: AIAdapter;
  private history: ChatMessage[] = [];

  constructor(adapter: AIAdapter) {
    this.adapter = adapter;
  }

  setAdapter(adapter: AIAdapter) {
    this.adapter = adapter;
  }

  async send(userMessage: string): Promise<string> {
    this.history.push({ role: 'user', content: userMessage });
    const response = await this.adapter.chat(this.history);
    this.history.push({ role: 'assistant', content: response });
    return response;
  }

  async *sendStream(userMessage: string): AsyncIterable<string> {
    this.history.push({ role: 'user', content: userMessage });
    let full = '';
    for await (const chunk of this.adapter.stream(this.history)) {
      full += chunk;
      yield chunk;
    }
    this.history.push({ role: 'assistant', content: full });
  }
}
```

## Rules

- Vanilla TypeScript — no framework (no React, no Vue).
- Adapter pattern for AI providers (swap Gemini/OpenAI/LangChain).
- DOM manipulation via vanilla JS (createElement, querySelector).
- esbuild for bundling.
- API keys stored client-side (user provides their own).

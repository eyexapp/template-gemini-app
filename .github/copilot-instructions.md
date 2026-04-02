# Gemini App Template — Copilot Instructions

## Project Overview
A vanilla TypeScript + Vite template for building applications with Google's Gemini API. Uses an adapter pattern supporting both the direct `@google/generative-ai` SDK and LangChain (`@langchain/google-genai`).

## Architecture

### Layers (dependency direction: core → adapters → services → ui)
- **`src/core/`** — Types, interfaces, config, custom errors. No external dependencies.
- **`src/adapters/`** — AI provider implementations (`GeminiAdapter`, `LangChainAdapter`) behind `IAIProvider` interface. Factory in `index.ts`.
- **`src/services/`** — Business logic. `AIService` wraps providers with markdown rendering. `image-service` handles file→base64.
- **`src/ui/`** — DOM components (`PromptForm`, `OutputDisplay`) and `App` orchestrator.
- **`src/i18n/`** — Lightweight custom i18n (~25 lines). JSON locale files, dynamic import.

### Key Patterns
- **Adapter Pattern**: `IAIProvider` interface with `generate()` and `stream()` methods. Switch providers via `VITE_AI_PROVIDER` env var.
- **Streaming**: Both adapters support `AsyncGenerator<StreamChunk>`. `AIService.streamMarkdown()` renders incrementally.
- **No framework**: Vanilla TypeScript DOM manipulation. No React/Vue/Svelte.

## Tech Stack
- TypeScript 5.8 (strict), Vite 6, Tailwind CSS v4
- `@google/generative-ai` + `@langchain/google-genai` + `markdown-it`
- Vitest (jsdom), ESLint 9 (flat config), Prettier

## Commands
```bash
npm run dev          # Vite dev server
npm run build        # tsc --noEmit + vite build
npm run typecheck    # TypeScript check only
npm run test         # Vitest
npm run lint         # ESLint
npm run format       # Prettier
```

## Environment Variables
```
VITE_GEMINI_API_KEY  — Google AI API key (required)
VITE_GEMINI_MODEL    — Model name (default: gemini-2.5-flash)
VITE_AI_PROVIDER     — "gemini" | "langchain" (default: gemini)
```

## Conventions
- Path alias: `@/` → `src/`
- Tests in `__tests__/` mirroring `src/` structure
- Conventional commits enforced via commitlint
- i18n keys: dot-notation (`app.title`, `prompt.submit`)

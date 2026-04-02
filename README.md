# Gemini App Template

A production-ready vanilla TypeScript + Vite template for building applications with Google's Gemini API. Features an adapter pattern supporting both the direct SDK and LangChain, streaming responses with markdown rendering, and a lightweight custom i18n system.

## Features

- **Adapter Pattern** — Switch between `@google/generative-ai` (direct) and `@langchain/google-genai` (LangChain) via env var
- **Streaming** — Real-time AI response streaming with incremental markdown rendering
- **Multimodal** — Image + text input support with base64 conversion
- **TypeScript** — Strict mode, path aliases (`@/`), full type safety
- **Tailwind CSS v4** — Utility-first styling with dark mode support
- **i18n** — Zero-dependency, lightweight internationalization (EN/TR included)
- **Testing** — Vitest with jsdom, mocked adapters, 9 tests
- **DX** — ESLint 9 flat config, Prettier, Husky, lint-staged, commitlint

## Quick Start

```bash
# Clone and install
git clone <repo-url> my-gemini-app
cd my-gemini-app
npm install

# Configure environment
cp .env.example .env
# Edit .env and add your VITE_GEMINI_API_KEY

# Start development
npm run dev
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_GEMINI_API_KEY` | Google AI API key | *(required)* |
| `VITE_GEMINI_MODEL` | Gemini model name | `gemini-2.5-flash` |
| `VITE_AI_PROVIDER` | `gemini` or `langchain` | `gemini` |

> **Security Note**: This is a client-only template. API keys are exposed in the browser. For production, proxy requests through a backend server (e.g., Hono, Express).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check + production build |
| `npm run preview` | Preview production build |
| `npm run typecheck` | TypeScript type checking |
| `npm run test` | Run Vitest tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | ESLint check |
| `npm run format` | Prettier format |

## Architecture

```
src/
├── core/                    # Types, interfaces, config, errors
│   ├── types.ts             # AIMessage, AIResponse, StreamChunk, etc.
│   ├── ai-provider.interface.ts  # IAIProvider interface
│   ├── config.ts            # Environment config reader
│   └── errors.ts            # AIProviderError, ConfigError
├── adapters/                # AI provider implementations
│   ├── gemini-adapter.ts    # Direct @google/generative-ai SDK
│   ├── langchain-adapter.ts # LangChain wrapper
│   └── index.ts             # Factory: createAIProvider()
├── services/                # Business logic
│   ├── ai-service.ts        # High-level AI operations + markdown
│   └── image-service.ts     # File/URL → base64 conversion
├── i18n/                    # Internationalization
│   ├── index.ts             # t(), setLocale(), getLocale()
│   └── locales/             # JSON translation files
│       ├── en.json
│       └── tr.json
├── ui/                      # DOM components
│   ├── app.ts               # App orchestrator
│   └── components/
│       ├── prompt-form.ts   # Input form with image upload
│       └── output-display.ts # Markdown output renderer
├── index.css                # Tailwind CSS entry
└── main.ts                  # App entry point
```

### Adapter Pattern

The core architectural decision: both AI providers implement `IAIProvider`:

```typescript
interface IAIProvider {
  generate(messages: AIMessage[], options?: GenerateOptions): Promise<AIResponse>;
  stream(messages: AIMessage[], options?: GenerateOptions): AsyncGenerator<StreamChunk>;
}
```

Switch providers by setting `VITE_AI_PROVIDER=langchain` in `.env`.

### Adding a New Provider

1. Create `src/adapters/my-adapter.ts` implementing `IAIProvider`
2. Add to factory in `src/adapters/index.ts`
3. Extend `AIProviderType` in `src/core/types.ts`

## Adding a Language

1. Create `src/i18n/locales/<code>.json` (copy `en.json` as template)
2. Import will happen automatically via dynamic `import()`
3. Call `setLocale('code')` at runtime

## Tech Stack

| Category | Technology |
|----------|-----------|
| Language | TypeScript 5.8 (strict) |
| Build | Vite 6 |
| AI SDK | @google/generative-ai + @langchain/google-genai |
| Rendering | markdown-it |
| CSS | Tailwind CSS v4 |
| Testing | Vitest + jsdom |
| Linting | ESLint 9 (flat config) + Prettier |
| Git Hooks | Husky + lint-staged + commitlint |

## License

[MIT](LICENSE)

# AGENTS.md — Gemini App (Vanilla TS + Adapter Pattern)

## Project Identity

| Key | Value |
|-----|-------|
| Runtime | Node.js 20+ |
| Language | TypeScript 5.8 (strict) |
| Category | AI Application |
| Build | Vite 6 |
| AI SDK | `@google/generative-ai` + `@langchain/google-genai` |
| Styling | Tailwind CSS v4 |
| Testing | Vitest (jsdom) |
| Linting | ESLint 9 (flat config) + Prettier |

> **No framework** — Vanilla TypeScript DOM manipulation. No React/Vue/Svelte.

---

## Architecture — Adapter Pattern + Layered

```
src/
├── core/              ← TYPES: interfaces, config, custom errors (ZERO external deps)
│   ├── types.ts       ← IAIProvider, StreamChunk, Config
│   ├── config.ts      ← Env vars validated
│   └── errors.ts      ← Custom error classes
├── adapters/          ← AI PROVIDERS behind IAIProvider interface
│   ├── index.ts       ← Factory: createProvider(type)
│   ├── gemini.ts      ← GeminiAdapter (@google/generative-ai)
│   └── langchain.ts   ← LangChainAdapter (@langchain/google-genai)
├── services/          ← BUSINESS LOGIC
│   ├── ai-service.ts  ← Wraps providers + markdown rendering
│   └── image-service.ts ← File → base64 conversion
├── ui/                ← DOM COMPONENTS (vanilla TS)
│   ├── app.ts         ← Orchestrator
│   ├── prompt-form.ts ← PromptForm component
│   └── output-display.ts ← OutputDisplay component
├── i18n/              ← Lightweight i18n (~25 lines)
│   ├── index.ts       ← t() helper, dynamic import
│   └── locales/
│       ├── en.json
│       └── tr.json
└── main.ts            ← Entry point
```

### Layer Dependency Rules (STRICT)

| Layer | Can Import From | NEVER Imports |
|-------|----------------|---------------|
| `core/` | (none — foundational) | adapters/, services/, ui/ |
| `adapters/` | core/ | services/, ui/ |
| `services/` | core/, adapters/ | ui/ |
| `ui/` | core/, services/, i18n/ | adapters/ (use services) |
| `i18n/` | (self-contained) | Everything else |

---

## Adding New Code — Where Things Go

### New AI Provider Checklist
1. **Adapter**: `src/adapters/newprovider.ts` implementing `IAIProvider`
2. **Implement**: `generate()` and `stream()` (AsyncGenerator<StreamChunk>)
3. **Register**: Add to factory in `src/adapters/index.ts`
4. **Env var**: Provider selected via `VITE_AI_PROVIDER`
5. **Test**: `__tests__/adapters/newprovider.test.ts`

### IAIProvider Interface
```typescript
interface IAIProvider {
  generate(prompt: string, options?: GenerateOptions): Promise<string>;
  stream(prompt: string, options?: GenerateOptions): AsyncGenerator<StreamChunk>;
}

// ✅ Switch providers via env — zero code changes
// VITE_AI_PROVIDER=gemini | langchain
```

### UI Component Pattern (Vanilla TS)
```typescript
// No framework — direct DOM manipulation
export class PromptForm {
  private form: HTMLFormElement;

  constructor(container: HTMLElement, onSubmit: (prompt: string) => void) {
    this.form = document.createElement('form');
    container.appendChild(this.form);
    // Setup event listeners
  }

  destroy() {
    this.form.remove();
  }
}
```

---

## Design & Architecture Principles

### Adapter Pattern — Provider Independence
```typescript
// ✅ Business logic depends on interface, not implementation
const provider = createProvider(config.aiProvider); // "gemini" | "langchain"
const service = new AIService(provider);

// ❌ NEVER import provider directly in services/ui
import { GeminiAdapter } from '../adapters/gemini'; // Wrong!
```

### Streaming — AsyncGenerator
```typescript
// Both adapters support streaming via AsyncGenerator
const stream = service.streamMarkdown(prompt);
for await (const chunk of stream) {
  outputDisplay.appendChunk(chunk);
}
```

### Environment Variables
```bash
VITE_GEMINI_API_KEY   # Google AI API key (required)
VITE_GEMINI_MODEL     # Model name (default: gemini-2.5-flash)
VITE_AI_PROVIDER      # "gemini" | "langchain" (default: gemini)
```

---

## Error Handling

### Custom Error Hierarchy
- Core errors in `src/core/errors.ts`
- AI-specific errors catch SDK failures → wrap in typed errors
- UI shows user-friendly messages, logs detailed errors

### Streaming Error Recovery
```typescript
// ✅ Handle stream errors gracefully
try {
  for await (const chunk of provider.stream(prompt)) {
    display.append(chunk);
  }
} catch (error) {
  display.showError('Generation failed. Please try again.');
}
```

---

## Code Quality

### Naming Conventions
| Artifact | Convention | Example |
|----------|-----------|---------|
| Adapter | PascalCase | `GeminiAdapter` |
| Service | PascalCase | `AIService` |
| UI Component | PascalCase | `PromptForm` |
| Interface | `I` prefix | `IAIProvider` |
| i18n keys | dot-notation | `app.title`, `prompt.submit` |
| Files | kebab-case | `ai-service.ts` |

### Path Alias
```typescript
// ✅ @/ → src/
import type { IAIProvider } from '@/core/types';
import { AIService } from '@/services/ai-service';

// ❌ NEVER deep relative paths
import type { IAIProvider } from '../../core/types';
```

### TypeScript Strict
- `strict: true` — no `any`, no implicit types
- `type` imports: `import type { X } from '...'`
- All functions explicitly typed

---

## Testing Strategy

| Level | What | Where | Tool |
|-------|------|-------|------|
| Unit | Adapters, services, utils | `__tests__/` | Vitest (jsdom) |
| Integration | AI service + mock provider | `__tests__/` | Vitest |

### Mock AI Provider for Tests
```typescript
const mockProvider: IAIProvider = {
  generate: vi.fn().mockResolvedValue('Mock response'),
  async *stream() { yield { text: 'Mock', done: false }; yield { text: ' response', done: true }; },
};
```

---

## Security & Performance

### Security
- API key via `VITE_` env vars — never committed
- Input sanitization before rendering AI output as HTML
- markdown-it renders with safe defaults
- Never expose API key in client bundle for production (use proxy)

### Performance
- Streaming responses — don't wait for full generation
- Incremental DOM updates during stream
- Lazy-load markdown-it for rendering
- Vite tree-shaking — unused adapter code stripped

---

## Commands

| Action | Command |
|--------|---------|
| Dev | `npm run dev` |
| Build | `npm run build` |
| Type check | `npm run typecheck` |
| Test | `npm run test` |
| Lint | `npm run lint` |
| Format | `npm run format` |

---

## Prohibitions — NEVER Do These

1. **NEVER** import concrete adapters in services/UI — use `IAIProvider` interface
2. **NEVER** use React/Vue/Svelte — vanilla TypeScript DOM only
3. **NEVER** hardcode API keys — `VITE_` env vars always
4. **NEVER** use `any` type — strict TypeScript
5. **NEVER** skip streaming support when adding a provider
6. **NEVER** render raw AI output as HTML without sanitization
7. **NEVER** use relative imports across layer boundaries — `@/` alias
8. **NEVER** add `console.log` in production code
9. **NEVER** block UI during generation — always stream or async
10. **NEVER** skip i18n keys for user-visible strings

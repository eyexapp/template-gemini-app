---
name: version-control
type: knowledge
version: 1.0.0
agent: CodeActAgent
triggers:
  - git
  - commit
  - build
  - esbuild
  - deploy
---

# Version Control — Gemini App

## Commits

- `feat(adapters): add OpenAI adapter implementation`
- `fix(stream): handle interrupted SSE connections`
- `refactor(chat): extract prompt builder to core module`

## Build

```bash
# esbuild for fast bundling
npx esbuild src/index.ts --bundle --outfile=dist/app.js --format=esm --minify --sourcemap
```

## Dev Server

```bash
npx esbuild src/index.ts --bundle --outfile=dist/app.js --format=esm --servedir=public --watch
```

## .gitignore

```
node_modules/
dist/
.env
```

## Package Scripts

```json
{
  "scripts": {
    "dev": "esbuild src/index.ts --bundle --outfile=dist/app.js --servedir=public --watch",
    "build": "esbuild src/index.ts --bundle --outfile=dist/app.js --format=esm --minify",
    "test": "vitest",
    "typecheck": "tsc --noEmit"
  }
}
```

## Environment

```bash
# .env (user-provided API keys — stored in browser localStorage, not in code)
# No server-side — this is a pure client-side app
# API keys are entered by the user in the settings panel
```

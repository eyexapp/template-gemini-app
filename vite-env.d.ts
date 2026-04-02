/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string;
  readonly VITE_GEMINI_MODEL: string;
  readonly VITE_AI_PROVIDER: 'gemini' | 'langchain';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AI_API_TYPE: string
  readonly VITE_GEMINI_API_KEY: string
  // Add other env variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 
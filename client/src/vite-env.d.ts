/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Base URL of the deployed API (e.g. the Render service). Left unset in
  // local dev, where vite.config.ts proxies /api to localhost:4000 instead.
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

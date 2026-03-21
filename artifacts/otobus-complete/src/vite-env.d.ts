/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** API + Socket.IO server origin when frontend is hosted elsewhere (e.g. https://xxx.up.railway.app) */
  readonly VITE_API_ORIGIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PYTH_LAZER_AUTH_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

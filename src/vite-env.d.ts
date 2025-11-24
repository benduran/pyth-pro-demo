/* eslint-disable @typescript-eslint/consistent-type-definitions */
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_TOKEN_INFOWAY: string;
  readonly VITE_API_TOKEN_PRIME_API: string;
  readonly VITE_API_TOKEN_PYTH_LAZER: string;
  readonly VITE_API_TOKEN_TWELVE_DATA: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

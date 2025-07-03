/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_CLIENT_ID: string;
  // Adicione outras variáveis de ambiente aqui se precisar
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
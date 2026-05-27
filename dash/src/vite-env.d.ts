/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_SKIP_CAPTCHA: string
  readonly DEV: boolean
  readonly PROD: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
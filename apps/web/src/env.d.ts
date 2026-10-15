interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string
  readonly VITE_ENGINE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

/** The web app's version from package.json, set by Vite. */
declare const __APP_VERSION__: string

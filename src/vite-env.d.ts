/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITEST?: boolean;
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_ADMIN_PASSWORD?: string;
  readonly VITE_DEMO_PASSWORD?: string;
  readonly NEXT_PUBLIC_SUPABASE_URL?: string;
  readonly NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
  /** Yerel geliştirmede Vite → Vercel dev API (örn. http://127.0.0.1:3000) */
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_BANK_IBAN?: string;
  readonly VITE_BANK_ACCOUNT_NAME?: string;
  readonly VITE_ALLOW_SIMULATED_BALANCE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

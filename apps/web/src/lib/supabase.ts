import { createClient } from "@supabase/supabase-js"

import type { Database } from "@/lib/database.types"

const url = import.meta.env.VITE_SUPABASE_URL
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!url || !publishableKey) {
  throw new Error(
    "Supabase ist nicht konfiguriert. Im Projektordner `npm run env` ausführen und neu starten."
  )
}

export const supabase = createClient<Database>(url, publishableKey)

import { useEffect, useState } from "react"

import { supabase } from "@/lib/supabase"

/** The signed-in user's email, or null while it loads. */
export function useAccountEmail(): string | null {
  const [email, setEmail] = useState<string | null>(null)
  useEffect(() => {
    let active = true
    void supabase.auth.getSession().then(({ data }) => {
      if (active) setEmail(data.session?.user.email ?? null)
    })
    return () => {
      active = false
    }
  }, [])
  return email
}

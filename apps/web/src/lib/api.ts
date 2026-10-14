import { supabase } from "@/lib/supabase"

const ENGINE_URL = import.meta.env.VITE_ENGINE_URL ?? "http://127.0.0.1:8000"

export class EngineError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = "EngineError"
    this.status = status
  }
}

/** Calls the Python engine as the signed-in user. */
export async function engine<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const { data } = await supabase.auth.getSession()
  const headers = new Headers(init.headers)
  if (data.session) {
    headers.set("Authorization", `Bearer ${data.session.access_token}`)
  }

  const response = await fetch(`${ENGINE_URL}${path}`, { ...init, headers })
  if (!response.ok) {
    const detail: unknown = await response.json().then(
      (body) => body?.detail,
      () => undefined
    )
    throw new EngineError(
      response.status,
      typeof detail === "string" ? detail : response.statusText
    )
  }
  return (await response.json()) as T
}

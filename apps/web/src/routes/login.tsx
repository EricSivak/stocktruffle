import { useState } from "react"
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router"
import type { AuthError } from "@supabase/supabase-js"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"

export const Route = createFileRoute("/login")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession()
    if (data.session) throw redirect({ to: "/" })
  },
  component: Login,
})

function explain(error: AuthError): string {
  if (error.code === "invalid_credentials") {
    return "Email or password is wrong."
  }
  if (error.code === "weak_password") {
    return "The password needs at least 8 characters."
  }
  if (error.code === "user_already_exists") {
    return "This account already exists. Sign in with it."
  }
  // The single-user hook explains itself.
  if (error.message.includes("already has an account")) return error.message
  if (error.status === undefined || error.status === 0) {
    return "Supabase isn't reachable. Is `npm run dev` running?"
  }
  return "That didn't work. Please try again."
}

function Login() {
  const navigate = useNavigate()
  const [pending, setPending] = useState<"signin" | "signup" | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function submit(form: HTMLFormElement, mode: "signin" | "signup") {
    if (!form.reportValidity()) return
    const data = new FormData(form)
    const credentials = {
      email: String(data.get("email")),
      password: String(data.get("password")),
    }
    setPending(mode)
    setError(null)
    const { error } =
      mode === "signin"
        ? await supabase.auth.signInWithPassword(credentials)
        : await supabase.auth.signUp(credentials)
    setPending(null)
    if (error) setError(explain(error))
    else void navigate({ to: "/" })
  }

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-[20rem] flex-col px-6 pt-[22vh]">
      <h1 className="mb-7 text-center text-[1.75rem] font-medium tracking-tight">
        stocktruffle
      </h1>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          void submit(event.currentTarget, "signin")
        }}
      >
        <FieldGroup className="gap-4">
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              autoFocus
            />
          </Field>
          <Field data-invalid={error ? true : undefined}>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              minLength={8}
              required
              aria-invalid={error ? true : undefined}
            />
            {error && <FieldError>{error}</FieldError>}
          </Field>
          <Field className="gap-2">
            <Button type="submit" disabled={pending !== null}>
              {pending === "signin" ? "Signing in …" : "Sign in"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={pending !== null}
              onClick={(event) =>
                void submit(event.currentTarget.form!, "signup")
              }
            >
              {pending === "signup" ? "Creating account …" : "Create account"}
            </Button>
          </Field>
        </FieldGroup>
      </form>
      <p className="mt-6 text-center text-xs text-muted-foreground">
        This installation has exactly one account. It stays on your computer.
      </p>
    </main>
  )
}

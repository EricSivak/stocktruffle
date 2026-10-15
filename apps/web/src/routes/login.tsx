import { useEffect, useState } from "react"
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router"
import type { AuthError } from "@supabase/supabase-js"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import { cn } from "cn"

import veins from "@/assets/veins.svg"
import { Lockup } from "@/components/brand/logo"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
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

type Installation = { connected: boolean; hasAccount: boolean } | null

/**
 * Whether Supabase answers and whether the one account exists yet. Until the answer is in,
 * "Create account" stays hidden rather than flashing up.
 */
function useInstallation(): Installation {
  const [installation, setInstallation] = useState<Installation>(null)
  useEffect(() => {
    let active = true
    void supabase.rpc("installation_has_account").then(({ data, error }) => {
      if (!active) return
      setInstallation({ connected: !error, hasAccount: data === true })
    })
    return () => {
      active = false
    }
  }, [])
  return installation
}

function Login() {
  const navigate = useNavigate()
  const installation = useInstallation()
  const [pending, setPending] = useState<"signin" | "signup" | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

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
    <main className="grid min-h-svh grid-cols-[44%_1fr]">
      {/* The one place with decoration: veins of a cut truffle, always on the dark surface. */}
      <aside className="dark relative flex flex-col justify-between overflow-hidden bg-(--truffle-surface) px-14 py-14 text-foreground">
        <img
          src={veins}
          alt=""
          className="pointer-events-none absolute inset-0 size-full object-cover"
        />
        <Lockup size={52} className="relative" />
        <div className="relative">
          <p className="font-serif text-[32px] leading-[1.15] italic">
            The best finds lie
            <br />
            beneath the surface.
          </p>
          <p className="mt-3 text-[15px] text-muted-foreground">
            Find stocks, understand them, keep an eye on them.
          </p>
        </div>
      </aside>

      <section className="relative flex items-center justify-center px-8">
        <div className="w-full max-w-[420px] rounded-xl border bg-card px-10 py-11 shadow-(--shadow-sheet)">
          <h1 className="font-serif text-[30px] leading-tight">Welcome back</h1>
          <p className="mt-2 text-[15px] text-muted-foreground">
            Sign in to see your screens, tracking and signals.
          </p>

          <form
            className="mt-8"
            onSubmit={(event) => {
              event.preventDefault()
              void submit(event.currentTarget, "signin")
            }}
          >
            <FieldGroup className="gap-5">
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  autoFocus
                  className="h-11 text-[15px]"
                />
              </Field>
              <Field data-invalid={error ? true : undefined}>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <InputGroup className="h-11">
                  <InputGroupInput
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    minLength={8}
                    required
                    aria-invalid={error ? true : undefined}
                    className="text-[15px]"
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      size="icon-xs"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      aria-pressed={showPassword}
                      onClick={() => setShowPassword((shown) => !shown)}
                    >
                      {showPassword ? (
                        <EyeOffIcon strokeWidth={1.6} />
                      ) : (
                        <EyeIcon strokeWidth={1.6} />
                      )}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
                {error && <FieldError>{error}</FieldError>}
              </Field>
              <Button
                type="submit"
                disabled={pending !== null}
                className="h-11 w-full text-[15px]"
              >
                {pending === "signin" ? "Signing in …" : "Sign in"}
              </Button>
              {installation && !installation.hasAccount && (
                <Button
                  type="button"
                  variant="link"
                  disabled={pending !== null}
                  className="self-center"
                  onClick={(event) =>
                    void submit(event.currentTarget.form!, "signup")
                  }
                >
                  {pending === "signup"
                    ? "Creating account …"
                    : "Create account"}
                </Button>
              )}
            </FieldGroup>
          </form>

          <p className="mt-8 border-t pt-6 text-center text-xs text-muted-foreground">
            This installation has exactly one account. It stays on your
            computer.
          </p>
        </div>

        {installation && (
          <p className="absolute right-8 bottom-6 flex items-center gap-2 text-xs text-muted-foreground">
            <span
              aria-hidden="true"
              className={cn(
                "size-1.5 rounded-full",
                installation.connected ? "bg-gain" : "bg-inactive"
              )}
            />
            {installation.connected ? "Connected locally" : "Not connected"}
          </p>
        )}
      </section>
    </main>
  )
}

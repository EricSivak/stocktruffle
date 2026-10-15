import { createFileRoute } from "@tanstack/react-router"

import { PageHeader } from "@/components/page-header"
import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { RulesEditor } from "@/features/settings/rules-editor"
import { useAccountEmail } from "@/lib/account"
import { supabase } from "@/lib/supabase"

export const Route = createFileRoute("/_app/settings")({
  component: Settings,
})

const THEMES = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
] as const

/** A settings group: gray label on the left, content on the right, a hairline above. */
function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="grid grid-cols-[160px_1fr] gap-x-8 border-t py-6">
      <h2 className="text-muted-foreground">{title}</h2>
      <div>{children}</div>
    </section>
  )
}

function Settings() {
  const { theme, setTheme } = useTheme()
  const email = useAccountEmail()

  return (
    <div className="mx-auto flex max-w-[720px] flex-col px-8 pt-8 pb-16">
      <PageHeader title="Settings" />

      <div className="mt-8">
        <Section title="Appearance">
          <RadioGroup
            value={theme}
            onValueChange={(next) => setTheme(next as typeof theme)}
            className="flex gap-6"
          >
            {THEMES.map(({ value, label }) => (
              <label key={value} className="flex items-center gap-2">
                <RadioGroupItem value={value} />
                {label}
              </label>
            ))}
          </RadioGroup>
        </Section>

        <Section title="My rules">
          <RulesEditor />
        </Section>

        <Section title="Account">
          <div className="flex items-center gap-6">
            <span>{email ?? "–"}</span>
            <Button
              variant="plain"
              className="ml-auto"
              onClick={() => void supabase.auth.signOut()}
            >
              Sign out
            </Button>
          </div>
        </Section>

        <Section title="Usage">
          <p className="text-muted-foreground">
            Appears with the agent in phase 3.
          </p>
        </Section>

        {/* The chart library's licence asks for a visible credit with a link. */}
        <Section title="About">
          <div className="flex flex-col gap-2 text-muted-foreground">
            <p>
              <span className="text-foreground">stocktruffle</span> · version{" "}
              {__APP_VERSION__}
            </p>
            <p>
              Price charts: TradingView Lightweight Charts™, Copyright (c) 2025
              TradingView, Inc.,{" "}
              <a
                href="https://www.tradingview.com/"
                target="_blank"
                rel="noreferrer"
                className="text-foreground underline underline-offset-3"
              >
                tradingview.com
              </a>
            </p>
            <p>
              Market data from Yahoo Finance (yfinance), for personal use only.
            </p>
          </div>
        </Section>
      </div>
    </div>
  )
}

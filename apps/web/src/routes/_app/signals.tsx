import { useMemo } from "react"
import { createFileRoute } from "@tanstack/react-router"

import { PageHeader } from "@/components/page-header"
import { useAgentContext } from "@/features/agent/agent-panel-context"
import { NewSignalForm } from "@/features/signals/new-signal-form"
import { SignalsTable } from "@/features/signals/signals-table"
import { companyBySymbol, type Company } from "@/prototype/fixtures/companies"
import { allSignals, useTracking } from "@/prototype/tracking-store"

export const Route = createFileRoute("/_app/signals")({
  // ?state=empty shows the empty design; only for review in development.
  validateSearch: (search: Record<string, unknown>): { state?: "empty" } =>
    import.meta.env.DEV && search.state === "empty" ? { state: "empty" } : {},
  component: SignalsPage,
})

const AGENT_CONTEXT = {
  label: "sees your signals",
  thread: [],
  placeholder: "Ask about your signals",
}

function SignalsPage() {
  const { state } = Route.useSearch()
  const tracked = useTracking()
  useAgentContext(AGENT_CONTEXT)

  const empty = state === "empty"
  const rows = useMemo(
    () => (empty ? [] : allSignals(tracked)),
    [tracked, empty]
  )
  const stocks = useMemo(
    () =>
      (empty ? [] : tracked.active).flatMap((stock): Company[] => {
        const company = companyBySymbol(stock.symbol)
        return company ? [company] : []
      }),
    [tracked.active, empty]
  )

  return (
    <div className="mx-auto flex max-w-6xl flex-col px-8 pt-8 pb-16">
      <PageHeader
        title="Signals"
        meta={`${rows.length} ${rows.length === 1 ? "signal" : "signals"} · none active`}
      />
      <p className="mt-2 text-muted-foreground">
        Signals are saved but not checked yet. Checking arrives in a later
        phase.
      </p>

      <div className="mt-6">
        <NewSignalForm stocks={stocks} />
      </div>

      <div className="mt-4">
        {rows.length ? (
          <SignalsTable rows={rows} />
        ) : (
          <div className="rounded-lg border border-input bg-card px-6 py-14 text-center text-muted-foreground">
            No signals yet. Describe above, in your own words, when a stock
            becomes interesting.
          </div>
        )}
      </div>
    </div>
  )
}

import { useMemo } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"

import { PageHeader } from "@/components/page-header"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAgentContext } from "@/features/agent/agent-panel-context"
import { ArchiveTable } from "@/features/tracking/archive-table"
import type { TrackedRow } from "@/features/tracking/columns"
import { TrackingTable } from "@/features/tracking/tracking-table"
import { companyBySymbol } from "@/prototype/fixtures/companies"
import { useTracking } from "@/prototype/tracking-store"

type View = "active" | "archive"

export const Route = createFileRoute("/_app/tracking")({
  // ?state=empty shows the empty designs; only for review in development.
  validateSearch: (
    search: Record<string, unknown>
  ): { view?: "archive"; state?: "empty" } => ({
    ...(search.view === "archive" && { view: "archive" as const }),
    ...(import.meta.env.DEV &&
      search.state === "empty" && { state: "empty" as const }),
  }),
  component: TrackingPage,
})

const AGENT_CONTEXT = {
  label: "sees your tracking",
  thread: [],
  placeholder: "Ask about your tracking",
}

const count = (n: number, one: string, many: string) =>
  `${n} ${n === 1 ? one : many}`

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-input bg-card px-6 py-14 text-center text-muted-foreground">
      {children}
    </div>
  )
}

function TrackingPage() {
  const search = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const tracked = useTracking()
  useAgentContext(AGENT_CONTEXT)

  const view: View = search.view === "archive" ? "archive" : "active"
  const empty = search.state === "empty"
  const rows = useMemo<TrackedRow[]>(
    () =>
      (empty ? [] : tracked.active).flatMap((stock) => {
        const company = companyBySymbol(stock.symbol)
        if (!company) return []
        return [
          {
            symbol: stock.symbol,
            company,
            stock,
            name: company.name,
            price: company.price,
            since: company.price / stock.trackedPrice - 1,
            trackedAt: stock.trackedAt,
            signals: stock.signals.length,
          },
        ]
      }),
    [tracked.active, empty]
  )
  const archived = empty ? [] : tracked.archived
  const signals = rows.reduce((sum, row) => sum + row.signals, 0)

  return (
    <div className="mx-auto flex max-w-6xl flex-col px-8 pt-8 pb-16">
      <PageHeader
        title="Tracking"
        meta={`${count(rows.length, "stock", "stocks")} · ${count(signals, "signal", "signals")}`}
        actions={
          // No "Agent" button here: next to the view switch it would read as a third view.
          // Ctrl J and the command palette open the agent.
          <Tabs
            value={view}
            onValueChange={(next) =>
              void navigate({
                search: (current) => ({
                  ...current,
                  view: next === "archive" ? "archive" : undefined,
                }),
              })
            }
          >
            <TabsList variant="line">
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="archive">Archive</TabsTrigger>
            </TabsList>
          </Tabs>
        }
      />

      <div className="mt-6">
        {view === "active" ? (
          rows.length ? (
            <TrackingTable rows={rows} />
          ) : (
            <Empty>
              Nothing tracked yet. Press T in a screen or on a stock page.
            </Empty>
          )
        ) : archived.length ? (
          <ArchiveTable stocks={archived} />
        ) : (
          <Empty>Nothing archived yet.</Empty>
        )}
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Signals are saved but not checked yet.
      </p>
    </div>
  )
}

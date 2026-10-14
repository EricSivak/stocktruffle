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

type View = "aktiv" | "archiv"

export const Route = createFileRoute("/_app/tracking")({
  // ?zustand=leer shows the empty designs; only for review in development.
  validateSearch: (
    search: Record<string, unknown>
  ): { ansicht?: "archiv"; zustand?: "leer" } => ({
    ...(search.ansicht === "archiv" && { ansicht: "archiv" as const }),
    ...(import.meta.env.DEV &&
      search.zustand === "leer" && { zustand: "leer" as const }),
  }),
  component: TrackingPage,
})

const AGENT_CONTEXT = {
  label: "sieht dein Tracking",
  thread: [],
  placeholder: "Frag zu deinem Tracking",
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
  const { ansicht, zustand } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const state = useTracking()
  useAgentContext(AGENT_CONTEXT)

  const view: View = ansicht === "archiv" ? "archiv" : "aktiv"
  const empty = zustand === "leer"
  const rows = useMemo<TrackedRow[]>(
    () =>
      (empty ? [] : state.active).flatMap((stock) => {
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
    [state.active, empty]
  )
  const archived = empty ? [] : state.archived
  const signals = rows.reduce((sum, row) => sum + row.signals, 0)

  return (
    <div className="mx-auto flex max-w-6xl flex-col px-8 pt-8 pb-16">
      <PageHeader
        title="Tracking"
        meta={`${count(rows.length, "Titel", "Titel")} · ${count(signals, "Signal", "Signale")}`}
        actions={
          // No "Agent" button here: next to the view switch it would read as a third view.
          // Ctrl J and the command palette open the agent.
          <Tabs
            value={view}
            onValueChange={(next) =>
              void navigate({
                search: (current) => ({
                  ...current,
                  ansicht: next === "archiv" ? "archiv" : undefined,
                }),
              })
            }
          >
            <TabsList variant="line">
              <TabsTrigger value="aktiv">Aktiv</TabsTrigger>
              <TabsTrigger value="archiv">Archiv</TabsTrigger>
            </TabsList>
          </Tabs>
        }
      />

      <div className="mt-6">
        {view === "aktiv" ? (
          rows.length ? (
            <TrackingTable rows={rows} />
          ) : (
            <Empty>
              Noch nichts getrackt. Drück T in einem Screen oder auf einer
              Aktienseite.
            </Empty>
          )
        ) : archived.length ? (
          <ArchiveTable stocks={archived} />
        ) : (
          <Empty>Noch nichts archiviert.</Empty>
        )}
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Signale werden gespeichert, aber noch nicht geprüft.
      </p>
    </div>
  )
}

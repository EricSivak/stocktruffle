import { useMemo, useState } from "react"
import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router"
import type { ColumnVisibilityState, SortingState } from "@tanstack/react-table"
import { toast } from "sonner"

import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  useAgentContext,
  useAgentPanel,
} from "@/features/agent/agent-panel-context"
import { SearchField } from "@/features/omnibox/search-field"
import { columns, CSV_COLUMNS } from "@/features/screen/columns"
import { downloadCsv, toCsv } from "@/features/screen/export-csv"
import { FilterTokens } from "@/features/screen/filter-tokens"
import { ResultsTable, TableSkeleton } from "@/features/screen/results-table"
import { summarize } from "@/features/screen/summary"
import { TrackDialog } from "@/features/screen/track-dialog"
import { formatCompact, formatNumber, formatPercent } from "@/lib/format"
import { screenThread } from "@/prototype/fixtures/agent"
import type { Company } from "@/prototype/fixtures/companies"
import { rules as initialRules, screenById } from "@/prototype/fixtures/screens"

type ScreenState = "laden" | "leer" | "fehler" | "veraltet"
const STATES: ScreenState[] = ["laden", "leer", "fehler", "veraltet"]

export const Route = createFileRoute("/_app/screens/$screenId")({
  // ?zustand=… shows the loading, empty, error and stale designs; only for review in development.
  validateSearch: (
    search: Record<string, unknown>
  ): { zustand?: ScreenState } => {
    const state = search.zustand
    return import.meta.env.DEV && STATES.includes(state as ScreenState)
      ? { zustand: state as ScreenState }
      : {}
  },
  loader: ({ params }) => {
    const screen = screenById(params.screenId)
    if (!screen) throw notFound()
    return screen
  },
  component: ScreenView,
})

const AGENT_CONTEXT = { label: "sieht diesen Screen", thread: screenThread }
const HIDEABLE = columns.filter((column) => column.id !== "name")

function MetaLine({ rows, stale }: { rows: Company[]; stale: boolean }) {
  const summary = summarize(rows)
  return (
    <p className="text-xs text-muted-foreground">
      {stale && (
        <>
          Stand gestern, 17:35 ·{" "}
          <button
            type="button"
            className="text-foreground underline underline-offset-3"
          >
            Aktualisieren
          </button>
          {" · "}
        </>
      )}
      {summary.count} Treffer · Ø KGV {formatNumber(summary.averagePe, 1)} · Ø
      Umsatzwachstum{" "}
      <span className="text-gain">
        {formatPercent(summary.averageRevenueGrowth, { signed: true })}
      </span>{" "}
      · Median Marktkap. {formatCompact(summary.medianMarketCap, "EUR")}
    </p>
  )
}

function Message({
  children,
  action,
}: {
  children: React.ReactNode
  action: React.ReactNode
}) {
  return (
    <div className="rounded-lg border border-input bg-card px-6 py-14 text-center">
      <p className="mx-auto max-w-md">{children}</p>
      <div className="mt-3">{action}</div>
    </div>
  )
}

function ScreenView() {
  const screen = Route.useLoaderData()
  const { zustand } = Route.useSearch()
  const navigate = useNavigate()
  const agent = useAgentPanel()
  useAgentContext(AGENT_CONTEXT)

  const [tokens, setTokens] = useState(screen.filters)
  const [rules, setRules] = useState(initialRules)
  const [rerunning, setRerunning] = useState(false)
  const [sorting, setSorting] = useState<SortingState>([
    { id: "revenueGrowth", desc: true },
  ])
  const [columnVisibility, setColumnVisibility] =
    useState<ColumnVisibilityState>({})
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [showDismissed, setShowDismissed] = useState(false)
  const [activeSymbol, setActiveSymbol] = useState<string | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [tracking, setTracking] = useState<Company | null>(null)

  const rows = useMemo(
    () =>
      showDismissed
        ? screen.rows
        : screen.rows.filter((row) => !dismissed.has(row.symbol)),
    [screen.rows, dismissed, showDismissed]
  )
  const counted = useMemo(
    () => screen.rows.filter((row) => !dismissed.has(row.symbol)),
    [screen.rows, dismissed]
  )

  const dismiss = (company: Company) => {
    setDismissed((current) => new Set(current).add(company.symbol))
    setPreviewOpen(false)
    toast(`${company.symbol} verworfen`, {
      description: "Taucht in diesem Screen nicht wieder auf.",
      action: {
        label: "Rückgängig",
        onClick: () =>
          setDismissed((current) => {
            const next = new Set(current)
            next.delete(company.symbol)
            return next
          }),
      },
    })
  }
  const open = (company: Company) =>
    void navigate({ to: "/aktie/$symbol", params: { symbol: company.symbol } })

  const loading = zustand === "laden" || rerunning
  const empty = zustand === "leer"
  const failed = zustand === "fehler"

  return (
    <div className="mx-auto flex max-w-6xl flex-col px-8 pt-8 pb-16">
      <PageHeader
        title={screen.name}
        meta={`Gespeicherter Screen · ${screen.updatedAt}`}
        actions={
          <>
            {!agent.open && (
              <Button variant="plain" onClick={() => agent.setOpen(true)}>
                Agent
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="plain" />}>
                Spalten
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {HIDEABLE.map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={columnVisibility[column.id ?? ""] !== false}
                    onCheckedChange={(checked) =>
                      setColumnVisibility((current) => ({
                        ...current,
                        [column.id ?? ""]: checked,
                      }))
                    }
                  >
                    {String(column.header)}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="plain"
              onClick={() =>
                downloadCsv(`${screen.id}.csv`, toCsv(counted, CSV_COLUMNS))
              }
            >
              Exportieren
            </Button>
            <Button onClick={() => toast("Screen gespeichert")}>
              Speichern
            </Button>
          </>
        }
      />

      <SearchField
        defaultValue={screen.query}
        className="mt-5"
        onSubmit={() => {
          // Prototype: the same screen runs again. Phase 1 translates the new text.
          setRerunning(true)
          window.setTimeout(() => setRerunning(false), 700)
        }}
      />

      <div className="mt-2.5">
        <FilterTokens
          tokens={tokens}
          onTokensChange={setTokens}
          rules={rules}
          onToggleRule={(id) =>
            setRules((current) =>
              current.map((rule) =>
                rule.id === id ? { ...rule, active: !rule.active } : rule
              )
            )
          }
        />
      </div>

      <div className="mt-5 mb-2.5">
        <MetaLine
          rows={empty || failed ? [] : counted}
          stale={zustand === "veraltet"}
        />
      </div>

      {loading ? (
        <TableSkeleton />
      ) : failed ? (
        <Message action={<Button variant="plain">Erneut versuchen</Button>}>
          Yahoo antwortet gerade nicht. Der letzte Stand von {screen.updatedAt}{" "}
          ist gespeichert.
        </Message>
      ) : empty ? (
        <Message action={<Button variant="plain">KGV-Filter entfernen</Button>}>
          Kein Titel erfüllt alle Filter. Am engsten ist KGV &lt; 15; ohne
          diesen Filter wären es 34 Treffer.
        </Message>
      ) : (
        <ResultsTable
          rows={rows}
          dismissed={dismissed}
          sorting={sorting}
          onSortingChange={setSorting}
          columnVisibility={columnVisibility}
          onColumnVisibilityChange={setColumnVisibility}
          activeSymbol={activeSymbol}
          onActiveChange={(symbol) => {
            if (symbol !== activeSymbol) setPreviewOpen(false)
            setActiveSymbol(symbol)
          }}
          previewOpen={previewOpen}
          onPreviewChange={setPreviewOpen}
          onOpen={open}
          onTrack={setTracking}
          onDismiss={dismiss}
        />
      )}

      {dismissed.size > 0 && !loading && (
        <p className="mt-3 text-xs text-muted-foreground">
          {dismissed.size} verworfen ·{" "}
          <button
            type="button"
            className="underline underline-offset-3 hover:text-foreground"
            onClick={() => setShowDismissed((value) => !value)}
          >
            {showDismissed ? "ausblenden" : "anzeigen"}
          </button>
        </p>
      )}

      <TrackDialog company={tracking} onClose={() => setTracking(null)} />
    </div>
  )
}

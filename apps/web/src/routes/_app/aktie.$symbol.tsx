import { useMemo, useState } from "react"
import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router"
import { cn } from "cn"

import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import {
  useAgentContext,
  useAgentPanel,
} from "@/features/agent/agent-panel-context"
import { TrackDialog } from "@/features/screen/track-dialog"
import { SignalList } from "@/features/signals/signal-list"
import { Financials } from "@/features/stock/financials"
import { KeyFigures } from "@/features/stock/key-figures"
import { NewsList } from "@/features/stock/news-list"
import { PriceChart } from "@/features/stock/price-chart"
import { Thesis } from "@/features/tracking/thesis"
import { formatPercent, formatPrice } from "@/lib/format"
import { useHotkey } from "@/lib/keys"
import { AS_OF_TIME } from "@/prototype/fixtures/calendar"
import { companyBySymbol, type Company } from "@/prototype/fixtures/companies"
import { stockDetails } from "@/prototype/fixtures/stock"
import { signalSuggestions } from "@/prototype/fixtures/tracking"
import { tracking, useTracking } from "@/prototype/tracking-store"

type StockState = "chart-laden" | "keine-nachrichten"
const STATES: StockState[] = ["chart-laden", "keine-nachrichten"]

export const Route = createFileRoute("/_app/aktie/$symbol")({
  // ?zustand=… shows the loading chart and the empty news; only for review in development.
  validateSearch: (
    search: Record<string, unknown>
  ): { zustand?: StockState } =>
    import.meta.env.DEV && STATES.includes(search.zustand as StockState)
      ? { zustand: search.zustand as StockState }
      : {},
  loader: ({ params }) => {
    const company = companyBySymbol(params.symbol)
    if (!company) throw notFound()
    return company
  },
  component: StockRoute,
})

// Another stock starts with a fresh chart period and agent.
function StockRoute() {
  const company = Route.useLoaderData()
  return <StockPage key={company.symbol} company={company} />
}

/** "−2,60 € (−5,8 %)": today's move in money and percent, coloured by direction. */
function DayChange({ company }: { company: Company }) {
  const amount = company.price - company.price / (1 + company.dayChange)
  const sign = amount > 0 ? "+" : ""
  return (
    <span
      className={cn(
        "text-[15px] tabular-nums",
        company.dayChange > 0 && "text-gain",
        company.dayChange < 0 && "text-loss",
        company.dayChange === 0 && "text-muted-foreground"
      )}
    >
      {sign}
      {formatPrice(amount, company.currency)} (
      {formatPercent(company.dayChange, { signed: true })})
    </span>
  )
}

function StockPage({ company }: { company: Company }) {
  const { zustand } = Route.useSearch()
  const navigate = useNavigate()
  const agent = useAgentPanel()
  const details = stockDetails(company)
  const tracked = useTracking().active.find(
    (stock) => stock.symbol === company.symbol
  )
  const [askedWhy, setAskedWhy] = useState(false)
  const [trackOpen, setTrackOpen] = useState(false)

  const agentContext = useMemo(
    () => ({
      label: `sieht ${company.name}`,
      thread: askedWhy ? details.why : [],
      placeholder: `Frag zu ${company.name}`,
    }),
    [company.name, askedWhy, details.why]
  )
  useAgentContext(agentContext)
  useHotkey("t", () => setTrackOpen(true), !tracked)

  const events = useMemo(
    () => [
      ...details.events,
      ...(tracked ? [{ date: tracked.trackedAt, label: "Getrackt" }] : []),
    ],
    [details.events, tracked]
  )

  return (
    <div className="mx-auto flex max-w-6xl flex-col px-8 pt-8 pb-16">
      <PageHeader
        title={company.name}
        meta={[
          company.symbol,
          company.exchange,
          company.sector,
          company.country,
        ].join(" · ")}
        actions={
          <>
            <Button
              variant="plain"
              onClick={() => {
                setAskedWhy(true)
                agent.setOpen(true)
              }}
            >
              Warum bewegt sich das?
            </Button>
            {tracked ? (
              <Button
                variant="plain"
                onClick={() => void navigate({ to: "/tracking" })}
              >
                Im Tracking
              </Button>
            ) : (
              <Button onClick={() => setTrackOpen(true)}>Tracken</Button>
            )}
          </>
        }
      />

      <p className="mt-2 flex items-baseline gap-4">
        <span className="text-[30px] leading-none font-medium tabular-nums">
          {formatPrice(company.price, company.currency)}
        </span>
        <DayChange company={company} />
        <span className="text-xs text-muted-foreground">
          heute, {AS_OF_TIME}
        </span>
      </p>

      <div className="mt-6">
        <PriceChart
          company={company}
          events={events}
          loading={zustand === "chart-laden"}
        />
      </div>

      <div className="mt-10 grid grid-cols-2 gap-x-16 gap-y-12">
        <KeyFigures company={company} details={details} />
        <Financials details={details} />

        <section aria-labelledby="thesis">
          <h2 id="thesis" className="border-b pb-2 text-[15px] font-medium">
            These
          </h2>
          {tracked ? (
            <div className="mt-3 flex flex-col gap-6">
              <Thesis
                value={tracked.thesis}
                onChange={(thesis) =>
                  tracking.setThesis(company.symbol, thesis)
                }
              />
              <SignalList
                signals={tracked.signals}
                suggestions={signalSuggestions(company.symbol)}
                onAdd={(text) => tracking.addSignal(company.symbol, text)}
              />
            </div>
          ) : (
            <p className="py-3 text-muted-foreground">Noch nicht getrackt.</p>
          )}
        </section>
        <NewsList items={zustand === "keine-nachrichten" ? [] : details.news} />
      </div>

      <TrackDialog
        company={trackOpen ? company : null}
        onClose={() => setTrackOpen(false)}
      />
    </div>
  )
}

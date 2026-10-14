import { Link } from "@tanstack/react-router"

import { SignalList } from "@/features/signals/signal-list"
import { Thesis } from "@/features/tracking/thesis"
import { formatDate } from "@/lib/format"
import {
  signalSuggestions,
  type Origin,
  type TrackedStock,
} from "@/prototype/fixtures/tracking"
import { tracking } from "@/prototype/tracking-store"

function OriginLine({ origin }: { origin: Origin | null }) {
  if (!origin)
    return <span className="text-muted-foreground">Direkt getrackt</span>
  const text = `${origin.kind === "research" ? "Recherche" : "Screen"} „${origin.title}“, ${formatDate(origin.date, { year: true })}`
  if (origin.to && "screenId" in origin.to) {
    return (
      <Link
        to="/screens/$screenId"
        params={{ screenId: origin.to.screenId }}
        className="text-muted-foreground underline decoration-input underline-offset-4 hover:text-foreground"
      >
        {text}
      </Link>
    )
  }
  if (origin.to && "researchId" in origin.to) {
    return (
      <Link
        to="/recherche/$id"
        params={{ id: origin.to.researchId }}
        className="text-muted-foreground underline decoration-input underline-offset-4 hover:text-foreground"
      >
        {text}
      </Link>
    )
  }
  return <span className="text-muted-foreground">{text}</span>
}

/** The opened row: thesis, where the idea came from, and the signals. */
export function TrackingDetails({ stock }: { stock: TrackedStock }) {
  return (
    <dl className="grid grid-cols-[96px_1fr] items-baseline gap-x-8 gap-y-5 py-5 pr-2 whitespace-normal">
      <dt className="text-muted-foreground">These</dt>
      <dd>
        <Thesis
          value={stock.thesis}
          onChange={(thesis) => tracking.setThesis(stock.symbol, thesis)}
        />
      </dd>
      <dt className="text-muted-foreground">Herkunft</dt>
      <dd>
        <OriginLine origin={stock.origin} />
      </dd>
      <dt className="text-muted-foreground">Signale</dt>
      <dd>
        <SignalList
          signals={stock.signals}
          suggestions={signalSuggestions(stock.symbol)}
          onAdd={(text) => tracking.addSignal(stock.symbol, text)}
        />
      </dd>
    </dl>
  )
}

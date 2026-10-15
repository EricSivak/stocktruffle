import { useState } from "react"
import { Link } from "@tanstack/react-router"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RhythmSelect } from "@/features/signals/rhythm-select"
import type { Company } from "@/prototype/fixtures/companies"
import type { Rhythm } from "@/prototype/fixtures/tracking"
import { tracking } from "@/prototype/tracking-store"

/** One line to write a signal in your own words and pin it to a tracked stock. */
export function NewSignalForm({ stocks }: { stocks: Company[] }) {
  const [text, setText] = useState("")
  const [symbol, setSymbol] = useState<string | null>(null)
  const [rhythm, setRhythm] = useState<Rhythm>("daily")

  if (stocks.length === 0) {
    return (
      <p className="text-muted-foreground">
        Track a stock first.{" "}
        <Link
          to="/tracking"
          className="text-foreground underline underline-offset-4"
        >
          Go to tracking
        </Link>
      </p>
    )
  }

  const target = symbol ?? stocks[0].symbol
  const items = Object.fromEntries(
    stocks.map((stock) => [stock.symbol, `${stock.name} · ${stock.symbol}`])
  )

  return (
    <form
      className="flex items-center gap-3"
      onSubmit={(event) => {
        event.preventDefault()
        if (!text.trim()) return
        tracking.addSignal(target, text.trim(), rhythm)
        setText("")
        toast("Signal saved. It isn't checked yet.")
      }}
    >
      <Input
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Interesting when …"
        aria-label="New signal"
        className="flex-1"
      />
      <Select
        items={items}
        value={target}
        onValueChange={(next) => next && setSymbol(next)}
      >
        <SelectTrigger aria-label="Stock" className="w-60">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {stocks.map((stock) => (
            <SelectItem key={stock.symbol} value={stock.symbol}>
              {stock.name}
              <span className="text-xs text-muted-foreground">
                {stock.symbol}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <RhythmSelect value={rhythm} onChange={setRhythm} className="w-40" />
      <Button type="submit" variant="plain">
        Add
      </Button>
    </form>
  )
}

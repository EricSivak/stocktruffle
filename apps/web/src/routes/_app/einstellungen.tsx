import { createFileRoute } from "@tanstack/react-router"

import { ComingSoon } from "@/components/coming-soon"

export const Route = createFileRoute("/_app/einstellungen")({
  component: Settings,
})

// The chart library's licence asks for a visible credit with a link; it moves into "Über"
// when this page is built.
function Settings() {
  return (
    <ComingSoon title="Einstellungen" step={9}>
      <p className="mt-10 border-t pt-4 text-xs text-muted-foreground">
        Kurs-Charts: TradingView Lightweight Charts™, Copyright (c) 2025
        TradingView, Inc.,{" "}
        <a
          href="https://www.tradingview.com/"
          target="_blank"
          rel="noreferrer"
          className="text-foreground underline underline-offset-3"
        >
          tradingview.com
        </a>
        . Kursdaten über Yahoo Finance (yfinance), nur für privaten Gebrauch.
      </p>
    </ComingSoon>
  )
}

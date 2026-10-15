import { createFileRoute } from "@tanstack/react-router"

import { ComingSoon } from "@/components/coming-soon"

export const Route = createFileRoute("/_app/settings")({
  component: Settings,
})

// The chart library's licence asks for a visible credit with a link; it moves into "About"
// when this page is built.
function Settings() {
  return (
    <ComingSoon title="Settings" step={9}>
      <p className="mt-10 border-t pt-4 text-xs text-muted-foreground">
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
        . Market data from Yahoo Finance (yfinance), for personal use only.
      </p>
    </ComingSoon>
  )
}

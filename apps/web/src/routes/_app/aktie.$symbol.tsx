import { createFileRoute } from "@tanstack/react-router"

import { ComingSoon } from "@/components/coming-soon"
import { companyBySymbol } from "@/prototype/fixtures/companies"

export const Route = createFileRoute("/_app/aktie/$symbol")({
  component: Stock,
})

function Stock() {
  const { symbol } = Route.useParams()
  return <ComingSoon title={companyBySymbol(symbol)?.name ?? symbol} step={5} />
}

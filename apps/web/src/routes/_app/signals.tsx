import { createFileRoute } from "@tanstack/react-router"

import { ComingSoon } from "@/components/coming-soon"

export const Route = createFileRoute("/_app/signals")({
  component: () => <ComingSoon title="Signals" step={7} />,
})

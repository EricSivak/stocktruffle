import { createFileRoute } from "@tanstack/react-router"

import { ComingSoon } from "@/components/coming-soon"

export const Route = createFileRoute("/_app/signale")({
  component: () => <ComingSoon title="Signale" step={7} />,
})

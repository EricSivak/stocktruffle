import { createFileRoute } from "@tanstack/react-router"

import { ComingSoon } from "@/components/coming-soon"

export const Route = createFileRoute("/_app/tracking")({
  component: () => <ComingSoon title="Tracking" step={4} />,
})

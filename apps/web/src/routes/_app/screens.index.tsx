import { createFileRoute } from "@tanstack/react-router"

import { ComingSoon } from "@/components/coming-soon"

export const Route = createFileRoute("/_app/screens/")({
  component: () => <ComingSoon title="Screens" step={8} />,
})

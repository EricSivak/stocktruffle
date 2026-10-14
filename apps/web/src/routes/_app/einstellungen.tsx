import { createFileRoute } from "@tanstack/react-router"

import { ComingSoon } from "@/components/coming-soon"

export const Route = createFileRoute("/_app/einstellungen")({
  component: () => <ComingSoon title="Einstellungen" step={9} />,
})

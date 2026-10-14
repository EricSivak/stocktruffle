import { createFileRoute } from "@tanstack/react-router"

import { ComingSoon } from "@/components/coming-soon"

export const Route = createFileRoute("/_app/recherche/$id")({
  component: () => <ComingSoon title="Recherche" step={6} />,
})

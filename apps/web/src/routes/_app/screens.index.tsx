import { createFileRoute, useNavigate } from "@tanstack/react-router"

import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { useAgentContext } from "@/features/agent/agent-panel-context"
import { ScreensTable } from "@/features/screens/screens-table"
import { screens } from "@/prototype/fixtures/screens"

export const Route = createFileRoute("/_app/screens/")({
  // ?state=empty shows the empty design; only for review in development.
  validateSearch: (search: Record<string, unknown>): { state?: "empty" } =>
    import.meta.env.DEV && search.state === "empty" ? { state: "empty" } : {},
  component: ScreensPage,
})

const AGENT_CONTEXT = {
  label: "sees your screens",
  thread: [],
  placeholder: "Ask about your screens",
}

function ScreensPage() {
  const { state } = Route.useSearch()
  const navigate = useNavigate()
  useAgentContext(AGENT_CONTEXT)

  const saved = state === "empty" ? [] : screens
  const toSearch = () => void navigate({ to: "/" })

  return (
    <div className="mx-auto flex max-w-6xl flex-col px-8 pt-8 pb-16">
      <PageHeader
        title="Screens"
        meta={`${saved.length} saved`}
        actions={<Button onClick={toSearch}>New screen</Button>}
      />
      <div className="mt-6">
        {saved.length ? (
          <ScreensTable screens={saved} />
        ) : (
          <div className="rounded-lg border border-input bg-card px-6 py-14 text-center">
            <p className="mx-auto max-w-md text-muted-foreground">
              No screens yet. Describe on the start page what you&apos;re
              looking for and save the result.
            </p>
            <Button variant="plain" className="mt-3" onClick={toSearch}>
              Go to search
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"

import { AgentPanelProvider } from "@/features/agent/agent-panel-context"
import { AppShell } from "@/features/shell/app-shell"
import { supabase } from "@/lib/supabase"

// Everything below this layout needs a signed-in user.
export const Route = createFileRoute("/_app")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession()
    if (!data.session) throw redirect({ to: "/login" })
  },
  component: AppLayout,
})

function AppLayout() {
  return (
    <AgentPanelProvider>
      <AppShell>
        <Outlet />
      </AppShell>
    </AgentPanelProvider>
  )
}

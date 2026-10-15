import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"

import { NotFound } from "@/components/not-found"
import { AgentPanelProvider } from "@/features/agent/agent-panel-context"
import { AppShell } from "@/features/shell/app-shell"
import { supabase } from "@/lib/supabase"

// Everything below this layout needs a signed-in user.
export const Route = createFileRoute("/_app")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession()
    if (!data.session) throw redirect({ to: "/login" })
  },
  component: () => (
    <AppLayout>
      <Outlet />
    </AppLayout>
  ),
  // Replaces the layout's component, so it brings the frame along: unknown paths and missing
  // stocks, screens or research keep the navigation.
  notFoundComponent: () => (
    <AppLayout>
      <NotFound />
    </AppLayout>
  ),
})

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AgentPanelProvider>
      <AppShell>{children}</AppShell>
    </AgentPanelProvider>
  )
}

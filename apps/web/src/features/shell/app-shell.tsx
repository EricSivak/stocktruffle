import { useState } from "react"
import { useLocation } from "@tanstack/react-router"

import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AgentPanel } from "@/features/agent/agent-panel"
import { useAgentPanel } from "@/features/agent/agent-panel-context"
import { CommandPalette } from "@/features/shell/command-palette"
import { NavRail } from "@/features/shell/nav-rail"
import { useHotkey } from "@/lib/keys"

/** The start page and the research page are the agent's own surfaces; no side panel there. */
function agentAllowed(pathname: string) {
  return pathname !== "/" && !pathname.startsWith("/research")
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const agent = useAgentPanel()
  const pathname = useLocation({ select: (location) => location.pathname })
  const [paletteOpen, setPaletteOpen] = useState(false)
  const showAgent = agent.open && agentAllowed(pathname)

  useHotkey("mod+k", () => setPaletteOpen((open) => !open))
  useHotkey("mod+j", () => agent.setOpen(!agent.open), agentAllowed(pathname))
  useHotkey("escape", () => agent.setOpen(false), showAgent && !paletteOpen)

  return (
    <TooltipProvider>
      <div className="flex h-svh">
        <NavRail />
        <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
        {/* A new page starts a new conversation; questions don't follow you around. */}
        {showAgent && <AgentPanel key={agent.context?.label} />}
      </div>
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
      <Toaster position="bottom-left" />
    </TooltipProvider>
  )
}

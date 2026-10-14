import { createContext, useContext, useEffect, useMemo, useState } from "react"

import type { ThreadItem } from "@/prototype/fixtures/agent"

/**
 * What the agent sees on the current page: a short label, the conversation so far and the
 * prompt in its input. Pages pass a memoised object, or the panel would reset on every render.
 */
export type AgentContext = {
  label: string
  thread: ThreadItem[]
  placeholder?: string
}

type AgentPanelState = {
  open: boolean
  setOpen: (open: boolean) => void
  context: AgentContext | null
  setContext: (context: AgentContext | null) => void
}

const STORAGE_KEY = "agent-panel-open"
const AgentPanelContext = createContext<AgentPanelState | null>(null)

function readOpen(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "1"
  } catch {
    return false
  }
}

export function AgentPanelProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpenState] = useState(readOpen)
  const [context, setContext] = useState<AgentContext | null>(null)

  const value = useMemo(
    () => ({
      open,
      setOpen: (next: boolean) => {
        setOpenState(next)
        try {
          sessionStorage.setItem(STORAGE_KEY, next ? "1" : "0")
        } catch {
          // Private windows may refuse storage; the panel still works for this visit.
        }
      },
      context,
      setContext,
    }),
    [open, context]
  )

  return (
    <AgentPanelContext.Provider value={value}>
      {children}
    </AgentPanelContext.Provider>
  )
}

export function useAgentPanel(): AgentPanelState {
  const state = useContext(AgentPanelContext)
  if (!state)
    throw new Error("useAgentPanel must be used within AgentPanelProvider")
  return state
}

/** Tells the agent what the current page shows, for as long as the page is mounted. */
export function useAgentContext(context: AgentContext) {
  const { setContext } = useAgentPanel()
  useEffect(() => {
    setContext(context)
    return () => setContext(null)
  }, [context, setContext])
}

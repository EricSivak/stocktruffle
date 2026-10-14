import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAgentPanel } from "@/features/agent/agent-panel-context"
import { Composer } from "@/features/agent/composer"
import { Thread } from "@/features/agent/thread"
import type { ThreadItem } from "@/prototype/fixtures/agent"

export function AgentPanel() {
  const { context, setOpen } = useAgentPanel()
  const navigate = useNavigate()
  const [research, setResearch] = useState(false)
  // Questions asked in this session; answers come with the real agent in phase 3.
  const [asked, setAsked] = useState<ThreadItem[]>([])
  const thread = [...(context?.thread ?? []), ...asked]

  return (
    <aside
      aria-label="Agent"
      className="flex w-[360px] shrink-0 flex-col border-l"
    >
      <header className="flex h-14 shrink-0 items-center gap-3 pr-3 pl-5">
        <h2 className="text-sm font-medium">Agent</h2>
        <span className="ml-auto text-xs text-muted-foreground">
          {context?.label ?? "sieht diese Seite"}
        </span>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Agent schließen"
          onClick={() => setOpen(false)}
        >
          <XIcon strokeWidth={1.6} />
        </Button>
      </header>

      <ScrollArea className="min-h-0 flex-1">
        <div className="px-5 pt-2 pb-6">
          {thread.length ? (
            <Thread items={thread} />
          ) : (
            <p className="text-muted-foreground">
              Frag zu dem, was du gerade siehst. Der Agent kennt diese Seite,
              deine Screens und dein Tracking.
            </p>
          )}
        </div>
      </ScrollArea>

      <div className="p-4">
        <Composer
          placeholder={context?.placeholder ?? "Frag zu dieser Seite"}
          research={research}
          onResearchChange={setResearch}
          onSubmit={(question) => {
            if (research) {
              void navigate({
                to: "/recherche/$id",
                params: { id: "neu" },
                search: { frage: question },
              })
              return
            }
            setAsked((items) => [
              ...items,
              { kind: "question", text: question },
              { kind: "pending", text: "Antwort folgt in Phase 3" },
            ])
          }}
        />
      </div>
    </aside>
  )
}

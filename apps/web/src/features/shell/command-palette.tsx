import { useNavigate } from "@tanstack/react-router"

import { useTheme } from "@/components/theme-provider"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { useAgentPanel } from "@/features/agent/agent-panel-context"
import { allCompanies } from "@/prototype/fixtures/companies"
import { screens } from "@/prototype/fixtures/screens"

const pages = [
  { to: "/", label: "Search" },
  { to: "/screens", label: "Screens" },
  { to: "/tracking", label: "Tracking" },
  { to: "/signals", label: "Signals" },
  { to: "/settings", label: "Settings" },
] as const

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const navigate = useNavigate()
  const agent = useAgentPanel()
  const { setTheme } = useTheme()
  const run = (action: () => void) => () => {
    onOpenChange(false)
    action()
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Commands"
      description="Search for a page, stock or command"
    >
      <Command>
        <CommandInput placeholder="Page, stock or command" />
        <CommandList>
          <CommandEmpty>Nichts gefunden.</CommandEmpty>
          <CommandGroup heading="Go to">
            {pages.map((page) => (
              <CommandItem
                key={page.to}
                onSelect={run(() => void navigate({ to: page.to }))}
              >
                {page.label}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Screens">
            {screens.map((screen) => (
              <CommandItem
                key={screen.id}
                value={`screen ${screen.name}`}
                onSelect={run(
                  () =>
                    void navigate({
                      to: "/screens/$screenId",
                      params: { screenId: screen.id },
                    })
                )}
              >
                {screen.name}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Stocks">
            {allCompanies.map((company) => (
              <CommandItem
                key={company.symbol}
                value={`${company.name} ${company.symbol}`}
                onSelect={run(
                  () =>
                    void navigate({
                      to: "/stocks/$symbol",
                      params: { symbol: company.symbol },
                    })
                )}
              >
                {company.name}
                <span className="text-xs text-muted-foreground">
                  {company.symbol}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Actions">
            <CommandItem onSelect={run(() => agent.setOpen(true))}>
              Open agent
              <CommandShortcut>
                <KbdGroup>
                  <Kbd>Ctrl</Kbd>
                  <Kbd>J</Kbd>
                </KbdGroup>
              </CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={run(() => void navigate({ to: "/" }))}>
              New research
            </CommandItem>
            <CommandItem onSelect={run(() => setTheme("light"))}>
              Light theme
            </CommandItem>
            <CommandItem onSelect={run(() => setTheme("dark"))}>
              Dark theme
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  )
}

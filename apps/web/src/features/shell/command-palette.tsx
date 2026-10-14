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
import { companies } from "@/prototype/fixtures/companies"
import { screens } from "@/prototype/fixtures/screens"

const pages = [
  { to: "/", label: "Suche" },
  { to: "/screens", label: "Screens" },
  { to: "/tracking", label: "Tracking" },
  { to: "/signale", label: "Signale" },
  { to: "/einstellungen", label: "Einstellungen" },
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
      title="Befehle"
      description="Seite, Aktie oder Befehl suchen"
    >
      <Command>
        <CommandInput placeholder="Seite, Aktie oder Befehl" />
        <CommandList>
          <CommandEmpty>Nichts gefunden.</CommandEmpty>
          <CommandGroup heading="Gehe zu">
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
          <CommandGroup heading="Aktien">
            {companies.map((company) => (
              <CommandItem
                key={company.symbol}
                value={`${company.name} ${company.symbol}`}
                onSelect={run(
                  () =>
                    void navigate({
                      to: "/aktie/$symbol",
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
          <CommandGroup heading="Aktionen">
            <CommandItem onSelect={run(() => agent.setOpen(true))}>
              Agent öffnen
              <CommandShortcut>
                <KbdGroup>
                  <Kbd>Strg</Kbd>
                  <Kbd>J</Kbd>
                </KbdGroup>
              </CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={run(
                () =>
                  void navigate({
                    to: "/recherche/$id",
                    params: { id: "demo" },
                  })
              )}
            >
              Neue Recherche
            </CommandItem>
            <CommandItem onSelect={run(() => setTheme("light"))}>
              Helles Design
            </CommandItem>
            <CommandItem onSelect={run(() => setTheme("dark"))}>
              Dunkles Design
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  )
}

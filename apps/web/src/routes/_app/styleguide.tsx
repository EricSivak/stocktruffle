import { createFileRoute, notFound } from "@tanstack/react-router"
import { toast } from "sonner"

import { LogoMark, Lockup } from "@/components/brand/logo"
import { Change } from "@/components/change"
import { PageHeader } from "@/components/page-header"
import { Sparkline } from "@/components/sparkline"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Thread } from "@/features/agent/thread"
import { FilterTokens } from "@/features/screen/filter-tokens"
import { TableSkeleton } from "@/features/screen/results-table"
import { formatCompact, formatPrice } from "@/lib/format"
import { screenThread } from "@/prototype/fixtures/agent"
import { companies } from "@/prototype/fixtures/companies"
import { rules, screens } from "@/prototype/fixtures/screens"

// Development-only reference page: every token and building block in one place, light and
// dark side by side, used to check the prototype against the mockups.
export const Route = createFileRoute("/_app/styleguide")({
  beforeLoad: () => {
    if (!import.meta.env.DEV) throw notFound()
  },
  component: Styleguide,
})

const SWATCHES = [
  ["Papier", "bg-background"],
  ["Feld", "bg-card"],
  ["Auswahl", "bg-muted"],
  ["Rand", "bg-border"],
  ["Feldrand", "bg-input"],
  ["Tinte", "bg-foreground"],
  ["Grau", "bg-muted-foreground"],
  ["Inaktiv", "bg-inactive"],
  ["Trüffelgold", "bg-gold"],
  ["Moos", "bg-gain"],
  ["Terrakotta", "bg-loss"],
] as const

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="border-t pt-5">
      <h2 className="mb-4 text-sm font-medium">{title}</h2>
      {children}
    </section>
  )
}

function Specimen() {
  const rows = companies.slice(0, 3)
  return (
    <div className="flex flex-col gap-10 bg-background p-8 text-foreground">
      <Section title="Farben">
        <div className="grid grid-cols-6 gap-3">
          {SWATCHES.map(([name, className]) => (
            <div key={name}>
              <div className={`h-10 rounded-md border ${className}`} />
              <p className="mt-1 text-xs text-muted-foreground">{name}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Schrift">
        <div className="flex flex-col gap-3">
          <p className="title">Europa Small Caps</p>
          <p className="text-[30px] font-medium tabular-nums">42,18 €</p>
          <p className="max-w-md voice">
            Der Markt preist das Ende eines Großauftrags 2027 ein. Die Marge ist
            seit drei Quartalen stabil.
          </p>
          <p className="font-serif text-base italic">
            Günstig, weil ein Großauftrag 2027 ausläuft.
          </p>
          <p>
            Oberfläche 13 px ·{" "}
            <span className="text-xs text-muted-foreground">
              Metatext 12 px
            </span>
          </p>
          <p className="tabular-nums">
            {formatPrice(118.4)} · {formatCompact(1.2e9, "EUR")} ·{" "}
            <Change value={0.182} /> · <Change value={-0.058} /> ·{" "}
            <Change value={0} />
          </p>
        </div>
      </Section>

      <Section title="Logo">
        <div className="flex items-center gap-6">
          <LogoMark size={64} />
          <LogoMark size={32} />
          <LogoMark size={16} />
          <Lockup size={40} />
        </div>
      </Section>

      <Section title="Bedienung">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-5">
            <Button>Speichern</Button>
            <Button variant="plain">Exportieren</Button>
            <Button
              variant="plain"
              onClick={() =>
                toast("Screen gespeichert", {
                  action: { label: "Rückgängig", onClick: () => undefined },
                })
              }
            >
              Meldung zeigen
            </Button>
          </div>
          <Input placeholder="Interessant, wenn …" className="max-w-sm" />
          <FilterTokens
            tokens={screens[0].filters}
            onTokensChange={() => undefined}
            rules={rules}
            onToggleRule={() => undefined}
          />
          <Tabs defaultValue="aktiv">
            <TabsList variant="line">
              <TabsTrigger value="aktiv">Aktiv</TabsTrigger>
              <TabsTrigger value="archiv">Archiv</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </Section>

      <Section title="Tabelle">
        <div className="overflow-hidden rounded-lg border border-input bg-card">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-5">Unternehmen</TableHead>
                <TableHead className="text-right">Heute</TableHead>
                <TableHead className="text-right">1 Jahr</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((company, index) => (
                <TableRow
                  key={company.symbol}
                  data-state={index === 1 ? "selected" : undefined}
                >
                  <TableCell className="pl-5">
                    {company.name}{" "}
                    <span className="text-xs text-muted-foreground">
                      {company.symbol}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Change value={company.dayChange} />
                  </TableCell>
                  <TableCell>
                    <Sparkline
                      values={company.year}
                      tone={company.yearChange}
                      className="ml-auto"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Section>

      <Section title="Agent">
        <div className="max-w-sm">
          <Thread items={screenThread} />
        </div>
      </Section>

      <Section title="Zustände">
        <div className="flex flex-col gap-4">
          <TableSkeleton rows={3} />
          <p>
            Kein Titel erfüllt alle Filter. Am engsten ist KGV &lt; 15; ohne
            diesen Filter wären es 34 Treffer.{" "}
            <Button variant="plain">KGV-Filter entfernen</Button>
          </p>
          <p className="text-xs text-muted-foreground">
            Stand gestern, 17:35 ·{" "}
            <span className="text-foreground underline">Aktualisieren</span>
          </p>
        </div>
      </Section>
    </div>
  )
}

function Styleguide() {
  return (
    <div className="px-8 pt-8 pb-16">
      <PageHeader title="Styleguide" meta="nur in der Entwicklung" />
      <div className="mt-6 grid grid-cols-2 overflow-hidden rounded-lg border">
        <Specimen />
        <div className="dark border-l">
          <Specimen />
        </div>
      </div>
    </div>
  )
}

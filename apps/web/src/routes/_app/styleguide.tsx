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
  ["Paper", "bg-background"],
  ["Field", "bg-card"],
  ["Selection", "bg-muted"],
  ["Border", "bg-border"],
  ["Field border", "bg-input"],
  ["Ink", "bg-foreground"],
  ["Gray", "bg-muted-foreground"],
  ["Inactive", "bg-inactive"],
  ["Truffle gold", "bg-gold"],
  ["Moss", "bg-gain"],
  ["Terracotta", "bg-loss"],
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
      <Section title="Colours">
        <div className="grid grid-cols-6 gap-3">
          {SWATCHES.map(([name, className]) => (
            <div key={name}>
              <div className={`h-10 rounded-md border ${className}`} />
              <p className="mt-1 text-xs text-muted-foreground">{name}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Type">
        <div className="flex flex-col gap-3">
          <p className="title">Europe Small Caps</p>
          <p className="text-[30px] font-medium tabular-nums">€42.18</p>
          <p className="max-w-md voice">
            The market is pricing in the end of a major contract in 2027. The
            margin has held steady for three quarters.
          </p>
          <p className="font-serif text-base italic">
            Cheap because a major contract ends in 2027.
          </p>
          <p>
            Interface 13 px ·{" "}
            <span className="text-xs text-muted-foreground">
              Meta text 12 px
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

      <Section title="Controls">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-5">
            <Button>Save</Button>
            <Button variant="plain">Export</Button>
            <Button
              variant="plain"
              onClick={() =>
                toast("Screen saved", {
                  action: { label: "Undo", onClick: () => undefined },
                })
              }
            >
              Show toast
            </Button>
          </div>
          <Input placeholder="Interesting when …" className="max-w-sm" />
          <FilterTokens
            tokens={screens[0].filters}
            onTokensChange={() => undefined}
            rules={rules}
            onToggleRule={() => undefined}
          />
          <Tabs defaultValue="active">
            <TabsList variant="line">
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="archive">Archive</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </Section>

      <Section title="Table">
        <div className="overflow-hidden rounded-lg border border-input bg-card">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-5">Company</TableHead>
                <TableHead className="text-right">Today</TableHead>
                <TableHead className="text-right">1 year</TableHead>
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

      <Section title="States">
        <div className="flex flex-col gap-4">
          <TableSkeleton rows={3} />
          <p>
            No stock meets every filter. P/E &lt; 15 is the tightest; without it
            there would be 34 hits.{" "}
            <Button variant="plain">Remove P/E filter</Button>
          </p>
          <p>
            Yahoo isn&apos;t answering right now. The last result from 17:35 is
            saved. <Button variant="plain">Try again</Button>
          </p>
          <p className="text-muted-foreground">Nothing tracked yet.</p>
          <div
            className="h-16 rounded-md bg-muted/60"
            aria-label="Chart loading"
          />
          <p className="text-xs text-muted-foreground">
            As of yesterday, 17:35 ·{" "}
            <span className="text-foreground underline">Refresh</span>
          </p>
        </div>
      </Section>
    </div>
  )
}

function Styleguide() {
  return (
    <div className="px-8 pt-8 pb-16">
      <PageHeader title="Styleguide" meta="development only" />
      <div className="mt-6 grid grid-cols-2 overflow-hidden rounded-lg border">
        <Specimen />
        <div className="dark border-l">
          <Specimen />
        </div>
      </div>
    </div>
  )
}

import { useState } from "react"
import { PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { catalog } from "@/prototype/catalog"
import type { FilterToken } from "@/prototype/fixtures/screens"

const tokenClass =
  "inline-flex h-6 items-center gap-1.5 rounded-md border border-input px-2 text-xs text-foreground transition-colors hover:border-foreground/30 aria-expanded:border-foreground/40"

function Token({
  token,
  onChange,
  onRemove,
}: {
  token: FilterToken
  onChange: (value: string) => void
  onRemove: () => void
}) {
  return (
    <Popover>
      <PopoverTrigger render={<button type="button" className={tokenClass} />}>
        <span className="text-muted-foreground">{token.label}</span>
        {token.value}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-60">
        <label
          className="text-xs text-muted-foreground"
          htmlFor={`filter-${token.id}`}
        >
          {token.label}
        </label>
        <Input
          id={`filter-${token.id}`}
          defaultValue={token.value}
          onKeyDown={(event) => {
            if (event.key === "Enter") onChange(event.currentTarget.value)
          }}
          onBlur={(event) => onChange(event.currentTarget.value)}
        />
        <Button
          variant="plain"
          className="self-start text-muted-foreground"
          onClick={onRemove}
        >
          Filter entfernen
        </Button>
      </PopoverContent>
    </Popover>
  )
}

function RulesToken({
  rules,
  onToggle,
}: {
  rules: { id: string; text: string; active: boolean }[]
  onToggle: (id: string) => void
}) {
  return (
    <Popover>
      <PopoverTrigger render={<button type="button" className={tokenClass} />}>
        Meine Regeln
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 gap-3">
        <p className="text-xs text-muted-foreground">
          Gelten für jeden Screen. Ändern unter Einstellungen.
        </p>
        <ul className="flex flex-col gap-2.5">
          {rules.map((rule) => (
            <li
              key={rule.id}
              className="flex items-center justify-between gap-4"
            >
              <label htmlFor={`rule-${rule.id}`}>{rule.text}</label>
              <Switch
                id={`rule-${rule.id}`}
                checked={rule.active}
                onCheckedChange={() => onToggle(rule.id)}
              />
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  )
}

function AddFilter({ onAdd }: { onAdd: (label: string) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            className="inline-flex h-6 items-center gap-1 px-1 text-xs text-muted-foreground hover:text-foreground"
          />
        }
      >
        <PlusIcon className="size-3.5" strokeWidth={1.6} aria-hidden="true" />
        Filter
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-0">
        <Command>
          <CommandInput placeholder="Kennzahl suchen" />
          <CommandList className="max-h-72">
            <CommandEmpty>Keine Kennzahl gefunden.</CommandEmpty>
            {catalog.map((group) => (
              <CommandGroup key={group.name} heading={group.name}>
                {group.metrics.map((metric) => (
                  <CommandItem
                    key={metric.id}
                    onSelect={() => {
                      onAdd(metric.label)
                      setOpen(false)
                    }}
                  >
                    {metric.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export function FilterTokens({
  tokens,
  onTokensChange,
  rules,
  onToggleRule,
}: {
  tokens: FilterToken[]
  onTokensChange: (tokens: FilterToken[]) => void
  rules: { id: string; text: string; active: boolean }[]
  onToggleRule: (id: string) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {tokens.map((token) => (
        <Token
          key={token.id}
          token={token}
          onChange={(value) =>
            onTokensChange(
              tokens.map((item) =>
                item.id === token.id ? { ...item, value } : item
              )
            )
          }
          onRemove={() =>
            onTokensChange(tokens.filter((item) => item.id !== token.id))
          }
        />
      ))}
      <RulesToken rules={rules} onToggle={onToggleRule} />
      <AddFilter
        onAdd={(label) =>
          onTokensChange([
            ...tokens,
            { id: `${label}-${tokens.length}`, label, value: "festlegen" },
          ])
        }
      />
    </div>
  )
}

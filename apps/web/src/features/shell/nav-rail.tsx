import { Link, useNavigate } from "@tanstack/react-router"
import {
  BellIcon,
  LayoutGridIcon,
  MoonIcon,
  SearchIcon,
  SunIcon,
  TrendingUpIcon,
} from "lucide-react"

import { LogoMark } from "@/components/brand/logo"
import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useAccountEmail } from "@/lib/account"
import { supabase } from "@/lib/supabase"

const items = [
  { to: "/", label: "Suche", icon: SearchIcon, exact: true },
  { to: "/screens", label: "Screens", icon: LayoutGridIcon, exact: false },
  { to: "/tracking", label: "Tracking", icon: TrendingUpIcon, exact: false },
  { to: "/signale", label: "Signale", icon: BellIcon, exact: false },
] as const

function useIsDark() {
  const { theme } = useTheme()
  if (theme !== "system") return theme === "dark"
  return window.matchMedia("(prefers-color-scheme: dark)").matches
}

export function NavRail() {
  const { setTheme } = useTheme()
  const isDark = useIsDark()
  const email = useAccountEmail()
  const navigate = useNavigate()

  return (
    <nav
      aria-label="Hauptnavigation"
      className="flex w-16 shrink-0 flex-col items-center border-r py-4"
    >
      <Link
        to="/"
        aria-label="stocktruffle, zur Startseite"
        className="rounded-full"
      >
        <LogoMark size={34} />
      </Link>

      <ul className="mt-6 flex flex-col gap-1.5">
        {items.map(({ to, label, icon: Icon, exact }) => (
          <li key={to}>
            <Link
              to={to}
              activeOptions={{ exact }}
              className="group flex size-13 flex-col items-center justify-center gap-1 rounded-md text-muted-foreground transition-colors hover:text-foreground data-[status=active]:bg-muted data-[status=active]:text-foreground"
            >
              <Icon
                className="size-[18px] text-inactive group-hover:text-foreground group-data-[status=active]:text-foreground"
                strokeWidth={1.6}
                aria-hidden="true"
              />
              <span className="text-[11px] leading-none">{label}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-auto flex flex-col items-center gap-3">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={isDark ? "Helles Design" : "Dunkles Design"}
                onClick={() => setTheme(isDark ? "light" : "dark")}
              />
            }
          >
            {isDark ? (
              <SunIcon strokeWidth={1.6} />
            ) : (
              <MoonIcon strokeWidth={1.6} />
            )}
          </TooltipTrigger>
          <TooltipContent side="right">
            {isDark ? "Helles Design" : "Dunkles Design"}
          </TooltipContent>
        </Tooltip>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                aria-label="Konto"
                className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-medium text-foreground uppercase"
              />
            }
          >
            {email?.[0] ?? ""}
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="end" className="w-56">
            {email && (
              <>
                <DropdownMenuLabel className="truncate font-normal text-muted-foreground">
                  {email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem
              onClick={() => void navigate({ to: "/einstellungen" })}
            >
              Einstellungen
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => void supabase.auth.signOut()}>
              Abmelden
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  )
}

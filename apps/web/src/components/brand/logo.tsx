import { cn } from "cn"

import { MARK, MARK_COLORS, type MarkVariant } from "./logo-geometry"

/** The truffle mark. "auto" follows the app theme: light on paper, dark with a rim. */
export function LogoMark({
  size = 32,
  variant = "auto",
  className,
}: {
  size?: number
  variant?: MarkVariant | "auto"
  className?: string
}) {
  if (variant === "auto") {
    return (
      <>
        <LogoMark
          size={size}
          variant="light"
          className={cn("dark:hidden", className)}
        />
        <LogoMark
          size={size}
          variant="dark"
          className={cn("hidden dark:block", className)}
        />
      </>
    )
  }
  const colors = MARK_COLORS[variant]
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-hidden="true"
      className={cn("shrink-0", className)}
    >
      <path
        d={MARK.outline}
        fill={colors.body}
        stroke={colors.outline}
        strokeWidth={colors.outline ? 2.2 : undefined}
      />
      <g transform={MARK.letterTransform} fill={colors.letter}>
        <path d={MARK.letter} />
        <path d={MARK.stairs} />
      </g>
      <circle
        cx={MARK.dot.cx}
        cy={MARK.dot.cy}
        r={MARK.dot.r}
        fill={colors.dot}
      />
    </svg>
  )
}

/** "stock" in the grotesk, "truffle" in the serif italic: one word, two voices. */
export function Wordmark({
  className,
  size = 28,
}: {
  className?: string
  size?: number
}) {
  return (
    <span
      className={cn("inline-flex items-baseline leading-none", className)}
      style={{ fontSize: size }}
    >
      <span className="font-sans font-bold tracking-[-0.03em]">stock</span>
      <span className="font-serif text-[1.12em] tracking-[-0.01em] italic">
        truffle
      </span>
    </span>
  )
}

export function Lockup({
  size = 40,
  className,
}: {
  size?: number
  className?: string
}) {
  return (
    <span
      className={cn("inline-flex items-center", className)}
      style={{ gap: size * 0.28 }}
      aria-label="stocktruffle"
      role="img"
    >
      <LogoMark size={size} />
      <Wordmark size={size * 0.8} />
    </span>
  )
}

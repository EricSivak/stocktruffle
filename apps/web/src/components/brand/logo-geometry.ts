// Geometry of the stocktruffle mark in a 100 × 100 box: an organic truffle shape, the
// Newsreader "t" whose crossbar climbs three steps, and a gold dot at the top step.
// Plain data and functions, so the favicon script can use them without React.
import { LETTER_T } from "./logo-paths"

function truffleOutline(): string {
  const center = 50
  const radius = 44
  const lobes = 7
  const amplitude = 2.3
  // Uneven lobes keep the outline from looking machine-made.
  const lobeWeights = [1, 0.55, 1.35, 0.8, 1.15, 0.65, 1.25]
  const phase = -Math.PI / 2.6
  const samples = 180
  const points: string[] = []
  for (let i = 0; i < samples; i++) {
    const angle = phase + (i / samples) * Math.PI * 2
    const position = (i / samples) * lobes
    const lobe = Math.floor(position)
    const blend = position - lobe
    const weight =
      lobeWeights[lobe % lobes] * (1 - blend) +
      lobeWeights[(lobe + 1) % lobes] * blend
    const r =
      radius + amplitude * weight * Math.cos(angle * lobes - phase * lobes)
    points.push(
      `${(center + r * Math.cos(angle)).toFixed(2)} ${(center + r * Math.sin(angle)).toFixed(2)}`
    )
  }
  return `M${points.join("L")}Z`
}

// Glyph units (y downwards); the crossbar of Newsreader's "t" ends at x 736–754, top 192.8.
const STEP_RUN = 118
const STEP_RISE = 112
const STEP_THICKNESS = 122
const CROSSBAR_END = 736
const CROSSBAR_TOP = 192.8

function stairs(): string {
  let path = ""
  for (let step = 1; step <= 3; step++) {
    const left = CROSSBAR_END + (step - 1) * STEP_RUN - 20
    const right = CROSSBAR_END + step * STEP_RUN
    const top = CROSSBAR_TOP - step * STEP_RISE
    const bottom = top + STEP_THICKNESS + (step === 1 ? 12 : 0)
    path += `M${left} ${top}H${right}V${bottom}H${left}Z`
  }
  return path
}

const DOT_GLYPH = {
  cx: CROSSBAR_END + 3 * STEP_RUN + 95,
  cy: CROSSBAR_TOP - 3 * STEP_RISE - 60,
  r: 88,
}
const LETTER_BOTTOM = 1240.8
const SCALE = 0.041
// Centre the letter, steps and dot together inside the outline.
const OFFSET_X = 50 - ((DOT_GLYPH.cx + DOT_GLYPH.r) / 2) * SCALE
const OFFSET_Y = 51 - ((DOT_GLYPH.cy - DOT_GLYPH.r + LETTER_BOTTOM) / 2) * SCALE

export const MARK = {
  outline: truffleOutline(),
  letter: LETTER_T,
  stairs: stairs(),
  letterTransform: `translate(${OFFSET_X.toFixed(3)} ${OFFSET_Y.toFixed(3)}) scale(${SCALE})`,
  dot: {
    cx: OFFSET_X + DOT_GLYPH.cx * SCALE,
    cy: OFFSET_Y + DOT_GLYPH.cy * SCALE,
    r: DOT_GLYPH.r * SCALE,
  },
}

export type MarkVariant = "light" | "dark" | "ink" | "cream"

export const MARK_COLORS: Record<
  MarkVariant,
  { body: string; letter: string; dot: string; outline?: string }
> = {
  light: { body: "#2A211B", letter: "#F3EDE4", dot: "#B08337" },
  // On dark backgrounds the brown body needs a cream rim to stay visible.
  dark: {
    body: "#2A211B",
    letter: "#F3EDE4",
    dot: "#D6A85C",
    outline: "#F3EDE4",
  },
  ink: { body: "#1D1915", letter: "#F5F1EA", dot: "#F5F1EA" },
  cream: { body: "#F3EDE4", letter: "#12100E", dot: "#12100E" },
}

/** The mark as a standalone SVG document, used for the favicon. */
export function markSvg(
  variant: MarkVariant,
  { withStairs = true } = {}
): string {
  const colors = MARK_COLORS[variant]
  const rim = colors.outline
    ? ` stroke="${colors.outline}" stroke-width="2.2"`
    : ""
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">`,
    `<path d="${MARK.outline}" fill="${colors.body}"${rim}/>`,
    `<g transform="${MARK.letterTransform}" fill="${colors.letter}">`,
    `<path d="${MARK.letter}"/>`,
    withStairs ? `<path d="${MARK.stairs}"/>` : "",
    `</g>`,
    `<circle cx="${MARK.dot.cx.toFixed(2)}" cy="${MARK.dot.cy.toFixed(2)}" r="${MARK.dot.r.toFixed(2)}" fill="${colors.dot}"/>`,
    `</svg>`,
  ].join("")
}

// Draws the truffle-vein pattern for the login page once and writes src/assets/veins.svg.
// Contour lines of a smooth noise field, tilted so they run from the lower left to the upper
// right, plus one gold vein that ends in the logo's gold dot. The seed is fixed, so the file
// only changes when this script does.
// Usage (from apps/web): node scripts/build-veins.mjs
import { writeFileSync } from "node:fs"
import { contours } from "d3-contour"
import { createNoise2D } from "simplex-noise"

const WIDTH = 640
const HEIGHT = 1024
const CELL = 6
const COLUMNS = Math.ceil(WIDTH / CELL) + 1
const ROWS = Math.ceil(HEIGHT / CELL) + 1
const LEVELS = 46

const LINE = "#8A7A6A"
const GOLD = "#C9A15A"

function seeded(seed) {
  let state = seed >>> 0
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0
    return state / 4294967296
  }
}

const noise = createNoise2D(seeded(1729))

// Height of the field: two octaves of noise on a diagonal ramp, so contours drift upwards
// to the right like veins in a cut truffle.
function height(x, y) {
  const nx = x / WIDTH
  const ny = y / HEIGHT
  const ramp = (nx * 0.6 - ny) * 4.2
  return (
    ramp +
    noise(nx * 1.7, ny * 1.7) * 0.75 +
    noise(nx * 4.5 + 7, ny * 4.5 - 3) * 0.16
  )
}

const values = new Float64Array(COLUMNS * ROWS)
for (let row = 0; row < ROWS; row++) {
  for (let column = 0; column < COLUMNS; column++) {
    values[row * COLUMNS + column] = height(column * CELL, row * CELL)
  }
}
let min = Infinity
let max = -Infinity
for (const value of values) {
  min = Math.min(min, value)
  max = Math.max(max, value)
}
const thresholds = Array.from(
  { length: LEVELS },
  (_, i) => min + ((i + 0.5) * (max - min)) / LEVELS
)

const round = (value) => Math.round(value * 10) / 10

// Each contour is a closed ring around the grid; only the parts inside the canvas are lines.
function ringPath(ring) {
  let path = ""
  let pen = false
  for (const [column, row] of ring) {
    const x = round(column * CELL)
    const y = round(row * CELL)
    const inside = x > 0.5 && x < WIDTH - 0.5 && y > 0.5 && y < HEIGHT - 0.5
    if (!inside) {
      pen = false
      continue
    }
    path += `${pen ? "L" : "M"}${x} ${y}`
    pen = true
  }
  return path
}

const lines = contours()
  .size([COLUMNS, ROWS])
  .thresholds(thresholds)(values)
  .map((contour) =>
    contour.coordinates
      .flatMap((polygon) => polygon.map(ringPath))
      .join("")
  )
  .filter(Boolean)

// The gold vein: from the lower left edge to a point near the top right, bending with the
// same field so it reads as one of the veins.
const start = { x: 0, y: HEIGHT * 0.66 }
const end = { x: WIDTH * 0.89, y: HEIGHT * 0.16 }
const steps = 90
const gold = []
for (let i = 0; i <= steps; i++) {
  const t = i / steps
  const x = start.x + (end.x - start.x) * t
  const y = start.y + (end.y - start.y) * t
  const wobble = noise(t * 3.1 + 11, 0.4) * 26 * Math.sin(Math.PI * t)
  gold.push([round(x + wobble * 0.6), round(y + wobble)])
}
const goldPath = gold
  .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x} ${y}`)
  .join("")
const dot = gold.at(-1)

const svg = [
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" preserveAspectRatio="xMidYMid slice">`,
  `<g fill="none" stroke="${LINE}" stroke-width="1" stroke-opacity="0.42" stroke-linejoin="round">`,
  ...lines.map((d) => `<path d="${d}"/>`),
  `</g>`,
  `<path d="${goldPath}" fill="none" stroke="${GOLD}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`,
  `<circle cx="${dot[0]}" cy="${dot[1]}" r="6" fill="${GOLD}"/>`,
  `</svg>`,
].join("\n")

writeFileSync("src/assets/veins.svg", `${svg}\n`)
console.log(
  `veins.svg: ${lines.length} contour levels, ${Math.round(svg.length / 1024)} KB`
)

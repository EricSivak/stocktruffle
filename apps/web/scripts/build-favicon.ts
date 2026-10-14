// Writes public/favicon.svg from the logo geometry. At favicon size the steps turn into
// noise, so the favicon shows only the letter and the gold dot.
// Usage (from apps/web): npx tsx scripts/build-favicon.ts
import { writeFileSync } from "node:fs"

import { markSvg } from "../src/components/brand/logo-geometry"

const svg = markSvg("light", { withStairs: false })
writeFileSync("public/favicon.svg", `${svg}\n`)
console.log(`public/favicon.svg: ${svg.length} bytes`)

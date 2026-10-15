// Screenshots of the prototype next to the approved mockups, light and dark.
// Signs up a throwaway @stocktruffle.test account (allowed alongside the real one) and
// deletes it again at the end, even when a step fails.
// Usage (from apps/web, with `npm run dev` running): node scripts/prototype-shots.mjs
import { execSync } from "node:child_process"
import { randomUUID } from "node:crypto"
import { mkdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { chromium } from "@playwright/test"

const BASE = "http://localhost:5173"
const OUT = "../../docs/design/prototyp-v2"
const VIEWPORT = { width: 1536, height: 1024 }

// Pages and the mockup each one is compared with. `prepare` sets the page up like its mockup.
const selectSecondRow = (view) => view.keyboard.press("j")
const openHausberg = (view) => view.getByRole("row", { name: /Hausberg Wohnbau/ }).first().click()
const blurSearch = (view) => view.evaluate(() => document.activeElement?.blur())
const openFirstRow = (view) => view.locator("tbody tr").first().click()

const PAGES = [
  { name: "01-start", path: "/", theme: "light", ready: "main form[role=search]", prepare: blurSearch, mockup: "mockups-v2/01-start.webp" },
  { name: "01-start-dunkel", path: "/", theme: "dark", ready: "main form[role=search]", prepare: blurSearch },
  { name: "02-screen-mit-agent", path: "/screens/europe-small-caps", agent: true, theme: "light", prepare: selectSecondRow, mockup: "mockups-v2/02-screen-mit-agent.webp" },
  { name: "06-screen-dunkel", path: "/screens/europe-small-caps", agent: false, theme: "dark", prepare: selectSecondRow, mockup: "mockups-v2/06-screen-dunkel.webp" },
  { name: "02-screen-dunkel-mit-agent", path: "/screens/europe-small-caps", agent: true, theme: "dark", prepare: selectSecondRow },
  { name: "03-recherche", path: "/research/demo", theme: "light", mockup: "mockups-v2/03-recherche.webp" },
  { name: "03-recherche-dunkel", path: "/research/demo", theme: "dark" },
  { name: "04-aktie", path: "/stocks/NWT.DE", theme: "light", mockup: "mockups-v2/04-aktie.webp" },
  { name: "04-aktie-dunkel", path: "/stocks/NWT.DE", theme: "dark" },
  { name: "05-tracking", path: "/tracking", theme: "light", prepare: openHausberg, mockup: "mockups-v2/05-tracking.webp" },
  { name: "05-tracking-dunkel", path: "/tracking", theme: "dark", prepare: openHausberg },
  { name: "07-signale", path: "/signals", theme: "light", prepare: openFirstRow },
  { name: "07-signale-dunkel", path: "/signals", theme: "dark", prepare: openFirstRow },
  { name: "08-screens", path: "/screens", theme: "light" },
  { name: "08-screens-dunkel", path: "/screens", theme: "dark" },
  { name: "09-einstellungen", path: "/settings", theme: "light" },
  { name: "09-einstellungen-dunkel", path: "/settings", theme: "dark" },
  { name: "11-nicht-gefunden", path: "/stocks/XXXX", theme: "light" },
  { name: "styleguide", path: "/styleguide", agent: false, theme: "light", fullPage: true },
]

// The login is taken signed out, before the test account signs in.
const LOGIN_PAGES = [
  { name: "10-login", theme: "light", mockup: "mockups-v1/03-login.webp" },
  { name: "10-login-dunkel", theme: "dark" },
]

function supabaseStatus() {
  const output = execSync("supabase status -o json", { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] })
  return JSON.parse(output.slice(output.indexOf("{")))
}

async function deleteUser(status, userId) {
  const response = await fetch(`${status.API_URL}/auth/v1/admin/users/${userId}`, {
    method: "DELETE",
    headers: { apikey: status.SECRET_KEY, Authorization: `Bearer ${status.SECRET_KEY}` },
  })
  if (!response.ok) throw new Error(`Test account not deleted: ${response.status}`)
}

const status = supabaseStatus()
const email = `shots-${randomUUID().slice(0, 8)}@stocktruffle.test`
const password = randomUUID()
const signup = await fetch(`${status.API_URL}/auth/v1/signup`, {
  method: "POST",
  headers: { apikey: status.PUBLISHABLE_KEY, "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
})
const account = await signup.json()
if (!signup.ok) throw new Error(`Test account not created: ${JSON.stringify(account)}`)
const userId = account.user?.id ?? account.id

mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch({ channel: "msedge" })
const problems = []
try {
  for (const shot of LOGIN_PAGES) {
    const context = await browser.newContext({ viewport: VIEWPORT, colorScheme: shot.theme })
    await context.addInitScript((theme) => localStorage.setItem("theme", theme), shot.theme)
    const view = await context.newPage()
    view.on("pageerror", (error) => problems.push(`${shot.name}: ${error.message}`))
    await view.goto(`${BASE}/login`)
    await view.getByText("Connected locally").waitFor()
    await view.evaluate(() => document.fonts.ready)
    await view.evaluate(() => document.activeElement?.blur())
    await view.screenshot({ path: join(OUT, `${shot.name}.png`) })
    await context.close()
  }

  const login = await browser.newContext({ viewport: VIEWPORT })
  const page = await login.newPage()
  await page.goto(`${BASE}/login`)
  await page.getByLabel("Email").fill(email)
  await page.getByLabel("Password", { exact: true }).fill(password)
  await page.getByRole("button", { name: "Sign in" }).click()
  await page.waitForURL(`${BASE}/`)
  await page.locator("main form[role=search]").waitFor()
  const storageState = await login.storageState()
  await login.close()

  for (const shot of PAGES) {
    const context = await browser.newContext({ viewport: VIEWPORT, storageState, colorScheme: shot.theme })
    await context.addInitScript(({ theme, agent }) => {
      localStorage.setItem("theme", theme)
      sessionStorage.setItem("agent-panel-open", agent ? "1" : "0")
    }, shot)
    const view = await context.newPage()
    view.on("console", (message) => message.type() === "error" && problems.push(`${shot.name}: ${message.text()}`))
    view.on("pageerror", (error) => problems.push(`${shot.name}: ${error.message}`))
    await view.goto(BASE + shot.path)
    await view.locator(shot.ready ?? "main h1").first().waitFor()
    await view.evaluate(() => document.fonts.ready)
    await shot.prepare?.(view)
    await view.waitForTimeout(500)
    await view.screenshot({ path: join(OUT, `${shot.name}.png`), fullPage: shot.fullPage ?? false })
    await context.close()
  }
} finally {
  await browser.close()
  await deleteUser(status, userId)
}

// Pages with a mockup sit next to it; pages without one stand alone on the right.
const rows = [...LOGIN_PAGES, ...PAGES.filter((shot) => shot.name !== "styleguide")]
  .map(
    (shot) => `<section><h2>${shot.name}</h2><div class="pair">
${shot.mockup ? `<figure><img src="${shot.mockup}"><figcaption>Mockup</figcaption></figure>` : "<div></div>"}
<figure><img src="prototyp-v2/${shot.name}.png"><figcaption>Prototyp</figcaption></figure></div></section>`
  )
  .join("\n")
writeFileSync(
  "../../docs/design/vergleich.html",
  `<!doctype html><meta charset="utf-8"><title>stocktruffle · Mockup und Prototyp</title>
<style>body{margin:24px;font:13px system-ui;background:#f5f1ea;color:#1d1915}h2{font-weight:500;font-size:14px}
.pair{display:grid;grid-template-columns:1fr 1fr;gap:16px}img{width:100%;border:1px solid #e2d9cc}figure{margin:0}
figcaption{color:#6b6157;margin-top:4px}section{margin-bottom:40px}</style>
<h1 style="font-weight:500;font-size:18px">Mockup links, Prototyp rechts</h1>
${rows}\n`
)
console.log(problems.length ? `Konsolenfehler:\n${problems.join("\n")}` : "keine Konsolenfehler")
console.log(`Testkonto ${email} angelegt und wieder gelöscht.`)

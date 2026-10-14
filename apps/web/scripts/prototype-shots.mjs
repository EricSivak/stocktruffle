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

// Pages and the mockup each one is compared with.
const PAGES = [
  { name: "02-screen-mit-agent", path: "/screens/europa-small-caps", agent: true, theme: "light", mockup: "02-screen-mit-agent.webp" },
  { name: "06-screen-dunkel", path: "/screens/europa-small-caps", agent: false, theme: "dark", mockup: "06-screen-dunkel.webp" },
  { name: "02-screen-dunkel-mit-agent", path: "/screens/europa-small-caps", agent: true, theme: "dark" },
  { name: "styleguide", path: "/styleguide", agent: false, theme: "light", fullPage: true },
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
  if (!response.ok) throw new Error(`Testkonto nicht gelöscht: ${response.status}`)
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
if (!signup.ok) throw new Error(`Testkonto nicht angelegt: ${JSON.stringify(account)}`)
const userId = account.user?.id ?? account.id

mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch({ channel: "msedge" })
const problems = []
try {
  const login = await browser.newContext({ viewport: VIEWPORT })
  const page = await login.newPage()
  await page.goto(`${BASE}/login`)
  await page.getByLabel("E-Mail").fill(email)
  await page.getByLabel("Passwort").fill(password)
  await page.getByRole("button", { name: "Anmelden" }).click()
  await page.waitForURL(`${BASE}/`)
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
    await view.locator("main h1").first().waitFor()
    await view.evaluate(() => document.fonts.ready)
    if (shot.path.startsWith("/screens")) {
      // Select the second row as in the mockup.
      await view.keyboard.press("j")
    }
    await view.waitForTimeout(400)
    await view.screenshot({ path: join(OUT, `${shot.name}.png`), fullPage: shot.fullPage ?? false })
    await context.close()
  }
} finally {
  await browser.close()
  await deleteUser(status, userId)
}

const rows = PAGES.filter((shot) => shot.mockup)
  .map(
    (shot) => `<section><h2>${shot.name}</h2><div class="pair">
<figure><img src="mockups-v2/${shot.mockup}"><figcaption>Mockup</figcaption></figure>
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

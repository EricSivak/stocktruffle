// The prototype's core flow: search, screen, stock, tracking, research. Each step runs
// through the keyboard or the visible controls, the way a person would use the app.
import { expect, test } from "./fixtures.ts"

// The formatter separates currency codes with a no-break space.
const plain = (text: string) => text.replace(/\s/gu, " ")

test("start page routes descriptions to screens and questions to research", async ({
  page,
}) => {
  await expect(page.getByText(/^Xetra (open|closed)/)).toBeVisible()

  await page
    .getByRole("button", {
      name: "Profitable small caps in Europe, P/E under 15",
    })
    .click()
  await page.waitForURL(/\/screens\/new\?q=/)
  await expect(page.locator("main h1")).toHaveText("New screen")
  await expect(page.getByLabel("Search")).toHaveValue(/^Profitable/)

  await page.goto("/")
  await page
    .getByRole("button", { name: "Why is Rheinmetall falling today?" })
    .click()
  await page.waitForURL(/\/research\/new\?q=/)
  await expect(
    page.getByText("Research · answer arrives in phase 3")
  ).toBeVisible({ timeout: 6000 })

  await page.goto("/")
  await page.getByLabel("Search").fill("Like ASML, only smaller and cheaper")
  await page.keyboard.press("Enter")
  await page.waitForURL(/\/screens\/new/)
})

test("screen to stock page with chart and agent", async ({ page }) => {
  await page.goto("/screens/europe-small-caps")
  await page.locator("tbody tr").first().waitFor()
  await expect(page.locator("tbody tr")).toHaveCount(47)
  await page.locator("main").click({ position: { x: 5, y: 5 } })
  await page.keyboard.press("j")
  await page.keyboard.press("Enter")
  await page.waitForURL(/\/stocks\/NWT\.DE/)

  const priceLine = plain(
    await page
      .locator("main p")
      .filter({ hasText: "today," })
      .first()
      .innerText()
  )
  expect(priceLine).toContain("€42.18")
  expect(priceLine).toContain("−€2.60 (−5.8%)")

  await page.getByRole("tab", { name: "1M" }).click()
  await expect(page.getByText("1 month")).toBeVisible()

  const tooltip = page.getByRole("status").first()
  const before = await tooltip.innerText()
  const chart = await page
    .locator("[aria-label='Price history'] canvas")
    .first()
    .boundingBox()
  if (!chart) throw new Error("Chart not rendered")
  await page.mouse.move(chart.x + chart.width * 0.3, chart.y + chart.height / 2)
  await expect(tooltip).not.toHaveText(before)

  await page.getByRole("button", { name: "Why is it moving?" }).click()
  await expect(
    page.getByText("Two analysts cut their price target today")
  ).toBeVisible()
})

test("track from the stock page, then edit on the tracking page", async ({
  page,
}) => {
  await page.goto("/stocks/CRV.MI")
  await page.locator("main h1").waitFor()
  await page.locator("main").click({ position: { x: 5, y: 5 } })
  await page.keyboard.press("t")
  const dialog = page.getByRole("dialog")
  await dialog.getByPlaceholder("Cheap because …").fill("Cheap and debt-free.")
  await dialog.getByRole("button", { name: "Track" }).click()
  await expect(page.getByText("Cheap and debt-free.")).toBeVisible()

  // Client-side navigation keeps the prototype's in-memory tracking list.
  await page.getByRole("button", { name: "Tracked" }).click()
  await page.waitForURL(/\/tracking/)
  const meta = page.locator("main header p").first()
  await expect(meta).toHaveText("6 stocks · 4 signals")

  await page
    .getByRole("row", { name: /Hausberg Wohnbau/ })
    .first()
    .click()
  await expect(page.getByText("Origin")).toBeVisible()
  await page.getByTitle("Edit thesis").click()
  await page.keyboard.press("Control+a")
  await page.keyboard.type("Rates decide everything.")
  await page.keyboard.press("Enter")
  await expect(page.getByTitle("Edit thesis")).toHaveText(
    "Rates decide everything."
  )

  await page.getByLabel("New signal").fill("Mortgage rates below 3%")
  await page.keyboard.press("Enter")
  await expect(meta).toHaveText("6 stocks · 5 signals")

  await page.locator("main").click({ position: { x: 5, y: 5 } })
  await page.keyboard.press("Delete")
  await expect(page.getByText("HBG.DE archived")).toBeVisible()
  await expect(meta).toHaveText(/^5 stocks/)
  await page.getByRole("button", { name: "Undo" }).last().click()
  await expect(meta).toHaveText(/^6 stocks/)

  await page.getByRole("tab", { name: "Archive" }).click()
  await expect(page.getByText("Price target reached")).toBeVisible()
})

test("research: footnotes, sources, steps, tracking and follow-ups", async ({
  page,
}) => {
  await page.goto("/research/demo")
  await page.locator("main h1").waitFor()
  await page.getByRole("button", { name: "Source 2" }).click()
  await expect(page.locator("li[data-highlighted]")).toContainText(
    "framework contracts"
  )
  await page.getByRole("button", { name: "Show 13 more sources" }).click()
  await expect(page.locator("aside li")).toHaveCount(23)
  await page.getByRole("button", { name: "Show steps" }).click()
  await expect(
    page.getByText("Compared defence share and order backlog")
  ).toBeVisible()
  await page.getByRole("button", { name: "Track all" }).click()
  await expect(page.getByText("Tracking 4 stocks")).toBeVisible()

  await page.getByLabel("Follow up").fill("And Rheinmetall?")
  await page.keyboard.press("Enter")
  await expect(
    page.getByText("Answer arrives in phase 3", { exact: true }).first()
  ).toBeVisible({ timeout: 6000 })

  await page.getByRole("button", { name: "Open as screen" }).click()
  await page.waitForURL(/\/screens\/defence-suppliers/)
  await expect(page.locator("tbody tr")).toHaveCount(4)
})

// Signals, screens, settings, not found and the login page.
import { test as base } from "@playwright/test"

import { expect, test } from "./fixtures.ts"

test("signals: add, change the rhythm, delete and undo", async ({ page }) => {
  await page.goto("/signals")
  const meta = page.locator("main header p").first()
  await expect(meta).toHaveText("4 signals · none active")

  await page.getByLabel("New signal").fill("Interesting when the backlog grows")
  await page.getByRole("button", { name: "Add" }).click()
  await expect(meta).toHaveText("5 signals · none active")
  await expect(
    page.getByText("Interesting when the backlog grows")
  ).toBeVisible()

  const row = page.getByRole("row", { name: /mortgage rates fall/ })
  await row.click()
  await expect(page.getByText("No checks yet")).toBeVisible()
  await page.getByRole("combobox", { name: "Rhythm" }).last().click()
  await page.getByRole("option", { name: "daily" }).click()
  await expect(row).toContainText("daily")
  await page.getByRole("button", { name: "Delete" }).click()
  await expect(meta).toHaveText("4 signals · none active")
  await page.getByRole("button", { name: "Undo" }).click()
  await expect(meta).toHaveText("5 signals · none active")
})

test("screens overview opens a screen", async ({ page }) => {
  await page.goto("/screens")
  await expect(page.locator("main header p").first()).toHaveText("2 saved")
  await page.getByRole("button", { name: /^Defence suppliers/ }).click()
  await page.waitForURL(/\/screens\/defence-suppliers/)
})

test("a rule added in settings shows up in a screen", async ({ page }) => {
  await page.goto("/settings")
  await page.getByLabel("New rule").fill("No airlines")
  await page.keyboard.press("Enter")
  await expect(page.getByText("No airlines")).toBeVisible()

  // Client-side navigation keeps the in-memory rules.
  await page.getByRole("link", { name: "Screens" }).click()
  await page.getByRole("button", { name: /^Europe Small Caps/ }).click()
  await page.getByRole("button", { name: "My rules" }).click()
  await expect(page.getByText("No airlines")).toBeVisible()
})

test("unknown stocks and paths show not found inside the app", async ({
  page,
}) => {
  for (const path of ["/stocks/XXXX", "/nothing-here"]) {
    await page.goto(path)
    await expect(page.locator("main h1")).toHaveText("Not found")
    await expect(
      page.getByRole("navigation", { name: "Main navigation" })
    ).toBeVisible()
  }
})

base("login explains a wrong password", async ({ page }) => {
  await page.goto("/login")
  await expect(page.getByText("Connected locally")).toBeVisible()
  await expect(
    page.getByRole("button", { name: "Create account" })
  ).toHaveCount(0)
  await page.getByLabel("Email").fill("nobody@stocktruffle.test")
  await page.getByLabel("Password", { exact: true }).fill("wrong-password")
  await page.getByRole("button", { name: "Sign in" }).click()
  await expect(page.getByText("Email or password is wrong.")).toBeVisible()
})

// Menus and popovers only render their content when opened; open each one once so a broken
// part fails here (the fixture fails the test on any page error).
test("every menu and popover opens", async ({ page }) => {
  await page.getByRole("button", { name: "Account" }).click()
  await expect(page.getByRole("menuitem", { name: "Settings" })).toBeVisible()
  await page.keyboard.press("Escape")

  await page.goto("/screens/europe-small-caps")
  await page.getByRole("button", { name: "Columns" }).click()
  await page.getByRole("menuitemcheckbox", { name: "Net margin" }).click()
  await page.keyboard.press("Escape")
  await expect(
    page.getByRole("columnheader", { name: "Net margin" })
  ).toHaveCount(0)

  await page.getByRole("button", { name: "P/E <" }).click()
  await expect(
    page.getByRole("button", { name: "Remove filter" })
  ).toBeVisible()
  await page.keyboard.press("Escape")

  await page.getByRole("button", { name: "My rules" }).click()
  await expect(page.getByRole("switch").first()).toBeVisible()
  await page.keyboard.press("Escape")

  await page.getByRole("button", { name: "Filter" }).click()
  await expect(page.getByPlaceholder("Search metrics")).toBeVisible()
  await page.keyboard.press("Escape")

  await page.keyboard.press("Control+k")
  await expect(page.getByPlaceholder("Page, stock or command")).toBeVisible()
  await page.keyboard.press("Escape")

  await page.goto("/signals")
  await page.getByRole("combobox", { name: "Stock" }).click()
  await expect(page.getByRole("option").first()).toBeVisible()
  await page.keyboard.press("Escape")
})

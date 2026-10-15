import { execSync } from "node:child_process"
import { randomUUID } from "node:crypto"
import { resolve } from "node:path"
import { test as base, type Page } from "@playwright/test"

type Account = { email: string; password: string }

type SupabaseStatus = {
  API_URL: string
  PUBLISHABLE_KEY: string
  SECRET_KEY: string
}

function supabaseStatus(): SupabaseStatus {
  const output = execSync("supabase status -o json", {
    cwd: resolve(import.meta.dirname, "../../.."),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  })
  return JSON.parse(output.slice(output.indexOf("{"))) as SupabaseStatus
}

/** Signs in through the login page, as a person would. */
export async function signIn(page: Page, account: Account) {
  await page.goto("/login")
  await page.getByLabel("Email").fill(account.email)
  await page.getByLabel("Password", { exact: true }).fill(account.password)
  await page.getByRole("button", { name: "Sign in" }).click()
  await page.locator("main form[role=search]").waitFor()
}

/**
 * `account` is a throwaway @stocktruffle.test user for the whole run, deleted at the end even
 * when a test fails. `page` starts signed in on the start page.
 */
export const test = base.extend<object, { account: Account }>({
  account: [
    // Playwright reads the fixtures a function needs from its first parameter.
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      const status = supabaseStatus()
      const account = {
        email: `e2e-${randomUUID().slice(0, 8)}@stocktruffle.test`,
        password: randomUUID(),
      }
      const response = await fetch(`${status.API_URL}/auth/v1/signup`, {
        method: "POST",
        headers: {
          apikey: status.PUBLISHABLE_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(account),
      })
      const body = (await response.json()) as {
        id?: string
        user?: { id: string }
      }
      if (!response.ok) throw new Error(`Sign-up failed: ${response.status}`)
      try {
        await use(account)
      } finally {
        await fetch(
          `${status.API_URL}/auth/v1/admin/users/${body.user?.id ?? body.id}`,
          {
            method: "DELETE",
            headers: {
              apikey: status.SECRET_KEY,
              Authorization: `Bearer ${status.SECRET_KEY}`,
            },
          }
        )
      }
    },
    { scope: "worker" },
  ],
  page: async ({ page, account }, use) => {
    const errors: string[] = []
    page.on("pageerror", (error) => errors.push(error.message))
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text())
    })
    await signIn(page, account)
    await use(page)
    if (errors.length) throw new Error(`Console errors:\n${errors.join("\n")}`)
  },
})

export { expect } from "@playwright/test"

import { defineConfig } from "@playwright/test"

// End-to-end tests against the running dev stack (`npm run dev` from the repo root). They
// sign up a throwaway @stocktruffle.test account and delete it again; the real account and
// its data stay untouched.
export default defineConfig({
  testDir: "e2e",
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://localhost:5173",
    channel: "msedge",
    viewport: { width: 1536, height: 1024 },
  },
})

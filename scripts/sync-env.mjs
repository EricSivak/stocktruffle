// Writes the connection values of the running local Supabase into the env files of web and
// engine. Other entries in those files (the Anthropic key, for one) are left untouched.
import { execSync } from "node:child_process"
import { existsSync, readFileSync, writeFileSync } from "node:fs"

function readStatus() {
  try {
    const output = execSync("supabase status -o json", {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    })
    return JSON.parse(output.slice(output.indexOf("{")))
  } catch {
    console.error("Supabase läuft nicht. Erst `npm run db:start` ausführen.")
    process.exit(1)
  }
}

function upsert(file, values) {
  const lines = existsSync(file) ? readFileSync(file, "utf8").split(/\r?\n/) : []
  for (const [key, value] of Object.entries(values)) {
    const index = lines.findIndex((line) => line.startsWith(`${key}=`))
    if (index === -1) lines.push(`${key}=${value}`)
    else lines[index] = `${key}=${value}`
  }
  writeFileSync(file, lines.join("\n").replace(/\n*$/, "\n"))
  console.log(`${file}: ${Object.keys(values).join(", ")}`)
}

const status = readStatus()

upsert("apps/web/.env.local", {
  VITE_SUPABASE_URL: status.API_URL,
  VITE_SUPABASE_PUBLISHABLE_KEY: status.PUBLISHABLE_KEY,
  VITE_ENGINE_URL: "http://127.0.0.1:8000",
})

upsert("apps/engine/.env", {
  SUPABASE_URL: status.API_URL,
})

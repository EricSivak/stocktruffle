# stocktruffle

Text-to-stocks screener with a research agent, run locally for one user. The full product plan, phases and design rules are in [docs/PLAN.md](docs/PLAN.md) (German). Read it before starting a phase.

## Working with Eric

- He writes German: answer in German. The app is English (UI copy, URLs, search parameters, sample data); docs in `docs/` stay German; code, comments and commit messages are English.
- The UI must look crafted, not generated. Nothing visual counts as done before he has approved it on the prototype.
- Build UI from shadcn components through the shadcn MCP server (`.mcp.json`); don't hand-roll what the registry has.

## Layout

- `apps/web`: Vite, React 19, TypeScript, Tailwind 4, shadcn/ui (Base UI, preset `nova`), TanStack Router (file routes in `src/routes`) and Query.
- `apps/engine`: Python via uv, FastAPI. Data, screening and the agent live here. The Anthropic key only ever exists in `apps/engine/.env`.
- `supabase`: local stack with auth (email and password, single user), Postgres with RLS, Realtime. Storage, edge runtime and analytics are switched off in `config.toml` until needed.

## Commands (from the repo root)

- `npm run dev` starts Supabase, engine (:8000) and web (:5173).
- `npm run env` writes the local Supabase values into `apps/web/.env.local` and `apps/engine/.env`.
- `npm test`, `npm run typecheck`, `npm run lint`.
- `npm run db:reset` rebuilds the local database from `supabase/migrations`; `npm run db:types` regenerates `apps/web/src/lib/database.types.ts`.

## Conventions

- Numbers, prices, percentages and dates are rendered through `apps/web/src/lib/format.ts`, never formatted inline. A missing value is "–", not 0.
- The model translates, code computes: no number shown to the user may come from an LLM.
- Every table in `public` has RLS; user-owned rows are scoped to `auth.uid()`.
- The engine accepts only Supabase access tokens verified against the JWKS (`engine/auth.py`).
- `src/routeTree.gen.ts` and `database.types.ts` are generated and committed; don't edit them.
- The libraries here are several major versions past older habits (Vite 8, TanStack Table 9, pandas 3, yfinance 1.x, Anthropic SDK 1.x). Check current docs before using an API from memory, and load the `claude-api` skill before writing agent code.

## Design (current direction: docs/design/konzept.md)

The first coded prototype (monochrome, Geist Mono numbers) was rejected as ugly and is superseded. The direction is "paper and black truffle"; the palette, rules and anti-patterns are in `docs/design/konzept.md`, mockups in `docs/design/mockups-v1/` (round 2 follows).

- Approved by Eric: the logo "Monogramm" (lowercase serif t with a stepped crossbar and a gold dot inside a truffle-shaped blob) and the login screen (`docs/design/mockups-v1/03-login.webp`).
- Warm paper background, ink text, moss and terracotta only for change, truffle gold only for the logo dot and the selected-row marker; warm brown-black dark theme.
- One sans for UI and every number (tabular figures, British format: `1,234.5`, `18.2%`, `€42.18`, `09/10/2026`); serif only for page titles at 24 px and for prose (agent answers, memos, theses).
- Flat: at most one surface level, no shadows on content, 6 px corners, one primary button per view, text buttons without icons.
- Never: eyebrow labels, gold labels, KPI number blocks, initials avatars, gradient fills under lines, chat bubbles, pills, decorative textures (login excepted), keyboard-shortcut bars.
- Motion only where it explains; keyboard first; every state designed (loading, empty, error, stale).

# Project conventions

## How Claude should work

- State assumptions explicitly. Ask rather than guess.
- Push back when a simpler approach exists. Stop when confused.
- Minimum code that solves the problem. Nothing speculative.
- No abstractions for single-use code.
- Touch only what you must. Don't improve adjacent code.
- Match existing style. Don't refactor what isn't broken.

## Before reporting a task done

- Run `npm run lint` (runs `tsc -b --noEmit` type checking + oxlint). All TS errors must be resolved before reporting done.
- Run `npm run format` on any new or modified files.
- Run `/simplify` on newly written or modified files; fix anything it raises, then re-run lint. If `/simplify` isn't available in this environment, do an equivalent simplification pass manually (reuse, dead code, over-abstraction) instead.

## Code rules

- Prefer `type` over `interface` — only use `interface` for declaration merging or extending external types.
- Never use `crypto.randomUUID()` to generate ids. Use the `uuid` library: `import { v4 as uuidv4 } from "uuid"` and call `uuidv4()`.
- Never use an array index as a React `key`. Generate a stable id with `uuidv4()` when the item is created and use that. (Exception: purely presentational fixed-length lists, e.g. loading skeletons.)
- No multi-level (nested) ternaries — use a lookup object, `if/else`, or early returns.
- Use descriptive variable names in `.map()` callbacks — never single-letter/abbreviated (`option` not `opt`, `network` not `n`).

## Components

- New components go in their own folder inside `src/components/`.
- Folder and file names are PascalCase, except `src/components/ui/` (shadcn components).
- Components in `src/components/` must be dumb — business logic (state, derived data, handlers, query/mutation calls) lives in a co-located `.logic.ts` file exported as a custom hook (e.g. `CampaignsTable.logic.ts` exports `useCampaignsTable()`).
- Use the `Field` component from `src/components/ui/field.tsx` for all forms/form fields — wrap each input in `<Field>`, with `<FieldLabel>`, `<FieldError>`, `<FieldDescription>` for accessible markup.
- All forms must use react-hook-form (RHF). Drive submission with `form.handleSubmit` and keep field-level validation in the RHF config. Integrate non-native inputs (e.g. custom pickers) via `<Controller>`, mapping `field.value`/`field.onChange` onto the input's props. Never build a form with raw `useState` + `onChange` handlers.
- Use `toast` from `sonner` (mounted once in `main.tsx`) for user-facing success/error feedback — never `alert()` or a hand-rolled banner.

## Stack

React 19 + Vite + TypeScript + Tailwind v4 + shadcn/ui + TanStack Query (v5) + react-hook-form + uuid on the frontend; a [Hono](https://hono.dev) server (`server/index.ts`, port 8787) for API routes and persistence, backed by SQLite via [Prisma](https://www.prisma.io) 7.

- Tailwind v4 uses the `@tailwindcss/vite` plugin and CSS-first config (`@import "tailwindcss";` in `src/index.css`); there is no `tailwind.config.js` unless you add one.
- Path alias `@/` maps to `src/`.
- Add shadcn components with `npx shadcn@latest add <name>`.
- Run the app with `npm run dev` — starts both the Vite dev server (http://localhost:5173) and the Hono API; Vite proxies `/api/*` to it.

## Database (SQLite + Prisma)

- Schema lives at `server/prisma/schema.prisma`. To change it: edit the schema, then run `npm run db:migrate` (creates a migration and regenerates the client).
- Prisma 7 is engine-less — the runtime uses a driver adapter. The `PrismaClient` singleton is created once in `server/db.ts` with `PrismaBetterSqlite3`; import `prisma` from there.
- Generated client is emitted to `server/generated/prisma` (git-ignored, regenerated on `npm install` via `postinstall`, and by `db:migrate`). The DB file (`server/data/app.db`) is also git-ignored. The schema and `server/prisma/migrations/` are committed.
- Persistence flows through HTTP, never `localStorage`: add a Prisma model, a Hono route under `/api/*`, a fetch helper, and a TanStack Query hook (`useQuery`/`useMutation`) to consume it.

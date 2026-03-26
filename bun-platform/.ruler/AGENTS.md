# AGENTS.md

Centralized AI agent instructions. Add coding guidelines, style guides, and project context here.

Ruler concatenates all `.md` files in this directory (and subdirectories), starting with `AGENTS.md` (if present), then remaining files in sorted order.

# Runtime is Bun

Default to using Bun instead of Node.js.

- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun install` instead of `npm install` or `pnpm install` or `yarn install`
- Use `bun run <script>` instead of `npm run <script>` or `pnpm run <script>` or `yarn run <script>`
- Use `bun test` instead of `jest` or `vitest`
- Use `bunx <package> <command>` instead of `npx <package> <command>`
- Bun automatically loads `.env`, so do not add `dotenv` setup unless a package explicitly requires it

## Workspace layout

- `apps/api` contains the Hono API entrypoint
- `apps/web` contains the TanStack Start web app
- `packages/*` contains shared auth, config, data, env, and UI packages
- Run workspace-wide tasks from the repository root with `turbo`

## Project stack

- Better Auth handles authentication and organization membership
- Drizzle defines the database schema and migration workflow
- Hono and oRPC power the backend API surface
- Shared UI components live in `packages/ui`

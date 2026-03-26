# bun-platform

A full-stack Bun platform with TanStack Start, Hono, oRPC, Better Auth, Drizzle, SQLite/Turso, and shared UI packages.

## Features

- **TypeScript** - For type safety and improved developer experience
- **TanStack Start** - SSR framework with TanStack Router
- **TailwindCSS** - Utility-first CSS for rapid UI development
- **Shared UI package** - shadcn/ui primitives live in `packages/ui`
- **Hono** - Lightweight, performant server framework
- **oRPC** - End-to-end type-safe APIs with OpenAPI integration
- **Bun** - Runtime environment
- **Drizzle** - TypeScript-first ORM
- **SQLite/Turso** - Database engine
- **Authentication** - Better-Auth
- **Oxlint** - Oxlint + Oxfmt (linting & formatting)
- **Turborepo** - Optimized monorepo build system

## Getting Started

Clone the repository and install the dependencies:

```bash
git clone <your-repo-url> my-project
cd my-project
bun install
```

Then create your local env files and generate any placeholder secrets:

```bash
bun run setup
```

## Database Setup

This project uses SQLite with Drizzle ORM.

1. Start the local SQLite database (optional):

```bash
bun run db:local
```

2. Update your `.env` file in the `apps/api` directory with the appropriate connection details if needed.

3. Apply the schema to your database:

```bash
bun run db:push
```

4. Seed the local development dataset:

```bash
bun run db:seed
```

This seeds three local users you can sign in with. The command prints the seeded
credentials when it completes.

Set `DEV_SEED_PASSWORD` before running `bun run db:seed` if you want a
different local password.

Then, start the development apps in separate terminals:

```bash
bun run dev:api
bun run dev:web
```

Open [http://localhost:3001](http://localhost:3001) in your browser to see the web application.
The API is running at [http://localhost:3000](http://localhost:3000).

## `dev:local`

Use the split `dev:api` and `dev:web` flow above for regular development.
To quickly start the full local stack and verify the setup is coherent, run:

```bash
bun run dev:local
```

This starts the local database, waits for it to be ready, runs `db:push`, runs `db:seed`, and then opens the database, API, and web processes in a `tmux` session.

This helps when you want a quick end-to-end local setup check without manually coordinating multiple terminals and startup order.

Useful `tmux` shortcuts with the default setup:

- `Ctrl+b`, then arrow keys: switch panes
- `Ctrl+b`, then `d`: detach and leave everything running
- `Ctrl+c` inside a pane: stop the current process, then rerun the command in that pane
- `exit`: close the current pane
- `tmux attach -t bun-platform-dev`: reattach to the session
- `tmux kill-session -t bun-platform-dev`: stop the whole session

## UI Customization

React web apps in this project share shadcn/ui primitives through `packages/ui`.

- Change design tokens and global styles in `packages/ui/src/styles/globals.css`
- Update shared primitives in `packages/ui/src/components/*`
- Adjust shadcn aliases or style config in `packages/ui/components.json` and `apps/web/components.json`

### Add more shared components

Run this from the project root to add more primitives to the shared UI package:

```bash
bunx shadcn@latest add accordion dialog popover sheet table -c packages/ui
```

Import shared components like this:

```tsx
import { Button } from '@bun-platform/ui/components/button'
```

### Add app-specific blocks

If you want to add app-specific blocks instead of shared primitives, run the shadcn CLI from `apps/web`.

## Git Hooks and Formatting

- Format and lint fix: `bun run lint:fix`

## Project Structure

```
bun-platform/
├── apps/
│   ├── api/         # Backend API (Hono, oRPC)
│   └── web/         # Frontend application (React + TanStack Start)
└── packages/
│   ├── api/         # Shared API layer and router definitions
│   ├── auth/        # Authentication configuration and billing helpers
│   ├── config/      # Shared TypeScript configuration package
│   ├── db/          # Database schema, queries, and seed scripts
│   ├── env/         # Typed environment variable definitions
│   ├── sdk/         # Shared client SDK for calling the API
│   └── ui/          # Shared shadcn/ui components and styles
```

## Available Scripts

- `bun run build`: Build all applications
- `bun run check-types`: Check TypeScript types across all apps
- `bun run ci`: Run the full CI task set locally
- `bun run db:generate`: Generate database client/types
- `bun run db:local`: Start the local SQLite database
- `bun run db:migrate`: Run database migrations
- `bun run db:push`: Push schema changes to database
- `bun run db:reset`: Remove the local SQLite database files
- `bun run db:seed`: Seed the local development dataset
- `bun run db:studio`: Open database studio UI
- `bun run dev:api`: Start only the API
- `bun run dev:local`: Start the local database, apply schema/seed, and open API/web in `tmux`
- `bun run dev:web`: Start only the web application
- `bun run lint`: Run Oxlint and Oxfmt in check mode
- `bun run lint:fix`: Run Oxlint and Oxfmt with auto-fixing
- `bun run setup`: Create local env files and generate placeholder secrets
- `bun run test`: Run the workspace test suite
- `bun run test:e2e`: Run the workspace end-to-end tests
- `bun run test:integration`: Run the workspace integration tests

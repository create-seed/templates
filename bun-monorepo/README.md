# bun-monorepo

App-focused Bun monorepo with a [Hono](https://hono.dev/) API, a [React](https://react.dev/) + [Vite](https://vitejs.dev/) web app, and shared internal workspace packages.

## Features

- Bun workspaces with a pinned `packageManager`
- Turbo-powered build and task orchestration
- `apps/api` for the Bun + Hono backend
- `apps/web` for the React + Vite frontend
- Shared internal packages for env, i18n, shell, and UI
- Biome, commitlint, cspell, and Lefthook for project quality checks

## Requirements

- [Node.js](https://nodejs.org) 24 or newer
- [Bun](https://bun.sh) 1.3.11 or newer

## Installation

```bash
bun install
```

If you want local env files instead of the built-in defaults, copy the examples before starting the apps:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

## Development

Start every workspace task:

```bash
bun run dev
```

Start only the API:

```bash
bun run dev:api
```

Start only the web app:

```bash
bun run dev:web
```

## Quality Checks

Run the full CI command:

```bash
bun run ci
```

Run individual checks:

```bash
bun run build
bun run check-types
bun run lint
bun run lint:fix
bun run spell-check
```

## Project Structure

```
.
├── apps/               # Application source code
│   ├── api/           # Backend API
│   └── web/           # Frontend Web Application
├── packages/          # Shared packages
│   ├── config-*/      # Shared configuration (TypeScript, Vite, etc.)
│   ├── env/           # Environment variable handling
│   ├── shell/         # Shared shell/layout components
│   └── ui/            # Shared UI component library
└── turbo/             # Turbo configuration and generators
```

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

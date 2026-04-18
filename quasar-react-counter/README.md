# quasar-react-counter

React 19 app with Vite, TypeScript, Tailwind CSS v4, wallet-ui, Solana Kit, and a Quasar counter program.

## Features

- Quasar counter program with initialize, increment, decrement, set, and delete instructions
- Generated TypeScript client and Quasar SVM tests for the counter program
- React 19 with Vite 7
- Solana wallet playground with Wallet Standard support
- Solana Devnet, Localnet, and Testnet cluster switching
- Tailwind CSS v4 and `tw-animate-css`
- TypeScript with strict checking
- shadcn/ui primitives powered by Base UI and Lucide icons
- System-aware light and dark theme support with persisted preference

## Development

```bash
bun install
bun quasar build
bun quasar keys sync
bun dev
```

Open `http://localhost:5173` to view the app.

The app defaults to `/counter`, where you can derive the wallet-owned PDA, inspect the current value, and send CRUD transactions from the connected wallet.

Make sure the `quasar` CLI is installed and available on your `PATH`. See [Quasar](https://github.com/blueshift-gg/quasar) for installation details.

## Commands

```bash
bun run build
bun run ci
bun run lint
bun run lint:fix
bun run preview
bun run check-types
bun quasar build
bun quasar keys sync
bun run test
```

## Program Development

The Rust program lives in [`program/`](program/), and Quasar generates the committed TypeScript client in [`program/client/`](program/client/).

```bash
bun quasar build
bun quasar keys sync
bun run test
```

`bun quasar build` rebuilds the program binary, refreshes the generated client, and removes generated helper files through the inline `postquasar:build` cleanup command.

## Adding Components

Use the shadcn CLI to scaffold more UI primitives:

```bash
bunx --bun shadcn@latest add button
```

Generated components are written to `src/core/ui`.

## Usage

Import components from the `@/core/ui` alias:

```tsx
import { Button } from '@/core/ui/button'
```

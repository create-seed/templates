# quasar-react-escrow

React 19 app with Vite, TypeScript, Tailwind CSS v4, wallet-ui, Solana Kit, and a Quasar escrow program.

## Features

- Quasar escrow program with `make`, `take`, and `refund` instructions
- Generated TypeScript client and Quasar SVM tests for the escrow program
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

The app defaults to `/escrow`, where the connected wallet can create an offer, share the off-chain `vaultTaA` payload, load another maker's offer, and submit `take` or `refund` transactions.

Make sure the `quasar` CLI is installed and available on your `PATH`. See [Quasar](https://github.com/blueshift-gg/quasar) for installation details.

## Commands

```bash
bun run build
bun run check-types
bun run ci
bun run lint
bun run lint:fix
bun run preview
bun run test
bun quasar build
bun quasar keys sync
```

## Program Development

The Rust program lives in [`program/`](program/), and Quasar generates the committed TypeScript client in [`program/client/`](program/client/).

```bash
bun quasar build
bun quasar keys sync
bun run test
```

`bun quasar build` rebuilds the program binary, refreshes the generated client, and removes generated helper files through the inline `postquasar:build` cleanup command.

## Offer Payloads

The on-chain escrow account stores the maker, mint addresses, receive amount, and the maker-side receive token account. It does not store `vaultTaA`, so the maker must share that address alongside the escrow PDA for takers and refunds.

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

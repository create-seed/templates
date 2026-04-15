# bun-react-vite-solana-kit

React 19 app with Vite, TypeScript, Tailwind CSS v4, wallet-ui, and Solana Kit.

## Features

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
bun run dev
```

Open `http://localhost:5173` to view the app.

## Commands

```bash
bun run build
bun run ci
bun run lint
bun run lint:fix
bun run preview
bun run check-types
```

## Adding Components

Use the shadcn CLI to scaffold more UI primitives:

```bash
bunx --bun shadcn@latest add button
```

Generated components are written to `src/components/ui`.

## Usage

Import components from the `@/components` alias:

```tsx
import { Button } from '@/components/ui/button'
```

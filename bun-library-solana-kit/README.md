# bun-library-solana-kit

TypeScript library for Solana development using [`@solana/kit`](https://github.com/anza-xyz/kit).

## Features

- **Bun, TypeScript, Biome, tsdown, Changesets, GitHub Actions** — batteries included
- **`@solana/kit` client** — `createEmptyClient().use(rpc(...))` plugin pattern
- **Explorer URL helper** — generate Solana Explorer links
- **WebSocket URL derivation** — automatic `wss://` from `https://` RPC URLs
- **E2E tests** — real Solana RPC tests via [Surfpool](https://github.com/txtx/surfpool) + [Testcontainers](https://github.com/beeman/testcontainers)

## Installation

```bash
bun install
```

If you want to override the default RPC endpoint locally, copy the example env file first:

```bash
cp .env.example .env
```

## Usage

```typescript
import { createSolanaClient, getExplorerUrl } from 'bun-library-solana-kit'

const client = createSolanaClient({ url: 'https://api.devnet.solana.com' })

const slot = await client.rpc.getSlot().send()
console.log(`Current slot: ${slot}`)

const url = getExplorerUrl('tx/your-signature', 'devnet')
```

## CLI

```bash
# Check connectivity (defaults to devnet)
bun run src/cli.ts

# Custom RPC URL via argument
bun run src/cli.ts https://api.mainnet-beta.solana.com

# Or via environment variable
SOLANA_ENDPOINT=https://api.mainnet-beta.solana.com bun run src/cli.ts
```

## Development

```bash
bun install
bun run ruler:apply  # apply AI agent rules
bun run build
bun run check-types
bun run lint
bun test           # unit tests
bun run test:e2e   # e2e tests (requires Docker)
```

## Testing

Unit tests (`bun test`) run without any external dependencies.

E2E tests (`bun run test:e2e`) spin up a [Surfpool](https://github.com/txtx/surfpool) container via [`@beeman/testcontainers`](https://github.com/beeman/testcontainers) and run real RPC calls against it. Docker must be running.

#### Using solana-test-validator instead of Surfpool

To switch the e2e tests to use `solana-test-validator`, update `test/e2e.test.ts`:

```diff
- import { createLocalSolanaClient, SurfpoolContainer, type StartedSurfpoolContainer } from '@beeman/testcontainers'
+ import { createLocalSolanaClient, SolanaTestValidatorContainer, type StartedSolanaTestValidatorContainer } from '@beeman/testcontainers'

- let container: StartedSurfpoolContainer
+ let container: StartedSolanaTestValidatorContainer

- container = await new SurfpoolContainer().start()
+ container = await new SolanaTestValidatorContainer().start()
```

The client API is identical — both containers expose `.url`, `.urlWs`, and work with `createLocalSolanaClient()`.

## License

MIT – see [LICENSE](./LICENSE).

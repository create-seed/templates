# bun-library

TypeScript library built with [Bun](https://bun.sh/), [tsdown](https://tsdown.js.org/), [Biome](https://biomejs.dev/), and [Changesets](https://github.com/changesets/changesets).

## Features

- Bun-first dependency management, scripts, and tests
- TypeScript source with dual ESM/CJS output and generated types
- Biome for linting and formatting
- Example library export and CLI entrypoint
- Changesets and GitHub Actions for release automation

## Installation

```bash
bun install
```

## Usage

```ts
import { greet } from 'bun-library'

console.log(greet('Seed'))
```

## CLI

```bash
bun run src/cli.ts
bun run src/cli.ts Seed
```

## Development

```bash
bun run build
bun run check-types
bun run lint
bun run lint:fix
bun test
bun run test:watch
```

## License

MIT – see [LICENSE](./LICENSE).

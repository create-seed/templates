# bun-library

TypeScript library built with [Bun](https://bun.sh/), [tsdown](https://tsdown.js.org/), [Oxlint](https://oxc.rs/docs/guide/usage/linter), [Oxfmt](https://oxc.rs/docs/guide/usage/formatter), and [Changesets](https://github.com/changesets/changesets).

## Features

- Bun-first dependency management, scripts, and tests
- Changesets and GitHub Actions for release automation
- Example library export and CLI entrypoint
- Oxlint and Oxfmt for linting and formatting, with Perfectionist sorting rules
- TypeScript source with dual ESM/CJS output and generated types

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

`lint` checks lint rules and formatting; `lint:fix` applies fixes and formats files. Both fail on lint warnings.
Perfectionist sorts interface members, JSX props, object keys, and object types alphabetically; Oxfmt sorts imports.
Arbitrary JSON keys are not automatically sorted. `package.json` is formatted without reordering its keys.

## License

MIT – see [LICENSE](./LICENSE).

# AGENTS.md — Templates Repo

Guidelines for contributing to and maintaining `create-seed/templates`.

## Structure

Each template lives in its own top-level directory (e.g. `bun-library/`, `bun-library-solana-kit/`). The root `templates.json` is the registry consumed by `create-seed` for short name resolution.

## Adding a New Template

1. Create a new directory at the root with the template name
2. The template should be a complete, working project — users get exactly what's in the directory
3. Add the template to `templates.json` with `id`, `name`, `description`, and `path`
4. Run `bun run validate` to verify the registry is valid

## Template Rules

### Dependencies

- **Never use `latest` as a version** for any dependency.
- **Pin direct dependencies exactly.** Use exact versions for `dependencies`, `devDependencies`, and `optionalDependencies` (e.g. `1.3.9`, not `^1.3.9`).
- **Always commit `bun.lock`** — lockfiles ensure deterministic installs and a clean git branch after `bun install`.
- **Only use `peerDependencies` for real consumer-facing requirements.** Do not keep or add tooling-only peers just to advertise compatibility (for example `typescript` in a template library that does not require consumers to install TypeScript). When a peer is genuinely required, keep it as a compatibility range.

### Updating Packages

- Treat `bun-library` as the baseline for shared library-template tooling. When shared tooling changes there, align derivative templates such as `bun-library-solana-kit` unless an upstream compatibility constraint prevents it.
- Do not add or widen a peer unless the generated package truly depends on that host package. When a real peer exists, do not force its range ahead of upstream support; keep it aligned with the actually supported versions and note any constraint in the PR.
- Fix required source or config changes that fall directly out of the package update in the same template. Example: deprecation-driven import renames or explicit `types` config needed after a TypeScript upgrade.
- Prefer `bun add` or `bun update` to discover current versions, then rewrite direct dependencies to exact pins before finishing.
- Regenerate `bun.lock` with `bun install` after manifest changes.
- Re-run the template's validation after package updates. For library templates, run `bun run ci` and `bun x publint`.

### Clean Git After Install

After scaffolding with `--skip-install`, running `bun install` must leave a **clean git branch** (no modified files). This means:
- `bun.lock` must be up to date and committed
- `package.json` versions must be pinned (not `latest`)
- Install lifecycle scripts must not create or modify project files in the generated repo, including ignored files such as `.env`

### Template Classes

Classify each template before applying file requirements:

#### Library/Package Templates

- Include `.changeset/README.md` and `.changeset/config.json` for the changeset workflow
- **Do not include any actual changeset files** (e.g. `add-some-feature.md`) — those are for the template's development, not the generated project
- Include `README.md`, `LICENSE`, `.gitignore`, `.bun-version`, `tsconfig.json`, `tsdown.config.ts`, `.github/workflows/ci.yaml`, `.github/workflows/publish.yaml`, and `.ruler/` with `AGENTS.md` and `ruler.toml`
- Include a linting/formatting setup such as Biome, Oxlint/Oxfmt, or ESLint/Prettier

#### App/Monorepo Templates

- Include `README.md`, `LICENSE`, `.gitignore`, `.bun-version`, `bun.lock`, `package.json`, and `.github/workflows/ci.yaml`
- Include a linting/formatting setup such as Biome, Oxlint/Oxfmt, or ESLint/Prettier
- Include the workspace/build config the project actually uses (for example `turbo.json`, app/package `tsconfig.json`, Vite config, Docker files, or env examples)
- If the template uses env vars, commit `.env.example` files and ignore `.env`
- Do **not** add library-only assets when they do not fit the architecture; app/monorepo templates may omit `.changeset/`, `.github/workflows/publish.yaml`, `.ruler/`, root `tsconfig.json`, and root `tsdown.config.ts`

### README Guidelines

- Document features, usage, CLI (if any), and development commands
- Do not require a `create-seed` install command in template READMEs; optimize the README for the generated project first, and only mention scaffolding when it materially improves the generated project's docs
- The README should make sense as a **standalone project** — don't reference other templates or this repo
- Avoid "this is a template" framing in generated-project READMEs
- Avoid scaffolding-first instructions unless they materially improve the generated project's docs
- Use the template name as the heading

## Registry (`templates.json`)

The registry maps short names to template paths for `create-seed`:

```json
{
  "templates": [
    {
      "description": "Short description",
      "id": "gh:create-seed/templates/<dir-name>",
      "name": "<short-name>",
      "path": "<dir-name>"
    }
  ]
}
```

- `name` is the short name users pass to `-t` (e.g. `bun-library`)
- `id` is the full `gh:` reference
- `path` is the directory name in this repo

### Validation

```bash
bun run validate   # validates templates.json structure
bun run generate   # regenerates templates.json from template directories
```

## Testing Templates

Before submitting a PR, test the template from the branch:

```bash
# Scaffold from the PR branch (skip install to test separately)
bun x create-seed@latest test-app -t gh:<your-fork>/templates/<dir-name>#<branch> --skip-install

# Install and verify clean git
cd test-app
bun install
git status  # should show nothing
```

## Workflow

- Fork the repo and create a descriptive branch (e.g. `add-new-template`)
- One PR per template or cross-cutting change
- When updating shared config across templates (e.g. pinning `@types/bun`), update **all templates** in the same PR

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

- **Never use `latest` as a version** for any dependency. Always pin to a specific version (e.g. `^1.3.9`). Run `bun add <pkg>` to get the current version resolved automatically.
- **Always commit `bun.lock`** — lockfiles ensure deterministic installs and a clean git branch after `bun install`.

### Clean Git After Install

After scaffolding with `--skip-install`, running `bun install` must leave a **clean git branch** (no modified files). This means:
- `bun.lock` must be up to date and committed
- `package.json` versions must be pinned (not `latest`)
- No post-install scripts that modify tracked files

### Changesets

- Include `.changeset/README.md` and `.changeset/config.json` for the changeset workflow
- **Do not include any actual changeset files** (e.g. `add-some-feature.md`) — those are for the template's development, not the generated project

### Files That Should Exist

- `README.md` — standalone, no references to other templates or this repo
- `LICENSE`
- `.gitignore` (include `.env` if the template uses env vars)
- `.bun-version`
- `biome.json`
- `tsconfig.json`
- `tsdown.config.ts`
- `.github/workflows/ci.yaml` and `publish.yaml`
- `.ruler/` directory with `AGENTS.md` and `ruler.toml`

### README Guidelines

- Document features, usage, CLI (if any), and development commands
- Do not require a `create-seed` install command in template READMEs; optimize the README for the generated project first, and only mention scaffolding when it materially improves the generated project's docs
- The README should make sense as a **standalone project** — don't reference other templates or this repo
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

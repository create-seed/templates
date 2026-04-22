# AGENTS.md

## Architecture

- Keep `*-feature-*` files as the orchestration layer between `data-access` and `ui`.
- Keep `core` for app-wide wiring such as providers.
- Keep `data-access` for queries, mutations, persistence, theming hooks, and other side effects.
- Keep `src/app` outside the feature tree as the thin Expo Router layer.
- Keep `ui` presentational; route parsing, storage, queries, and mutations stay out of `ui`. Declarative navigation via simple `expo-router` `Link` components with static `href` values is allowed, but imperative or state-derived navigation stays in feature or route layers.
- Keep `utils` rare and limited to pure helpers.
- Keep auth gating in `src/app/_layout.tsx` with `Stack.Protected`.
- Keep public entry in `src/app/index.tsx` and authenticated routes in `src/app/(app)/`.
- Keep root headers hidden and set per-screen titles in child route files.
- Keep route files thin: set `Stack.Screen` options there and render a single feature component.

## Providers

- Keep the app-wide UI provider and shared query provider in `src/features/core/data-access/app-providers.tsx`.

## Components

- Do not add business logic to UI components; use hooks and/or useQuery/useMutation instead.
- Do not create a dedicated props interface for a component with three or fewer props; inline the prop type instead.

## State Management

- Keep AsyncStorage access in `src/features/auth/data-access/auth-storage.ts`.
- Avoid `useEffect` unless there is no simpler event-driven, derived-state, or library-managed alternative.
- Update auth state through mutations and cache updates instead of manual refresh callbacks or screen-local hydration.
- Use `useMutation` or `useQuery` to own loading and error state for async work instead of ad hoc local flags.

## UX

- Keep a dedicated loading screen while auth state hydrates.

## Dependencies and Docs

- Use `bun install` to add dependencies as it regenerates `bun.lock` after manifest changes.
- Keep `bunfig.toml` with `[install] exact = true`.
- Keep Expo-managed version specifiers in the form returned by `expo install` or `expo install --check`.
- Update README when app flow or developer commands change.

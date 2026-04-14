# bun-expo-uniwind

Expo app built with Bun, Expo Router, HeroUI Native, and Uniwind.

## Features

- Expo Router routes live in `src/app`, with app code organized by feature.
- Uniwind powers light, dark, and system theme switching across the shell.
- HeroUI Native components are wired into the `/dev` route for quick iteration.
- AsyncStorage-backed onboarding state shows one simple client-side data flow.
- ESLint, Prettier, and strict TypeScript checks are included.

## Getting Started

1. Install dependencies.

   ```bash
   bun install
   ```

2. Start the Expo development server.

   ```bash
   bun run start
   ```

3. Open the app on your target platform.

   ```bash
   bun run ios
   bun run android
   bun run web
   ```

## Development Commands

- `bun run start` starts the Expo development server.
- `bun run ios` opens the iOS simulator flow.
- `bun run android` opens the Android emulator flow.
- `bun run web` starts the web target.
- `bun run lint` runs ESLint.
- `bun run lint:fix` runs ESLint with autofix.
- `bun run check-types` runs TypeScript without emitting files.

## Project Structure

- `src/app` contains the Expo Router entrypoints.
- `src/features` holds feature-scoped UI, state, and data-access modules.
- `src/lib/app-providers.tsx` wires global providers into the root layout.
- `src/global.css` is the Uniwind CSS entry file.
- `metro.config.js` connects Uniwind to Metro and generates `src/uniwind-types.d.ts`.

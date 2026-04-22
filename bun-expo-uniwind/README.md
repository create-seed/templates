# bun-expo-uniwind

Expo app built with Bun, Expo Router, HeroUI Native, and Uniwind.

## Features

- Expo Router routes live in `src/app`, with authenticated users landing in a native tab shell.
- Uniwind powers light, dark, and system theme switching across the shell from the Settings tab.
- HeroUI Native components are wired into the Dev tab for quick iteration.
- AsyncStorage-backed auth state shows one simple client-side data flow.
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

## Android APK Workflow Setup

The manual GitHub Actions workflow in `.github/workflows/android-apk.yml` builds a release-signed APK and publishes it as a GitHub prerelease asset for the Android package `com.anonymous.bun_expo_uniwind`.

Run the setup script once from the repository root:

```bash
bun run setup-android-apk.ts
```

The script:

- errors if this git checkout does not have a remote configured
- creates `.secrets/android-upload.keystore` and `.secrets/android-upload.json` on the first run
- fails if only one of those `.secrets/` files is present, because the original signing key cannot be reconstructed
- uploads `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`, `ANDROID_KEYSTORE_BASE64`, and `ANDROID_KEYSTORE_PASSWORD` to the current GitHub repository with `gh`
- reuses the existing `.secrets/` files on reruns so installed APKs can still upgrade cleanly

It requires `gh` and `keytool` on your `PATH`.

After the script succeeds, back up `.secrets/` somewhere safe. If you lose it and create a new keystore later, users with an already-installed APK will not be able to upgrade over the top of it.

Then trigger a build for the current branch:

```bash
gh workflow run android-apk.yml --ref "$(git branch --show-current)"
gh run watch "$(gh run list --workflow android-apk.yml --limit 1 --json databaseId --jq '.[0].databaseId')" --exit-status
```

Each successful run uploads a direct-download APK asset to the daily `android-dev-YYYY-MM-DD` prerelease using a filename like `bun-expo-uniwind-YYYY-MM-DD-run-123456789-attempt-1.apk`, where the numeric segments are the GitHub Actions run ID and run attempt.

## Project Structure

- `src/app` contains the Expo Router entrypoints, including the authenticated Home, Dev, and Settings tabs.
- `src/features` holds feature-scoped UI, state, and data-access modules.
- `src/features/core/data-access/app-providers.tsx` wires global providers into the root layout.
- `src/global.css` is the Uniwind CSS entry file.
- `metro.config.js` connects Uniwind to Metro and generates `src/uniwind-types.d.ts`.

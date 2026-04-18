import { spawnSync } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { relative, resolve } from 'node:path'

type AppConfig = {
  expo?: {
    android?: {
      package?: string
    }
  }
}

type SetupMetadata = {
  createdAt: string
  keyAlias: string
  keyPassword: string
  keystorePassword: string
  packageName: string
}

type SigningFiles = {
  freshlyCreated: boolean
  metadata: SetupMetadata
}

const APP_CONFIG_PATH = resolve('app.json')
const REQUIRED_SECRET_NAMES = [
  'ANDROID_KEY_ALIAS',
  'ANDROID_KEY_PASSWORD',
  'ANDROID_KEYSTORE_BASE64',
  'ANDROID_KEYSTORE_PASSWORD',
] as const
const HELP_TEXT = `
Usage: bun run setup-android-apk.ts

Creates or reuses the local Android release keystore, uploads the required GitHub
Actions secrets for .github/workflows/android-apk.yml, and prints the next
commands to trigger the APK workflow.
`.trim()
const KEY_ALIAS = 'android-upload'
const SECRETS_DIR = resolve('.secrets')
const KEYSTORE_PATH = resolve(SECRETS_DIR, 'android-upload.keystore')
const METADATA_PATH = resolve(SECRETS_DIR, 'android-upload.json')

main()

function createKeystore(metadata: SetupMetadata) {
  run(
    'keytool',
    [
      '-genkeypair',
      '-v',
      '-alias',
      metadata.keyAlias,
      '-dname',
      'CN=Android APK, OU=Development, O=Anonymous, L=Local, S=Local, C=US',
      '-keyalg',
      'RSA',
      '-keypass',
      metadata.keyPassword,
      '-keysize',
      '2048',
      '-keystore',
      KEYSTORE_PATH,
      '-noprompt',
      '-storepass',
      metadata.keystorePassword,
      '-validity',
      '10000',
    ],
    { capture: false },
  )

  chmodSync(KEYSTORE_PATH, 0o600)
}

function createMetadata(appPackage: string): SetupMetadata {
  const password = randomBytes(24).toString('hex')

  return {
    createdAt: new Date().toISOString(),
    keyAlias: KEY_ALIAS,
    keyPassword: password,
    keystorePassword: password,
    packageName: appPackage,
  }
}

function displayPath(path: string) {
  const relativePath = relative(process.cwd(), path)
  return relativePath === '' ? '.' : relativePath
}

function ensureCommandAvailable(command: string, args: string[]) {
  try {
    run(command, args)
  } catch (error) {
    fail((error as Error).message)
  }
}

function ensureGitHubSecrets(freshlyCreated: boolean, metadata: SetupMetadata, repo: string) {
  const existingSecretNames = listSecretNames()
  const secretValues = {
    ANDROID_KEY_ALIAS: metadata.keyAlias,
    ANDROID_KEY_PASSWORD: metadata.keyPassword,
    ANDROID_KEYSTORE_BASE64: readFileSync(KEYSTORE_PATH).toString('base64'),
    ANDROID_KEYSTORE_PASSWORD: metadata.keystorePassword,
  }
  const missingSecretNames = REQUIRED_SECRET_NAMES.filter((name) => !existingSecretNames.has(name))

  if (freshlyCreated) {
    console.log(`Uploading GitHub Actions secrets for ${repo}`)

    for (const name of REQUIRED_SECRET_NAMES) {
      setSecret(name, secretValues[name])
    }

    return
  }

  if (missingSecretNames.length === 0) {
    console.log(`Verified GitHub Actions secrets for ${repo}`)
    return
  }

  console.log(`Configuring missing GitHub Actions secrets for ${repo}`)

  for (const name of missingSecretNames) {
    setSecret(name, secretValues[name])
  }
}

function ensureGitRemote() {
  const remotes = run('git', ['remote'])
    .split('\n')
    .map((remote) => remote.trim())
    .filter(Boolean)

  if (remotes.length === 0) {
    fail('No git remote is configured for this checkout. Add a remote before running setup-android-apk.ts.')
  }
}

function ensureSigningFiles(appPackage: string): SigningFiles {
  const keystoreExists = existsSync(KEYSTORE_PATH)
  const metadataExists = existsSync(METADATA_PATH)

  if (keystoreExists && !metadataExists) {
    fail(
      `Found ${displayPath(KEYSTORE_PATH)} without ${displayPath(METADATA_PATH)}. Restore the original metadata backup before rerunning setup-android-apk.ts. If you intentionally want a new signing identity instead, remove .secrets/ and run setup-android-apk.ts again.`,
    )
  }

  if (keystoreExists && metadataExists) {
    const metadata = readMetadata()

    if (metadata.packageName !== appPackage) {
      fail(
        `Existing signing metadata is for ${metadata.packageName}, but this project expects ${appPackage}. Remove .secrets/ and rerun only if you intentionally want a new signing identity.`,
      )
    }

    console.log(`Reusing existing signing files from ${displayPath(SECRETS_DIR)}/`)
    return { freshlyCreated: false, metadata }
  }

  if (metadataExists) {
    const metadata = readMetadata()

    if (metadata.packageName !== appPackage) {
      fail(
        `Existing signing metadata is for ${metadata.packageName}, but this project expects ${appPackage}. Remove .secrets/ and rerun only if you intentionally want a new signing identity.`,
      )
    }

    fail(
      `Found ${displayPath(METADATA_PATH)} without ${displayPath(KEYSTORE_PATH)}. Restore the original keystore backup before rerunning setup-android-apk.ts; generating a new keystore would change the signing identity and break upgrades for installed APKs.`,
    )
  }

  ensureCommandAvailable('keytool', ['-help'])
  mkdirSync(SECRETS_DIR, { recursive: true })
  chmodSync(SECRETS_DIR, 0o700)

  const metadata = createMetadata(appPackage)

  console.log(`Creating release keystore at ${displayPath(KEYSTORE_PATH)}`)
  createKeystore(metadata)

  writeFileSync(METADATA_PATH, `${JSON.stringify(metadata, null, 2)}\n`)
  chmodSync(METADATA_PATH, 0o600)

  return { freshlyCreated: true, metadata }
}

function fail(message: string): never {
  console.error(`Error: ${message}`)
  process.exit(1)
}

function listSecretNames() {
  const output = run('gh', ['secret', 'list', '--app', 'actions', '--json', 'name'])
  const secrets = JSON.parse(output) as { name?: string }[]

  return new Set(secrets.map((secret) => secret.name).filter((name): name is string => Boolean(name)))
}

function main() {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(HELP_TEXT)
    return
  }

  ensureGitRemote()

  const appPackage = readAppPackage()
  const repo = run('gh', ['repo', 'view', '--json', 'nameWithOwner', '--jq', '.nameWithOwner'])
  const branch = run('git', ['branch', '--show-current'])
  const { freshlyCreated, metadata } = ensureSigningFiles(appPackage)
  ensureGitHubSecrets(freshlyCreated, metadata, repo)

  console.log('\nSetup complete.')
  console.log(`Back up ${displayPath(SECRETS_DIR)}/ if you want to keep using this signing identity later.`)
  console.log(`Local files: ${displayPath(KEYSTORE_PATH)}, ${displayPath(METADATA_PATH)}`)

  if (branch) {
    console.log('\nNext steps:')
    console.log(`gh workflow run android-apk.yml --ref "${branch}"`)
    console.log(
      `gh run watch "$(gh run list --workflow android-apk.yml --limit 1 --json databaseId --jq '.[0].databaseId')" --exit-status`,
    )
  }
}

function readAppPackage() {
  const config = JSON.parse(readFileSync(APP_CONFIG_PATH, 'utf8')) as AppConfig
  const packageName = config.expo?.android?.package

  if (!packageName) {
    fail('app.json must define expo.android.package before running setup-android-apk.ts.')
  }

  return packageName
}

function readMetadata(): SetupMetadata {
  const metadata = JSON.parse(readFileSync(METADATA_PATH, 'utf8')) as Partial<SetupMetadata>

  if (
    typeof metadata.createdAt !== 'string' ||
    typeof metadata.keyAlias !== 'string' ||
    typeof metadata.keyPassword !== 'string' ||
    typeof metadata.keystorePassword !== 'string' ||
    typeof metadata.packageName !== 'string'
  ) {
    fail(`Invalid signing metadata in ${displayPath(METADATA_PATH)}.`)
  }

  return metadata as SetupMetadata
}

function run(command: string, args: string[], options: { capture?: boolean; input?: string } = {}) {
  const capture = options.capture ?? true
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    input: options.input,
    stdio: capture ? 'pipe' : ['pipe', 'inherit', 'inherit'],
  })

  if (result.error) {
    const maybeErrno = result.error as NodeJS.ErrnoException

    if (maybeErrno.code === 'ENOENT') {
      fail(`${command} is required on PATH.`)
    }

    throw result.error
  }

  if (result.status !== 0) {
    const stderr = result.stderr?.trim()
    fail(stderr || `${command} ${args.join(' ')} failed.`)
  }

  if (!capture) {
    return ''
  }

  return result.stdout.trim()
}

function setSecret(name: string, value: string) {
  console.log(`Setting ${name}`)
  run('gh', ['secret', 'set', name], { capture: false, input: value })
}

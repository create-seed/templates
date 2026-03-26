import { afterAll, beforeAll, describe, expect, test } from 'bun:test'
import { asc, eq } from 'drizzle-orm'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const DB_PACKAGE_DIR = resolve(import.meta.dir, '..')
const ALICE_EMAIL = 'alice@example.com'
const ALICE_NAME = 'Alice'
const BOB_EMAIL = 'bob@example.com'
const BOB_NAME = 'Bob'
const CAROL_EMAIL = 'carol@example.com'
const CAROL_NAME = 'Carol'
const PRIMARY_ORGANIZATION_SLUG = 'acme'
const SEED_SKIPPED_MESSAGE = 'Skipping local development seed because existing user or organization data was found.'
const SECONDARY_ORGANIZATION_SLUG = 'beacon'

let tempDir = ''

function getOrganizationIdsBySlug(
  organizations: Array<{
    id: string
    slug: string
  }>,
) {
  return Object.fromEntries(
    organizations
      .map((organization) => [organization.slug, organization.id] as const)
      .sort(([left], [right]) => left.localeCompare(right)),
  )
}

function toSeedTodoRows(
  devSeed: Awaited<typeof import('../src/seed.ts')>['devSeed'],
  organizationIdsBySlug: Record<string, string>,
) {
  return devSeed.todos.map((entry) => ({
    completed: entry.completed,
    id: entry.id,
    organizationId: organizationIdsBySlug[entry.organizationSlug],
    text: entry.text,
  }))
}

function decodeOutput(buffer: Uint8Array | undefined) {
  return buffer ? Buffer.from(buffer).toString('utf8').trim() : ''
}

function createDatabaseUrl(filename: string) {
  return pathToFileURL(resolve(tempDir, filename)).toString()
}

function createSeedEnv(databaseAuthToken: string, databaseUrl: string, envOverrides: Record<string, string> = {}) {
  return {
    ...process.env,
    BETTER_AUTH_ADMIN_EMAILS: '',
    BETTER_AUTH_SECRET: '12345678901234567890123456789012',
    BETTER_AUTH_URL: 'http://localhost:3000',
    CORS_ORIGINS: 'http://localhost:3001',
    DATABASE_AUTH_TOKEN: databaseAuthToken,
    DATABASE_URL: databaseUrl,
    DEV_SEED_PASSWORD: 'password123',
    NODE_ENV: 'test',
    POLAR_ACCESS_TOKEN: '',
    POLAR_SUCCESS_URL: 'http://localhost:3001/success',
    ...envOverrides,
  }
}

function runSeedScript(databaseAuthToken: string, databaseUrl: string, envOverrides: Record<string, string> = {}) {
  return Bun.spawnSync({
    cmd: ['bun', 'run', 'src/seed.ts'],
    cwd: DB_PACKAGE_DIR,
    env: createSeedEnv(databaseAuthToken, databaseUrl, envOverrides),
    stderr: 'pipe',
    stdout: 'pipe',
  })
}

function syncDatabase(databaseUrl: string, databaseAuthToken = 'test-token') {
  const result = Bun.spawnSync({
    cmd: ['bun', 'run', 'db:push', '--force'],
    cwd: DB_PACKAGE_DIR,
    env: {
      ...process.env,
      DATABASE_AUTH_TOKEN: databaseAuthToken,
      DATABASE_URL: databaseUrl,
    },
    stderr: 'pipe',
    stdout: 'pipe',
  })

  if (result.exitCode !== 0) {
    const stderr = decodeOutput(result.stderr)
    const stdout = decodeOutput(result.stdout)

    throw new Error(`Failed to sync the test database.\n${stdout}\n${stderr}`)
  }
}

async function executeStatement(databaseUrl: string, statement: string, databaseAuthToken = 'test-token') {
  const { createClient } = await import('@libsql/client')
  const client = createClient({
    authToken: databaseAuthToken,
    url: databaseUrl,
  })

  await client.execute(statement)
}

async function getTableCount(databaseUrl: string, tableName: string, databaseAuthToken = 'test-token') {
  const { createClient } = await import('@libsql/client')
  const client = createClient({
    authToken: databaseAuthToken,
    url: databaseUrl,
  })
  const result = await client.execute(`select count(*) as count from ${tableName}`)

  return Number(result.rows[0]?.count ?? 0)
}

function restoreEnvVar(name: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[name]
    return
  }

  process.env[name] = value
}

beforeAll(() => {
  tempDir = mkdtempSync(resolve(tmpdir(), 'bun-platform-db-seed-'))

  const databaseUrl = pathToFileURL(resolve(tempDir, 'test.sqlite')).toString()

  process.env.BETTER_AUTH_ADMIN_EMAILS = ''
  process.env.BETTER_AUTH_SECRET = '12345678901234567890123456789012'
  process.env.BETTER_AUTH_URL = 'http://localhost:3000'
  process.env.CORS_ORIGINS = 'http://localhost:3001'
  process.env.DATABASE_AUTH_TOKEN = 'test-token'
  process.env.DATABASE_URL = databaseUrl
  process.env.DEV_SEED_PASSWORD = 'password123'
  process.env.NODE_ENV = 'test'
  process.env.POLAR_ACCESS_TOKEN = ''
  process.env.POLAR_SUCCESS_URL = 'http://localhost:3001/success'

  syncDatabase(databaseUrl)
})

afterAll(() => {
  if (tempDir) {
    rmSync(tempDir, {
      force: true,
      recursive: true,
    })
  }
})

describe('seedDatabase', () => {
  test('creates the baseline dataset without pre-seeding sessions', async () => {
    const { devSeed, seedDatabase } = await import('../src/seed.ts')
    const summary = await seedDatabase()
    const [{ auth }, { db }, authSchema, todoSchema] = await Promise.all([
      import('../../auth/src/index.ts'),
      import('../src/index.ts'),
      import('../src/schema/auth.ts'),
      import('../src/schema/todo.ts'),
    ])
    const seedMemberships = await db
      .select({
        email: authSchema.user.email,
        organizationSlug: authSchema.organization.slug,
        role: authSchema.member.role,
      })
      .from(authSchema.member)
      .innerJoin(authSchema.organization, eq(authSchema.member.organizationId, authSchema.organization.id))
      .innerJoin(authSchema.user, eq(authSchema.member.userId, authSchema.user.id))
      .orderBy(asc(authSchema.organization.slug), asc(authSchema.user.email))
    const organizations = await db
      .select({
        id: authSchema.organization.id,
        metadata: authSchema.organization.metadata,
        name: authSchema.organization.name,
        slug: authSchema.organization.slug,
      })
      .from(authSchema.organization)
      .orderBy(asc(authSchema.organization.slug))
    const sessions = await db
      .select({
        id: authSchema.session.id,
      })
      .from(authSchema.session)
    const todos = await db.select().from(todoSchema.todo).orderBy(asc(todoSchema.todo.text))
    const users = await db
      .select({
        email: authSchema.user.email,
        name: authSchema.user.name,
        role: authSchema.user.role,
      })
      .from(authSchema.user)
      .orderBy(asc(authSchema.user.email))
    const organizationIdsBySlug = getOrganizationIdsBySlug(organizations)

    expect(summary.skipped).toBe(false)

    if (summary.skipped) {
      throw new Error('Expected the initial seed to populate the empty database.')
    }

    expect(summary.organizationId.length).toBeGreaterThan(0)
    expect(summary.organizationCount).toBe(devSeed.organizations.length)
    expect(summary.organizationIdsBySlug).toEqual(organizationIdsBySlug)
    expect(seedMemberships).toEqual([
      {
        email: ALICE_EMAIL,
        organizationSlug: PRIMARY_ORGANIZATION_SLUG,
        role: 'admin',
      },
      {
        email: BOB_EMAIL,
        organizationSlug: PRIMARY_ORGANIZATION_SLUG,
        role: 'owner',
      },
      {
        email: ALICE_EMAIL,
        organizationSlug: SECONDARY_ORGANIZATION_SLUG,
        role: 'admin',
      },
      {
        email: CAROL_EMAIL,
        organizationSlug: SECONDARY_ORGANIZATION_SLUG,
        role: 'owner',
      },
    ])
    expect(organizations.map(({ metadata, name, slug }) => ({ metadata, name, slug }))).toEqual(
      devSeed.organizations.map((organization) => ({
        metadata: organization.metadata,
        name: organization.name,
        slug: organization.slug,
      })),
    )
    expect(sessions).toHaveLength(0)
    expect(todos).toEqual(toSeedTodoRows(devSeed, organizationIdsBySlug))
    expect(users).toEqual([
      {
        email: ALICE_EMAIL,
        name: ALICE_NAME,
        role: 'admin',
      },
      {
        email: BOB_EMAIL,
        name: BOB_NAME,
        role: 'user',
      },
      {
        email: CAROL_EMAIL,
        name: CAROL_NAME,
        role: 'user',
      },
    ])

    await expect(
      auth.api.signInEmail({
        body: {
          email: ALICE_EMAIL,
          password: process.env.DEV_SEED_PASSWORD!,
        },
      }),
    ).resolves.toMatchObject({
      user: {
        email: ALICE_EMAIL,
        role: 'admin',
      },
    })
    await expect(
      auth.api.signInEmail({
        body: {
          email: BOB_EMAIL,
          password: process.env.DEV_SEED_PASSWORD!,
        },
      }),
    ).resolves.toMatchObject({
      user: {
        email: BOB_EMAIL,
        role: 'user',
      },
    })
    await expect(
      auth.api.signInEmail({
        body: {
          email: CAROL_EMAIL,
          password: process.env.DEV_SEED_PASSWORD!,
        },
      }),
    ).resolves.toMatchObject({
      user: {
        email: CAROL_EMAIL,
        role: 'user',
      },
    })
  })

  test('returns a skipped result when the current database is already initialized', async () => {
    const { seedDatabase } = await import('../src/seed.ts')
    const result = await seedDatabase()

    expect(result).toEqual({
      skipped: true,
    })
  })

  test('skips when a user row already exists', async () => {
    const databaseUrl = createDatabaseUrl('skip-user.sqlite')

    syncDatabase(databaseUrl)
    await executeStatement(
      databaseUrl,
      `insert into user (email, id, name) values ('manual-user@example.com', 'manual-user', 'Manual User')`,
    )

    const result = runSeedScript('test-token', databaseUrl)
    const output = [decodeOutput(result.stdout), decodeOutput(result.stderr)].join('\n')

    expect(result.exitCode).toBe(0)
    expect(output).toContain(SEED_SKIPPED_MESSAGE)
    expect(await getTableCount(databaseUrl, 'organization')).toBe(0)
    expect(await getTableCount(databaseUrl, 'todo')).toBe(0)
    expect(await getTableCount(databaseUrl, 'user')).toBe(1)
  })

  test('skips when an organization row already exists', async () => {
    const databaseUrl = createDatabaseUrl('skip-organization.sqlite')

    syncDatabase(databaseUrl)
    await executeStatement(
      databaseUrl,
      `insert into organization (id, name, slug) values ('manual-organization', 'Manual Organization', 'manual-organization')`,
    )

    const result = runSeedScript('test-token', databaseUrl)
    const output = [decodeOutput(result.stdout), decodeOutput(result.stderr)].join('\n')

    expect(result.exitCode).toBe(0)
    expect(output).toContain(SEED_SKIPPED_MESSAGE)
    expect(await getTableCount(databaseUrl, 'organization')).toBe(1)
    expect(await getTableCount(databaseUrl, 'todo')).toBe(0)
    expect(await getTableCount(databaseUrl, 'user')).toBe(0)
  })

  test('still seeds when unrelated verification data already exists', async () => {
    const databaseUrl = createDatabaseUrl('seed-with-verification.sqlite')

    syncDatabase(databaseUrl)
    await executeStatement(
      databaseUrl,
      `insert into verification (expires_at, id, identifier, value) values (0, 'verification-1', 'manual@example.com', 'token')`,
    )

    const result = runSeedScript('test-token', databaseUrl)
    const output = [decodeOutput(result.stdout), decodeOutput(result.stderr)].join('\n')

    expect(result.exitCode).toBe(0)
    expect(output).toContain('Seeded local development data.')
    expect(output).not.toContain(SEED_SKIPPED_MESSAGE)
    expect(await getTableCount(databaseUrl, 'organization')).toBe(2)
    expect(await getTableCount(databaseUrl, 'todo')).toBe(4)
    expect(await getTableCount(databaseUrl, 'user')).toBe(3)
    expect(await getTableCount(databaseUrl, 'verification')).toBe(1)
  })

  test('rejects non-local database urls before loading the runtime', async () => {
    const { seedDatabase } = await import('../src/seed.ts')
    const previousDatabaseAuthToken = process.env.DATABASE_AUTH_TOKEN
    const previousDatabaseUrl = process.env.DATABASE_URL
    const previousNodeEnv = process.env.NODE_ENV

    process.env.DATABASE_AUTH_TOKEN = 'no-token'
    process.env.DATABASE_URL = 'https://example.turso.io'
    process.env.NODE_ENV = 'development'

    try {
      await expect(seedDatabase()).rejects.toThrow('db:seed only supports local DATABASE_URL values.')
    } finally {
      restoreEnvVar('DATABASE_AUTH_TOKEN', previousDatabaseAuthToken)
      restoreEnvVar('DATABASE_URL', previousDatabaseUrl)
      restoreEnvVar('NODE_ENV', previousNodeEnv)
    }
  })

  test('rejects remote file database urls before loading the runtime', async () => {
    const { seedDatabase } = await import('../src/seed.ts')
    const previousDatabaseAuthToken = process.env.DATABASE_AUTH_TOKEN
    const previousDatabaseUrl = process.env.DATABASE_URL
    const previousNodeEnv = process.env.NODE_ENV

    process.env.DATABASE_AUTH_TOKEN = 'no-token'
    process.env.DATABASE_URL = 'file://fileserver/share/dev.sqlite'
    process.env.NODE_ENV = 'development'

    try {
      await expect(seedDatabase()).rejects.toThrow('db:seed only supports local DATABASE_URL values.')
    } finally {
      restoreEnvVar('DATABASE_AUTH_TOKEN', previousDatabaseAuthToken)
      restoreEnvVar('DATABASE_URL', previousDatabaseUrl)
      restoreEnvVar('NODE_ENV', previousNodeEnv)
    }
  })

  test('rejects localhost network databases that still require auth tokens', async () => {
    const { seedDatabase } = await import('../src/seed.ts')
    const previousDatabaseAuthToken = process.env.DATABASE_AUTH_TOKEN
    const previousDatabaseUrl = process.env.DATABASE_URL
    const previousNodeEnv = process.env.NODE_ENV

    process.env.DATABASE_AUTH_TOKEN = 'proxy-token'
    process.env.DATABASE_URL = 'http://localhost:8080'
    process.env.NODE_ENV = 'development'

    try {
      await expect(seedDatabase()).rejects.toThrow(
        'db:seed only supports local network DATABASE_URL values when DATABASE_AUTH_TOKEN=no-token.',
      )
    } finally {
      restoreEnvVar('DATABASE_AUTH_TOKEN', previousDatabaseAuthToken)
      restoreEnvVar('DATABASE_URL', previousDatabaseUrl)
      restoreEnvVar('NODE_ENV', previousNodeEnv)
    }
  })

  test('allows the no-token fallback before local network validation', () => {
    const result = runSeedScript('', 'http://127.0.0.1:65535')
    const output = [decodeOutput(result.stdout), decodeOutput(result.stderr)].join('\n')

    expect(result.exitCode).not.toBe(0)
    expect(output).not.toContain(
      'db:seed only supports local network DATABASE_URL values when DATABASE_AUTH_TOKEN=no-token.',
    )
  })

  test('supports file database urls without requiring a database auth token', () => {
    const databaseUrl = createDatabaseUrl('file-tokenless.sqlite')

    syncDatabase(databaseUrl, 'no-token')

    const result = runSeedScript('', databaseUrl)

    expect(result.exitCode).toBe(0)
  })

  test('removes the bootstrap admin after a seed failure on an empty database', () => {
    const databaseUrl = createDatabaseUrl('seed-auth-failure.sqlite')

    syncDatabase(databaseUrl)

    const result = Bun.spawnSync({
      cmd: [
        'bun',
        '-e',
        [
          `const { auth } = await import("../auth/src/index.ts");`,
          `const originalSignUpEmail = auth.api.signUpEmail;`,
          `let signUpCount = 0;`,
          `auth.api.signUpEmail = (async (...args) => {`,
          `  signUpCount += 1;`,
          `  if (signUpCount > 1) {`,
          `    throw new Error("Injected signUpEmail failure.");`,
          `  }`,
          `  return await originalSignUpEmail(...args);`,
          `}) as typeof auth.api.signUpEmail;`,
          `const { createClient } = await import("@libsql/client");`,
          `const { seedDatabase } = await import("./src/seed.ts");`,
          `let didFail = false;`,
          `try {`,
          `  await seedDatabase();`,
          `} catch (error) {`,
          `  didFail = true;`,
          `  console.error(error instanceof Error ? error.message : String(error));`,
          `}`,
          `if (!didFail) {`,
          `  process.exit(1);`,
          `}`,
          `const client = createClient({ authToken: process.env.DATABASE_AUTH_TOKEN!, url: process.env.DATABASE_URL! });`,
          `const rows = await client.execute("select count(*) as count from user where email = 'db-seed-bootstrap@example.com'");`,
          `console.log(JSON.stringify({ bootstrapCount: Number(rows.rows[0]?.count ?? 0) }));`,
        ].join('\n'),
      ],
      cwd: DB_PACKAGE_DIR,
      env: createSeedEnv('test-token', databaseUrl),
      stderr: 'pipe',
      stdout: 'pipe',
    })
    const output = [decodeOutput(result.stdout), decodeOutput(result.stderr)].join('\n')

    expect(result.exitCode).toBe(0)
    expect(output).toContain('Injected signUpEmail failure.')
    expect(output).toContain('"bootstrapCount":0')
  })

  test('normalizes freshly created seed users after wildcard admin signup hooks', () => {
    const databaseUrl = createDatabaseUrl('wildcard-admin.sqlite')

    syncDatabase(databaseUrl)
    const seedResult = runSeedScript('test-token', databaseUrl, {
      BETTER_AUTH_ADMIN_EMAILS: '*@example.com',
    })
    const result = Bun.spawnSync({
      cmd: [
        'bun',
        '-e',
        [
          'const { createClient } = await import("@libsql/client");',
          'const client = createClient({ authToken: "test-token", url: process.env.DATABASE_URL! });',
          'const rows = await client.execute("select email, role from user order by email");',
          'console.log(JSON.stringify(rows.rows));',
        ].join(' '),
      ],
      cwd: DB_PACKAGE_DIR,
      env: {
        ...process.env,
        DATABASE_AUTH_TOKEN: 'test-token',
        DATABASE_URL: databaseUrl,
      },
      stderr: 'pipe',
      stdout: 'pipe',
    })

    expect(seedResult.exitCode).toBe(0)
    expect(result.exitCode).toBe(0)
    expect(decodeOutput(result.stdout)).toContain(`"email":"${BOB_EMAIL}","role":"user"`)
  })
})

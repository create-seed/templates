import { createAuthClient } from 'better-auth/client'
import { afterAll, beforeAll, describe, expect, test } from 'bun:test'
import { mkdtempSync, rmSync } from 'node:fs'
import { createServer } from 'node:net'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

import { createOrpcClient, type OrpcClient, type OrpcClientFetch } from '../src/index'

const ALICE_EMAIL = 'alice@example.com'
const ALICE_NAME = 'Alice'
const BOB_EMAIL = 'bob@example.com'
const BOB_NAME = 'Bob'
const BOB_ORGANIZATION_NAME = 'Bob Org'
const BOB_ORGANIZATION_SLUG = 'bob-org'
const BOB_TODO_TEXT = 'Bob todo'
const CAROL_EMAIL = 'carol@example.com'
const CAROL_NAME = 'Carol'
const CAROL_ORGANIZATION_NAME = 'Carol Org'
const CAROL_ORGANIZATION_SLUG = 'carol-org'
const CAROL_TODO_TEXT = 'Carol todo'
const ORGANIZATION_NAME = 'Acme'
const ORGANIZATION_SLUG = 'acme'
const ROOT_DIR = resolve(import.meta.dir, '..', '..', '..')
const DB_PACKAGE_DIR = resolve(ROOT_DIR, 'packages', 'db')
const USER_PASSWORD = 'password123'

type SessionClients = {
  authClient: ReturnType<typeof createAuthClient>
  client: OrpcClient
}

type DatabaseClient = (typeof import('@bun-platform/db'))['db']
type TodoTable = (typeof import('@bun-platform/db/schema/todo'))['todo']

let adminSession: SessionClients
let anonymousClient: OrpcClient
let baseUrl = ''
let bobSession: SessionClients
let carolSession: SessionClients
let database: DatabaseClient
let server: Bun.Server<unknown> | undefined
let tempDir = ''
let todoTable: TodoTable

function buildCookieHeader(cookieJar: Map<string, string>) {
  return [...cookieJar.values()].sort((left, right) => left.localeCompare(right)).join('; ')
}

function createCookieFetch(): OrpcClientFetch {
  const cookieJar = new Map<string, string>()

  return async (input, init) => {
    const existingCookieHeader = new Headers(init?.headers).get('cookie')
    const nextHeaders = new Headers(init?.headers)
    const storedCookieHeader = buildCookieHeader(cookieJar)
    const cookieHeader = [existingCookieHeader, storedCookieHeader].filter(Boolean).join('; ')

    if (cookieHeader) {
      nextHeaders.set('cookie', cookieHeader)
    }

    const response = await fetch(input, {
      ...init,
      headers: nextHeaders,
    })
    const setCookies = 'getSetCookie' in response.headers ? response.headers.getSetCookie() : []

    for (const setCookie of setCookies) {
      const firstSegment = setCookie.split(';', 1)[0] ?? ''
      const separatorIndex = firstSegment.indexOf('=')

      if (separatorIndex === -1) {
        continue
      }

      const name = firstSegment.slice(0, separatorIndex).trim()
      const value = firstSegment.slice(separatorIndex + 1).trim()

      if (!name) {
        continue
      }

      cookieJar.set(name, `${name}=${value}`)
    }

    return response
  }
}

function createSessionClients(nextBaseUrl: string): SessionClients {
  const cookieFetch = createCookieFetch()

  return {
    authClient: createAuthClient({
      baseURL: nextBaseUrl,
      fetchOptions: {
        credentials: 'include',
        customFetchImpl: cookieFetch,
      },
    }),
    client: createOrpcClient({
      baseUrl: nextBaseUrl,
      fetch: cookieFetch,
    }),
  }
}

function decodeOutput(buffer: Uint8Array | undefined) {
  return buffer ? Buffer.from(buffer).toString('utf8').trim() : ''
}

async function expectORPCError(
  promise: Promise<unknown>,
  expected: {
    code: string
    message?: string
    status: number
  },
) {
  try {
    await promise
  } catch (error) {
    expect(error).toMatchObject(expected)

    return error
  }

  throw new Error(`Expected promise to reject with ${expected.code}.`)
}

async function getAvailablePort() {
  return await new Promise<number>((resolvePromise, rejectPromise) => {
    const portServer = createServer()

    portServer.on('error', rejectPromise)
    portServer.listen(0, '127.0.0.1', () => {
      const address = portServer.address()

      if (!address || typeof address === 'string') {
        rejectPromise(new Error('Unable to determine an available port.'))
        return
      }

      portServer.close((closeError) => {
        if (closeError) {
          rejectPromise(closeError)
          return
        }

        resolvePromise(address.port)
      })
    })
  })
}

async function signUpAndSignIn(
  authClient: ReturnType<typeof createAuthClient>,
  profile: {
    email: string
    name: string
    password: string
  },
) {
  await authClient.signUp.email({
    email: profile.email,
    name: profile.name,
    password: profile.password,
  })
  await authClient.signIn.email({
    email: profile.email,
    password: profile.password,
  })
}

async function getOwnerCandidateByEmail(email: string) {
  const ownerCandidates = await adminSession.client.adminOrganization.listOwnerCandidates({
    search: email,
  })

  return ownerCandidates.find((entry) => entry.email === email) ?? null
}

function syncDatabase(databaseUrl: string) {
  const result = Bun.spawnSync({
    cmd: ['bun', 'run', 'db:push', '--force'],
    cwd: DB_PACKAGE_DIR,
    env: {
      ...process.env,
      DATABASE_AUTH_TOKEN: 'test-token',
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

beforeAll(async () => {
  const port = await getAvailablePort()

  baseUrl = `http://127.0.0.1:${port}`
  tempDir = mkdtempSync(resolve(tmpdir(), 'bun-platform-sdk-e2e-'))

  const databaseUrl = pathToFileURL(resolve(tempDir, 'test.sqlite')).toString()

  process.env.BETTER_AUTH_ADMIN_EMAILS = ALICE_EMAIL
  process.env.BETTER_AUTH_SECRET = '12345678901234567890123456789012'
  process.env.BETTER_AUTH_URL = baseUrl
  process.env.CORS_ORIGINS = 'http://127.0.0.1:3001'
  process.env.DATABASE_AUTH_TOKEN = 'test-token'
  process.env.DATABASE_URL = databaseUrl
  process.env.NODE_ENV = 'test'
  process.env.POLAR_ACCESS_TOKEN = 'test-token'
  process.env.POLAR_SUCCESS_URL = `${baseUrl}/success`

  ;[{ db: database }, { todo: todoTable }] = await Promise.all([
    import('@bun-platform/db'),
    import('@bun-platform/db/schema/todo'),
  ])

  syncDatabase(databaseUrl)

  const { createApiApp } = await import('@bun-platform/api/app')
  const app = createApiApp()

  server = Bun.serve({
    fetch: app.fetch,
    hostname: '127.0.0.1',
    port,
  })

  adminSession = createSessionClients(baseUrl)
  anonymousClient = createOrpcClient({
    baseUrl,
  })
  bobSession = createSessionClients(baseUrl)
  carolSession = createSessionClients(baseUrl)

  await signUpAndSignIn(adminSession.authClient, {
    email: ALICE_EMAIL,
    name: ALICE_NAME,
    password: USER_PASSWORD,
  })
  await signUpAndSignIn(bobSession.authClient, {
    email: BOB_EMAIL,
    name: BOB_NAME,
    password: USER_PASSWORD,
  })
  await signUpAndSignIn(carolSession.authClient, {
    email: CAROL_EMAIL,
    name: CAROL_NAME,
    password: USER_PASSWORD,
  })
})

afterAll(() => {
  server?.stop(true)

  if (tempDir) {
    rmSync(tempDir, {
      force: true,
      recursive: true,
    })
  }
})

describe('createOrpcClient e2e', () => {
  test('health check succeeds', async () => {
    await expect(anonymousClient.healthCheck()).resolves.toBe('OK')
  })

  test('preserves the base URL pathname when deriving the RPC endpoint', async () => {
    let requestedUrl = ''
    const client = createOrpcClient({
      baseUrl: 'https://example.com/app/',
      fetch: async (input) => {
        requestedUrl = input instanceof Request ? input.url : input.toString()

        throw new Error('stop')
      },
    })

    await expect(client.healthCheck()).rejects.toThrow('stop')
    expect(requestedUrl).toBe('https://example.com/app/rpc/healthCheck')
  })

  test('anonymous access to privateData is rejected', async () => {
    await expectORPCError(anonymousClient.privateData(), {
      code: 'UNAUTHORIZED',
      status: 401,
    })
  })

  test('todo CRUD is scoped to the active organization', async () => {
    await expect(bobSession.client.todo.getAll()).resolves.toEqual([])
    await expectORPCError(
      bobSession.client.todo.create({
        text: BOB_TODO_TEXT,
      }),
      {
        code: 'BAD_REQUEST',
        message: 'No active organization selected.',
        status: 400,
      },
    )

    const bobOwner = await getOwnerCandidateByEmail(BOB_EMAIL)
    const carolOwner = await getOwnerCandidateByEmail(CAROL_EMAIL)

    expect(bobOwner).toBeDefined()
    expect(carolOwner).toBeDefined()

    const bobOrganization = await adminSession.client.adminOrganization.create({
      name: BOB_ORGANIZATION_NAME,
      ownerUserId: bobOwner!.id,
      slug: BOB_ORGANIZATION_SLUG,
    })
    const carolOrganization = await adminSession.client.adminOrganization.create({
      name: CAROL_ORGANIZATION_NAME,
      ownerUserId: carolOwner!.id,
      slug: CAROL_ORGANIZATION_SLUG,
    })

    await expectORPCError(
      bobSession.client.organization.setActive({
        organizationId: carolOrganization.id,
      }),
      {
        code: 'NOT_FOUND',
        status: 404,
      },
    )

    await bobSession.client.organization.setActive({
      organizationId: bobOrganization.id,
    })
    await carolSession.client.organization.setActive({
      organizationId: carolOrganization.id,
    })

    await bobSession.client.todo.create({
      text: BOB_TODO_TEXT,
    })
    await carolSession.client.todo.create({
      text: CAROL_TODO_TEXT,
    })

    const bobTodos = await bobSession.client.todo.getAll()
    const carolTodos = await carolSession.client.todo.getAll()
    const bobTodo = bobTodos.find((entry) => entry.text === BOB_TODO_TEXT)
    const carolTodo = carolTodos.find((entry) => entry.text === CAROL_TODO_TEXT)

    expect(bobTodo).toBeDefined()
    expect(carolTodo).toBeDefined()
    expect(bobTodos).toEqual([
      {
        completed: false,
        id: bobTodo!.id,
        text: BOB_TODO_TEXT,
      },
    ])
    expect(carolTodos).toEqual([
      {
        completed: false,
        id: carolTodo!.id,
        text: CAROL_TODO_TEXT,
      },
    ])

    await expectORPCError(
      bobSession.client.todo.toggle({
        completed: true,
        id: carolTodo!.id,
      }),
      {
        code: 'NOT_FOUND',
        message: 'Todo not found.',
        status: 404,
      },
    )
    await expectORPCError(
      bobSession.client.todo.delete({
        id: carolTodo!.id,
      }),
      {
        code: 'NOT_FOUND',
        message: 'Todo not found.',
        status: 404,
      },
    )

    await expect(carolSession.client.todo.getAll()).resolves.toEqual([
      {
        completed: false,
        id: carolTodo!.id,
        text: CAROL_TODO_TEXT,
      },
    ])
    await expect(bobSession.client.todo.getAll()).resolves.toEqual([
      {
        completed: false,
        id: bobTodo!.id,
        text: BOB_TODO_TEXT,
      },
    ])
  })

  test('legacy todos remain visible after org scoping', async () => {
    await database.insert(todoTable).values({
      text: 'Legacy public todo',
    })

    const owner = await getOwnerCandidateByEmail(BOB_EMAIL)

    expect(owner).toBeDefined()

    const organization = await adminSession.client.adminOrganization.create({
      name: 'Legacy Org',
      ownerUserId: owner!.id,
      slug: 'legacy-org',
    })

    await bobSession.client.organization.setActive({
      organizationId: organization.id,
    })

    const legacyTodos = await bobSession.client.todo.getAll()
    const legacyTodo = legacyTodos.find((entry) => entry.text === 'Legacy public todo')

    expect(legacyTodo).toBeDefined()
    expect(legacyTodos).toContainEqual({
      completed: false,
      id: legacyTodo!.id,
      text: 'Legacy public todo',
    })

    await bobSession.client.todo.toggle({
      completed: true,
      id: legacyTodo!.id,
    })

    await expect(bobSession.client.todo.getAll()).resolves.toContainEqual({
      completed: true,
      id: legacyTodo!.id,
      text: 'Legacy public todo',
    })

    await bobSession.client.todo.delete({
      id: legacyTodo!.id,
    })

    await expect(bobSession.client.todo.getAll()).resolves.not.toContainEqual(
      expect.objectContaining({
        id: legacyTodo!.id,
      }),
    )
  })

  test('admin todo CRUD is scoped by explicit organization id', async () => {
    const owner = await getOwnerCandidateByEmail(BOB_EMAIL)

    expect(owner).toBeDefined()

    const organization = await adminSession.client.adminOrganization.create({
      name: 'Admin Todo Org',
      ownerUserId: owner!.id,
      slug: 'admin-todo-org',
    })

    await expect(adminSession.client.adminTodo.list({ organizationId: organization.id })).resolves.toEqual([])
    await expectORPCError(
      adminSession.client.adminTodo.create({
        organizationId: organization.id,
        text: '   ',
      }),
      {
        code: 'BAD_REQUEST',
        status: 400,
      },
    )

    const createdTodo = await adminSession.client.adminTodo.create({
      organizationId: organization.id,
      text: '  Admin dashboard todo  ',
    })

    expect(createdTodo).toEqual({
      completed: false,
      id: createdTodo.id,
      text: 'Admin dashboard todo',
    })

    await expect(adminSession.client.adminTodo.list({ organizationId: organization.id })).resolves.toEqual([
      {
        completed: false,
        id: createdTodo.id,
        text: 'Admin dashboard todo',
      },
    ])

    await expect(
      adminSession.client.adminTodo.toggle({
        completed: true,
        id: createdTodo.id,
        organizationId: organization.id,
      }),
    ).resolves.toEqual({
      completed: true,
      id: createdTodo.id,
      text: 'Admin dashboard todo',
    })

    await expect(adminSession.client.adminTodo.list({ organizationId: organization.id })).resolves.toEqual([
      {
        completed: true,
        id: createdTodo.id,
        text: 'Admin dashboard todo',
      },
    ])

    await expect(
      adminSession.client.adminTodo.delete({
        id: createdTodo.id,
        organizationId: organization.id,
      }),
    ).resolves.toEqual({
      id: createdTodo.id,
      organizationId: organization.id,
    })

    await expect(adminSession.client.adminTodo.list({ organizationId: organization.id })).resolves.toEqual([])
  })

  test('admin todo routes exclude null-organization todos', async () => {
    const owner = await getOwnerCandidateByEmail(BOB_EMAIL)

    expect(owner).toBeDefined()

    const organization = await adminSession.client.adminOrganization.create({
      name: 'Admin Todo Visibility Org',
      ownerUserId: owner!.id,
      slug: 'admin-todo-visibility-org',
    })

    await database.insert(todoTable).values({
      text: 'Legacy admin-hidden todo',
    })

    await expect(adminSession.client.adminTodo.list({ organizationId: organization.id })).resolves.toEqual([])
  })

  test('authenticated non-members still receive NOT_FOUND for missing organizations', async () => {
    await expectORPCError(
      bobSession.client.organization.setActive({
        organizationId: 'missing-organization',
      }),
      {
        code: 'NOT_FOUND',
        status: 404,
      },
    )
  })

  test('admin users can list organizations through the SDK', async () => {
    const ownerCandidate = await getOwnerCandidateByEmail(BOB_EMAIL)

    expect(ownerCandidate).toBeDefined()

    await adminSession.client.adminOrganization.create({
      name: ORGANIZATION_NAME,
      ownerUserId: ownerCandidate!.id,
      slug: ORGANIZATION_SLUG,
    })

    const organizations = await adminSession.client.adminOrganization.list()

    expect(organizations.organizations).toContainEqual(
      expect.objectContaining({
        memberCount: 1,
        name: ORGANIZATION_NAME,
        slug: ORGANIZATION_SLUG,
      }),
    )
  })

  test('admin search treats LIKE wildcards as literal characters', async () => {
    const percentMatchOwnerEmail = 'percent-match-owner@example.com'
    const percentMatchOwnerName = 'Percent 100% Owner'
    const percentNonMatchOwnerEmail = 'percent-non-match-owner@example.com'
    const percentNonMatchOwnerName = 'Percent 1000 Owner'
    const teamMatchOwnerEmail = 'team-match-owner@example.com'
    const teamMatchOwnerName = 'Team_1 Owner'
    const teamNonMatchOwnerEmail = 'team-non-match-owner@example.com'
    const teamNonMatchOwnerName = 'TeamA1 Owner'

    await signUpAndSignIn(createSessionClients(baseUrl).authClient, {
      email: percentMatchOwnerEmail,
      name: percentMatchOwnerName,
      password: USER_PASSWORD,
    })
    await signUpAndSignIn(createSessionClients(baseUrl).authClient, {
      email: percentNonMatchOwnerEmail,
      name: percentNonMatchOwnerName,
      password: USER_PASSWORD,
    })
    await signUpAndSignIn(createSessionClients(baseUrl).authClient, {
      email: teamMatchOwnerEmail,
      name: teamMatchOwnerName,
      password: USER_PASSWORD,
    })
    await signUpAndSignIn(createSessionClients(baseUrl).authClient, {
      email: teamNonMatchOwnerEmail,
      name: teamNonMatchOwnerName,
      password: USER_PASSWORD,
    })

    const percentMatchOwner = await getOwnerCandidateByEmail(percentMatchOwnerEmail)
    const percentNonMatchOwner = await getOwnerCandidateByEmail(percentNonMatchOwnerEmail)
    const teamMatchOwner = await getOwnerCandidateByEmail(teamMatchOwnerEmail)
    const teamNonMatchOwner = await getOwnerCandidateByEmail(teamNonMatchOwnerEmail)

    expect(percentMatchOwner).toBeDefined()
    expect(percentNonMatchOwner).toBeDefined()
    expect(teamMatchOwner).toBeDefined()
    expect(teamNonMatchOwner).toBeDefined()

    await adminSession.client.adminOrganization.create({
      name: 'Revenue 100%',
      ownerUserId: percentMatchOwner!.id,
      slug: 'revenue-100pct',
    })
    await adminSession.client.adminOrganization.create({
      name: 'Revenue 1000',
      ownerUserId: percentNonMatchOwner!.id,
      slug: 'revenue-1000',
    })
    await adminSession.client.adminOrganization.create({
      name: 'Team_1 Org',
      ownerUserId: teamMatchOwner!.id,
      slug: 'team_1-org',
    })
    await adminSession.client.adminOrganization.create({
      name: 'TeamA1 Org',
      ownerUserId: teamNonMatchOwner!.id,
      slug: 'teama1-org',
    })

    const ownerCandidatesWithPercent = await adminSession.client.adminOrganization.listOwnerCandidates({
      search: '100%',
    })
    const ownerCandidatesWithUnderscore = await adminSession.client.adminOrganization.listOwnerCandidates({
      search: 'Team_1',
    })
    const organizationsWithPercent = await adminSession.client.adminOrganization.list({
      search: '100%',
    })
    const organizationsWithUnderscore = await adminSession.client.adminOrganization.list({
      search: 'Team_1',
    })

    expect(ownerCandidatesWithPercent).toContainEqual(
      expect.objectContaining({
        email: percentMatchOwnerEmail,
        name: percentMatchOwnerName,
      }),
    )
    expect(ownerCandidatesWithPercent).not.toContainEqual(
      expect.objectContaining({
        email: percentNonMatchOwnerEmail,
      }),
    )
    expect(ownerCandidatesWithUnderscore).toContainEqual(
      expect.objectContaining({
        email: teamMatchOwnerEmail,
        name: teamMatchOwnerName,
      }),
    )
    expect(ownerCandidatesWithUnderscore).not.toContainEqual(
      expect.objectContaining({
        email: teamNonMatchOwnerEmail,
      }),
    )
    expect(organizationsWithPercent.organizations).toContainEqual(
      expect.objectContaining({
        name: 'Revenue 100%',
        slug: 'revenue-100pct',
      }),
    )
    expect(organizationsWithPercent.organizations).not.toContainEqual(
      expect.objectContaining({
        slug: 'revenue-1000',
      }),
    )
    expect(organizationsWithUnderscore.organizations).toContainEqual(
      expect.objectContaining({
        name: 'Team_1 Org',
        slug: 'team_1-org',
      }),
    )
    expect(organizationsWithUnderscore.organizations).not.toContainEqual(
      expect.objectContaining({
        slug: 'teama1-org',
      }),
    )
  })

  test('non-admin access to admin routes is forbidden', async () => {
    await expectORPCError(bobSession.client.adminOrganization.list(), {
      code: 'FORBIDDEN',
      status: 403,
    })
    await expectORPCError(
      bobSession.client.adminTodo.list({
        organizationId: 'organization-id',
      }),
      {
        code: 'FORBIDDEN',
        status: 403,
      },
    )
  })

  test('expected NOT_FOUND and BAD_REQUEST responses remain intact', async () => {
    await expectORPCError(
      adminSession.client.adminOrganization.get({
        organizationId: 'missing-organization',
      }),
      {
        code: 'NOT_FOUND',
        status: 404,
      },
    )
    await expectORPCError(
      adminSession.client.adminOrganization.create({
        name: 'Invalid Owner Org',
        ownerUserId: 'missing-user',
        slug: 'invalid-owner-org',
      }),
      {
        code: 'BAD_REQUEST',
        message: 'Owner user not found.',
        status: 400,
      },
    )
    await expectORPCError(
      adminSession.client.adminTodo.create({
        organizationId: 'missing-organization',
        text: 'Missing organization todo',
      }),
      {
        code: 'NOT_FOUND',
        message: 'Organization not found.',
        status: 404,
      },
    )
    await expectORPCError(
      adminSession.client.adminTodo.list({
        organizationId: 'missing-organization',
      }),
      {
        code: 'NOT_FOUND',
        message: 'Organization not found.',
        status: 404,
      },
    )
    const owner = await getOwnerCandidateByEmail(BOB_EMAIL)

    expect(owner).toBeDefined()

    const firstOrganization = await adminSession.client.adminOrganization.create({
      name: 'Admin Todo Not Found Org',
      ownerUserId: owner!.id,
      slug: 'admin-todo-not-found-org',
    })
    const secondOrganization = await adminSession.client.adminOrganization.create({
      name: 'Admin Todo Other Org',
      ownerUserId: owner!.id,
      slug: 'admin-todo-other-org',
    })
    const createdTodo = await adminSession.client.adminTodo.create({
      organizationId: firstOrganization.id,
      text: 'Scoped admin todo',
    })

    await expectORPCError(
      adminSession.client.adminTodo.toggle({
        completed: true,
        id: createdTodo.id,
        organizationId: secondOrganization.id,
      }),
      {
        code: 'NOT_FOUND',
        message: 'Todo not found.',
        status: 404,
      },
    )
    await expectORPCError(
      adminSession.client.adminTodo.delete({
        id: createdTodo.id,
        organizationId: secondOrganization.id,
      }),
      {
        code: 'NOT_FOUND',
        message: 'Todo not found.',
        status: 404,
      },
    )
  })
})

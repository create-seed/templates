import dotenv from 'dotenv'
import { and, asc, eq, inArray } from 'drizzle-orm'
import { resolve } from 'node:path'

import { isLocalDatabaseUrl } from './lib/local-database-url'
import { todo } from './schema'
import * as authSchema from './schema/auth'

const API_ENV_PATH = resolve(import.meta.dir, '..', '..', '..', 'apps', 'api', '.env')

dotenv.config({
  path: API_ENV_PATH,
})

const BOOTSTRAP_ADMIN_EMAIL = 'db-seed-bootstrap@example.com'
const BOOTSTRAP_ADMIN_NAME = 'DB Seed Bootstrap'
const DEV_ADMIN_EMAIL = 'alice@example.com'
const DEV_ADMIN_NAME = 'Alice'
const DEV_BOB_EMAIL = 'bob@example.com'
const DEV_BOB_NAME = 'Bob'
const DEV_CAROL_EMAIL = 'carol@example.com'
const DEV_CAROL_NAME = 'Carol'
const DEV_PRIMARY_ORGANIZATION_SLUG = 'acme'
const DEV_SEED_NAMESPACE = 'dev'
const DEV_SEED_PASSWORD = process.env.DEV_SEED_PASSWORD ?? 'password123'
const DEV_PASSWORD = DEV_SEED_PASSWORD
const BOOTSTRAP_ADMIN_PASSWORD = DEV_SEED_PASSWORD
const SEED_SKIPPED_MESSAGE = 'Skipping local development seed because existing user or organization data was found.'

function createSeedOrganizationMetadata(slug: string) {
  return JSON.stringify({
    seed: DEV_SEED_NAMESPACE,
    slug,
  })
}

const devSeedOrganizations = [
  {
    logo: null,
    members: [
      {
        email: DEV_ADMIN_EMAIL,
        role: 'admin',
      },
      {
        email: DEV_BOB_EMAIL,
        role: 'owner',
      },
    ].sort((left, right) => left.email.localeCompare(right.email)),
    metadata: createSeedOrganizationMetadata('acme'),
    name: 'Acme',
    slug: 'acme',
  },
  {
    logo: null,
    members: [
      {
        email: DEV_ADMIN_EMAIL,
        role: 'admin',
      },
      {
        email: DEV_CAROL_EMAIL,
        role: 'owner',
      },
    ].sort((left, right) => left.email.localeCompare(right.email)),
    metadata: createSeedOrganizationMetadata('beacon'),
    name: 'Beacon',
    slug: 'beacon',
  },
].sort((left, right) => left.slug.localeCompare(right.slug))
const primaryDevSeedOrganization = devSeedOrganizations.find(
  (organization) => organization.slug === DEV_PRIMARY_ORGANIZATION_SLUG,
)

if (!primaryDevSeedOrganization) {
  throw new Error(`Missing primary dev seed organization for slug ${DEV_PRIMARY_ORGANIZATION_SLUG}.`)
}

export const devSeed = {
  organization: primaryDevSeedOrganization,
  organizations: devSeedOrganizations,
  todos: [
    {
      completed: false,
      id: -1004,
      organizationSlug: 'acme',
      text: 'Seed todo: Review Acme onboarding',
    },
    {
      completed: false,
      id: -1003,
      organizationSlug: 'acme',
      text: 'Seed todo: Ship Acme launch checklist',
    },
    {
      completed: false,
      id: -1002,
      organizationSlug: 'beacon',
      text: 'Seed todo: Audit Beacon permissions',
    },
    {
      completed: false,
      id: -1001,
      organizationSlug: 'beacon',
      text: 'Seed todo: Plan Beacon rollout',
    },
  ].sort((left, right) => left.text.localeCompare(right.text)),
  users: [
    {
      email: DEV_ADMIN_EMAIL,
      expectedRole: 'admin',
      name: DEV_ADMIN_NAME,
      password: DEV_PASSWORD,
    },
    {
      email: DEV_BOB_EMAIL,
      expectedRole: 'user',
      name: DEV_BOB_NAME,
      password: DEV_PASSWORD,
    },
    {
      email: DEV_CAROL_EMAIL,
      expectedRole: 'user',
      name: DEV_CAROL_NAME,
      password: DEV_PASSWORD,
    },
  ].sort((left, right) => left.email.localeCompare(right.email)),
} as const

type RuntimeModules = {
  auth: Awaited<typeof import('../../auth/src/index.ts')>['auth']
  db: Awaited<typeof import('./index.ts')>['db']
}

type CompletedSeedResult = {
  organizationCount: number
  organizationId: string
  organizationIdsBySlug: Record<string, string>
  skipped: false
  todoCount: number
  userCount: number
}

type SkippedSeedResult = {
  skipped: true
}

type SeedResult = CompletedSeedResult | SkippedSeedResult

type SeedOrganization = (typeof devSeed.organizations)[number]
type SeedUser = (typeof devSeed.users)[number]

function ensureSeedRuntimeEnv() {
  const adminEmailPatterns = [
    ...new Set([
      BOOTSTRAP_ADMIN_EMAIL,
      DEV_ADMIN_EMAIL,
      ...(process.env.BETTER_AUTH_ADMIN_EMAILS?.split(',')
        .map((pattern) => pattern.trim().toLowerCase())
        .filter(Boolean) ?? []),
    ]),
  ].sort((left, right) => left.localeCompare(right))

  process.env.BETTER_AUTH_ADMIN_EMAILS = adminEmailPatterns.join(',')
  process.env.DATABASE_AUTH_TOKEN ||= 'no-token'
}

function assertLocalSeedRuntime() {
  const databaseAuthToken = process.env.DATABASE_AUTH_TOKEN
  const databaseUrl = process.env.DATABASE_URL
  const nodeEnv = process.env.NODE_ENV ?? 'development'

  if (nodeEnv !== 'development' && nodeEnv !== 'test') {
    throw new Error(`db:seed only supports local development and test runs. Received NODE_ENV=${nodeEnv}.`)
  }

  if (!databaseUrl) {
    throw new Error('DATABASE_URL must be set before running db:seed.')
  }

  if (!isLocalDatabaseUrl(databaseUrl)) {
    throw new Error('db:seed only supports local DATABASE_URL values.')
  }

  if (new URL(databaseUrl).protocol !== 'file:' && databaseAuthToken !== 'no-token') {
    throw new Error('db:seed only supports local network DATABASE_URL values when DATABASE_AUTH_TOKEN=no-token.')
  }
}

async function clearBootstrapAdmin(db: RuntimeModules['db']) {
  await db.delete(authSchema.user).where(eq(authSchema.user.email, BOOTSTRAP_ADMIN_EMAIL))
}

async function hasExistingSeedManagedData(db: RuntimeModules['db']) {
  const [[organization], [user]] = await Promise.all([
    db
      .select({
        id: authSchema.organization.id,
      })
      .from(authSchema.organization)
      .limit(1),
    db
      .select({
        id: authSchema.user.id,
      })
      .from(authSchema.user)
      .limit(1),
  ])

  return organization !== undefined || user !== undefined
}

async function assertSeedOrganizationPreconditions(db: RuntimeModules['db']) {
  for (const organization of devSeed.organizations) {
    const [organizationBySlug, seedOrganization] = await Promise.all([
      getOrganizationBySlug(db, organization.slug),
      getSeedOrganizationByMetadata(db, organization.metadata),
    ])

    if (organizationBySlug && !isSeedOwnedOrganization(organizationBySlug)) {
      throw new Error(`Refusing to modify existing non-seed organization with slug ${organization.slug}.`)
    }

    if (organizationBySlug && seedOrganization && organizationBySlug.id !== seedOrganization.id) {
      throw new Error(`Refusing to modify existing non-seed organization with slug ${organization.slug}.`)
    }
  }
}

async function loadRuntime(): Promise<RuntimeModules> {
  const [{ auth }, { db }] = await Promise.all([import('../../auth/src/index'), import('./index')])

  return {
    auth,
    db,
  }
}

async function getOrganizationBySlug(db: RuntimeModules['db'], slug: string) {
  const [organization] = await db
    .select({
      id: authSchema.organization.id,
      metadata: authSchema.organization.metadata,
    })
    .from(authSchema.organization)
    .where(eq(authSchema.organization.slug, slug))
    .limit(1)

  return organization ?? null
}

async function getSeedOrganizationByMetadata(db: RuntimeModules['db'], metadata: string) {
  const organizations = await db
    .select({
      id: authSchema.organization.id,
      metadata: authSchema.organization.metadata,
      slug: authSchema.organization.slug,
    })
    .from(authSchema.organization)
    .where(eq(authSchema.organization.metadata, metadata))
    .orderBy(asc(authSchema.organization.id))

  if (organizations.length > 1) {
    throw new Error(`Refusing to modify multiple seed-owned organizations for metadata ${metadata}.`)
  }

  return organizations[0] ?? null
}

async function getUserByEmail(db: RuntimeModules['db'], email: string) {
  const [user] = await db
    .select({
      banExpires: authSchema.user.banExpires,
      banned: authSchema.user.banned,
      banReason: authSchema.user.banReason,
      email: authSchema.user.email,
      id: authSchema.user.id,
      name: authSchema.user.name,
      role: authSchema.user.role,
    })
    .from(authSchema.user)
    .where(eq(authSchema.user.email, email))
    .limit(1)

  return user ?? null
}

async function normalizeSeedUser(
  db: RuntimeModules['db'],
  seedUser: SeedUser,
  user: NonNullable<Awaited<ReturnType<typeof getUserByEmail>>>,
) {
  const nextUserValues = {
    ...(user.banExpires === null ? {} : { banExpires: null }),
    ...(user.banReason === null ? {} : { banReason: null }),
    ...(user.banned === false ? {} : { banned: false }),
    ...(user.name === seedUser.name ? {} : { name: seedUser.name }),
    ...(user.role === seedUser.expectedRole ? {} : { role: seedUser.expectedRole }),
  }

  if (Object.keys(nextUserValues).length > 0) {
    await db.update(authSchema.user).set(nextUserValues).where(eq(authSchema.user.id, user.id))
  }

  return (await getUserByEmail(db, seedUser.email)) ?? user
}

function isSeedOwnedOrganization(organization: { metadata: string | null }) {
  if (!organization.metadata) {
    return false
  }

  try {
    const metadata = JSON.parse(organization.metadata) as {
      seed?: string
    }

    return metadata.seed === DEV_SEED_NAMESPACE
  } catch {
    return false
  }
}

async function resetSeedTodos(db: RuntimeModules['db'], organizationIdsBySlug: Record<string, string>) {
  const seedTodoIds = devSeed.todos.map((entry) => entry.id)

  await db.transaction(async (tx) => {
    if (seedTodoIds.length > 0) {
      await tx.delete(todo).where(inArray(todo.id, seedTodoIds))
    }

    await tx.insert(todo).values(toSeedTodoValues(organizationIdsBySlug))
  })
}

function toSeedTodoValues(organizationIdsBySlug: Record<string, string>) {
  return devSeed.todos.map((entry) => ({
    completed: entry.completed,
    id: entry.id,
    organizationId: getRequiredOrganizationId(organizationIdsBySlug, entry.organizationSlug),
    text: entry.text,
  }))
}

function getRequiredOrganizationId(organizationIdsBySlug: Record<string, string>, slug: string) {
  const organizationId = organizationIdsBySlug[slug]

  if (!organizationId) {
    throw new Error(`Missing organization id for seed organization ${slug}.`)
  }

  return organizationId
}

async function syncOrganizationMember(db: RuntimeModules['db'], organizationId: string, userId: string, role: string) {
  const [member] = await db
    .select({
      id: authSchema.member.id,
      role: authSchema.member.role,
    })
    .from(authSchema.member)
    .where(and(eq(authSchema.member.organizationId, organizationId), eq(authSchema.member.userId, userId)))
    .limit(1)

  if (member) {
    if (member.role !== role) {
      await db
        .update(authSchema.member)
        .set({
          role,
        })
        .where(eq(authSchema.member.id, member.id))
    }

    return
  }

  await db.insert(authSchema.member).values({
    id: crypto.randomUUID(),
    organizationId,
    role,
    userId,
  })
}

async function createBootstrapAdminHeaders(runtime: RuntimeModules) {
  const { auth } = runtime

  await auth.api.signUpEmail({
    body: {
      email: BOOTSTRAP_ADMIN_EMAIL,
      name: BOOTSTRAP_ADMIN_NAME,
      password: BOOTSTRAP_ADMIN_PASSWORD,
    },
  })

  const signInResult = await auth.api.signInEmail({
    body: {
      email: BOOTSTRAP_ADMIN_EMAIL,
      password: BOOTSTRAP_ADMIN_PASSWORD,
    },
    returnHeaders: true,
  })
  const sessionCookie = signInResult.headers.get('set-cookie')?.split(';', 1)[0]?.trim()

  if (!sessionCookie) {
    throw new Error('Failed to establish a bootstrap admin session for db:seed.')
  }

  return new Headers({
    cookie: sessionCookie,
  })
}

async function createSeedUsers(runtime: RuntimeModules) {
  const { auth, db } = runtime
  const bootstrapAdminHeaders = await createBootstrapAdminHeaders(runtime)
  const usersByEmail = new Map<string, NonNullable<Awaited<ReturnType<typeof getUserByEmail>>>>()

  for (const seedUser of devSeed.users) {
    let user = await getUserByEmail(db, seedUser.email)

    if (user) {
      await auth.api.setUserPassword({
        body: {
          newPassword: seedUser.password,
          userId: user.id,
        },
        headers: bootstrapAdminHeaders,
      })
    }

    if (!user) {
      await auth.api.signUpEmail({
        body: {
          email: seedUser.email,
          name: seedUser.name,
          password: seedUser.password,
        },
      })
    }

    user = await getUserByEmail(db, seedUser.email)

    if (!user) {
      throw new Error(`Failed to create seed user ${seedUser.email}.`)
    }

    user = await normalizeSeedUser(db, seedUser, user)

    if (user.role !== seedUser.expectedRole) {
      throw new Error(`Seed user ${seedUser.email} has role ${user.role}, expected ${seedUser.expectedRole}.`)
    }

    usersByEmail.set(seedUser.email, user)
  }

  const managedUserEmails = [BOOTSTRAP_ADMIN_EMAIL, ...devSeed.users.map((seedUser) => seedUser.email)].sort(
    (left, right) => left.localeCompare(right),
  )
  const managedUsers = await db
    .select({
      email: authSchema.user.email,
      id: authSchema.user.id,
    })
    .from(authSchema.user)
    .where(inArray(authSchema.user.email, managedUserEmails))

  if (managedUsers.length > 0) {
    await db.delete(authSchema.session).where(
      inArray(
        authSchema.session.userId,
        managedUsers.map((user) => user.id),
      ),
    )
  }

  const bootstrapUser = managedUsers.find((user) => user.email === BOOTSTRAP_ADMIN_EMAIL)

  if (bootstrapUser) {
    await db.delete(authSchema.user).where(eq(authSchema.user.id, bootstrapUser.id))
  }

  return usersByEmail
}

function getSeedOrganizationOwner(seedOrganization: SeedOrganization) {
  const owner = seedOrganization.members.find((member) => member.role === 'owner')

  if (!owner) {
    throw new Error(`Seed organization ${seedOrganization.slug} must define an owner.`)
  }

  return owner
}

async function syncSeedOrganization(
  runtime: RuntimeModules,
  usersByEmail: Map<string, NonNullable<Awaited<ReturnType<typeof getUserByEmail>>>>,
  organization: SeedOrganization,
) {
  const { auth, db } = runtime
  const ownerMembership = getSeedOrganizationOwner(organization)
  const ownerUser = usersByEmail.get(ownerMembership.email)

  if (!ownerUser) {
    throw new Error(`Seed user ${ownerMembership.email} must exist before seeding organizations.`)
  }

  const [organizationBySlug, seedOrganization] = await Promise.all([
    getOrganizationBySlug(db, organization.slug),
    getSeedOrganizationByMetadata(db, organization.metadata),
  ])

  if (organizationBySlug && !isSeedOwnedOrganization(organizationBySlug)) {
    throw new Error(`Refusing to modify existing non-seed organization with slug ${organization.slug}.`)
  }

  if (organizationBySlug && seedOrganization && organizationBySlug.id !== seedOrganization.id) {
    throw new Error(`Refusing to modify existing non-seed organization with slug ${organization.slug}.`)
  }

  const organizationId =
    seedOrganization?.id ??
    (
      await auth.api.createOrganization({
        body: {
          logo: organization.logo ?? undefined,
          metadata: JSON.parse(organization.metadata) as { seed: string; slug: string },
          name: organization.name,
          slug: organization.slug,
          userId: ownerUser.id,
        },
      })
    ).id

  if (seedOrganization) {
    await db
      .update(authSchema.organization)
      .set({
        logo: organization.logo,
        metadata: organization.metadata,
        name: organization.name,
        slug: organization.slug,
      })
      .where(eq(authSchema.organization.id, seedOrganization.id))
  }

  for (const membership of organization.members) {
    const user = usersByEmail.get(membership.email)

    if (!user) {
      throw new Error(`Seed user ${membership.email} must exist before syncing memberships.`)
    }

    await syncOrganizationMember(db, organizationId, user.id, membership.role)
  }

  return {
    id: organizationId,
    slug: organization.slug,
  }
}

async function createSeedOrganizations(
  runtime: RuntimeModules,
  usersByEmail: Map<string, NonNullable<Awaited<ReturnType<typeof getUserByEmail>>>>,
) {
  const organizationIdsBySlug: Record<string, string> = {}

  for (const organization of devSeed.organizations) {
    const syncedOrganization = await syncSeedOrganization(runtime, usersByEmail, organization)

    organizationIdsBySlug[syncedOrganization.slug] = syncedOrganization.id
  }

  return organizationIdsBySlug
}

export async function seedDatabase(): Promise<SeedResult> {
  ensureSeedRuntimeEnv()
  assertLocalSeedRuntime()

  let runtime: RuntimeModules | null = null
  let shouldClearBootstrapAdmin = false

  try {
    runtime = await loadRuntime()

    if (await hasExistingSeedManagedData(runtime.db)) {
      return {
        skipped: true,
      }
    }

    shouldClearBootstrapAdmin = true
    await assertSeedOrganizationPreconditions(runtime.db)
    await clearBootstrapAdmin(runtime.db)

    const usersByEmail = await createSeedUsers(runtime)
    const organizationIdsBySlug = await createSeedOrganizations(runtime, usersByEmail)

    await resetSeedTodos(runtime.db, organizationIdsBySlug)

    return {
      organizationCount: devSeed.organizations.length,
      organizationId: getRequiredOrganizationId(organizationIdsBySlug, DEV_PRIMARY_ORGANIZATION_SLUG),
      organizationIdsBySlug,
      skipped: false,
      todoCount: devSeed.todos.length,
      userCount: devSeed.users.length,
    }
  } finally {
    if (runtime && shouldClearBootstrapAdmin) {
      await clearBootstrapAdmin(runtime.db)
    }
  }
}

if (import.meta.main) {
  const summary = await seedDatabase()

  if (summary.skipped) {
    console.log(SEED_SKIPPED_MESSAGE)
    process.exit(0)
  }

  console.log(
    [
      'Seeded local development data.',
      `Admin user: ${DEV_ADMIN_EMAIL} / ${DEV_PASSWORD}`,
      `Users: ${devSeed.users.map((user) => user.email).join(', ')}`,
      ...devSeed.organizations.map((organization) => {
        const members = organization.members.map((member) => `${member.email} ${member.role}`).join(', ')

        return `Organization: ${organization.name} (${organization.slug}) [${members}]`
      }),
      `Seeded organizations: ${summary.organizationCount}`,
      `Seeded users: ${summary.userCount}`,
      `Seeded todos: ${summary.todoCount}`,
    ].join('\n'),
  )
}

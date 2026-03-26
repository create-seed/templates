import { checkout, polar, portal } from '@polar-sh/better-auth'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { admin } from 'better-auth/plugins/admin'
import { organization } from 'better-auth/plugins/organization'
import { eq } from 'drizzle-orm'
import { db } from '@bun-platform/db'
import * as schema from '@bun-platform/db/schema/auth'
import { env } from '@bun-platform/env/api'

import { isAdminEmail } from './lib/admin-email'
import { isPolarEnabled, polarClient, resolvedPolarSuccessUrl } from './lib/payments'

async function syncAdminRole(userId: string) {
  const [userRecord] = await db
    .select({
      email: schema.user.email,
      role: schema.user.role,
    })
    .from(schema.user)
    .where(eq(schema.user.id, userId))
    .limit(1)

  if (
    !userRecord?.email ||
    userRecord.role === 'admin' ||
    !isAdminEmail(userRecord.email, env.BETTER_AUTH_ADMIN_EMAILS)
  ) {
    return
  }

  await db.update(schema.user).set({ role: 'admin' }).where(eq(schema.user.id, userId))
}

export const auth = betterAuth({
  advanced: {
    defaultCookieAttributes: {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    },
  },
  baseURL: env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: 'sqlite',

    schema: schema,
  }),
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          await syncAdminRole(session.userId)

          return {
            data: session,
          }
        },
      },
    },
    user: {
      create: {
        before: async (user) => {
          return {
            data: {
              ...user,
              role: user.email && isAdminEmail(user.email, env.BETTER_AUTH_ADMIN_EMAILS) ? 'admin' : undefined,
            },
          }
        },
      },
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  emailVerification: {
    afterEmailVerification: async (user) => {
      if (!isAdminEmail(user.email, env.BETTER_AUTH_ADMIN_EMAILS)) {
        return
      }

      await syncAdminRole(user.id)
    },
  },
  plugins: [
    admin(),
    organization({
      allowUserToCreateOrganization: false,
    }),
    ...(isPolarEnabled && polarClient && resolvedPolarSuccessUrl
      ? [
          polar({
            client: polarClient,
            createCustomerOnSignUp: false,
            enableCustomerPortal: true,
            use: [
              checkout({
                authenticatedUsersOnly: true,
                products: [
                  {
                    productId: 'your-product-id',
                    slug: 'pro',
                  },
                ],
                successUrl: resolvedPolarSuccessUrl,
              }),
              portal(),
            ],
          }),
        ]
      : []),
  ],
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: env.CORS_ORIGINS,
})

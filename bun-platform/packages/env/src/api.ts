import 'dotenv/config'
import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

const adminEmailPatternSchema = z
  .string()
  .refine((value) => z.email().safeParse(value).success || /^\*@[^\s@]+\.[^\s@]+$/.test(value), {
    message: 'Expected an email address or wildcard domain pattern like *@company.com',
  })

const adminEmailsSchema = z
  .string()
  .optional()
  .transform((value) =>
    value
      ? [
          ...new Set(
            value
              .split(',')
              .map((pattern) => pattern.trim().toLowerCase())
              .filter(Boolean),
          ),
        ].sort((a, b) => a.localeCompare(b))
      : [],
  )
  .pipe(z.array(adminEmailPatternSchema))

const corsOriginsSchema = z
  .string()
  .transform((value) =>
    [
      ...new Set(
        value
          .split(',')
          .map((origin) => origin.trim())
          .filter(Boolean),
      ),
    ].sort((a, b) => a.localeCompare(b)),
  )
  .pipe(z.array(z.url()).min(1))

export const env = createEnv({
  emptyStringAsUndefined: true,
  runtimeEnv: process.env,
  server: {
    BETTER_AUTH_ADMIN_EMAILS: adminEmailsSchema,
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.url(),
    CORS_ORIGINS: corsOriginsSchema,
    DATABASE_AUTH_TOKEN: z.string().min(1),
    DATABASE_URL: z.string().min(1),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    POLAR_ACCESS_TOKEN: z.string().min(1).optional(),
    POLAR_SERVER: z.enum(['production', 'sandbox']).default('sandbox'),
    POLAR_SUCCESS_URL: z.url().optional(),
  },
})

import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import { env } from '@bun-platform/env/api'

import * as schema from './schema'

const client = createClient({
  authToken: env.DATABASE_AUTH_TOKEN,
  url: env.DATABASE_URL,
})

export const db = drizzle({ client, schema })

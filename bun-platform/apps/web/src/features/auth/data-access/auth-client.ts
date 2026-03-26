import { polarClient } from '@polar-sh/better-auth'
import { adminClient, organizationClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'
import { env } from '@bun-platform/env/web'

export const authClient = createAuthClient({
  baseURL: env.VITE_API_URL,
  plugins: [adminClient(), organizationClient(), polarClient()],
})

import { getRequestHeaders } from '@tanstack/react-start/server'
import { env } from '@bun-platform/env/web'
import { createOrpcClient } from '@bun-platform/sdk'

export const serverOrpcClient = createOrpcClient({
  baseUrl: env.VITE_API_URL,
  headers: () => getRequestHeaders(),
})

import { createTanstackQueryUtils } from '@orpc/tanstack-query'
import { QueryCache, QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { env } from '@bun-platform/env/web'
import { createOrpcClient, type OrpcClient } from '@bun-platform/sdk'

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      toast.error(`Error: ${error.message}`, {
        action: {
          label: 'retry',
          onClick: () => query.invalidate(),
        },
      })
    },
  }),
})

export const client: OrpcClient = createOrpcClient({
  baseUrl: env.VITE_API_URL,
})

export const orpc = createTanstackQueryUtils(client)

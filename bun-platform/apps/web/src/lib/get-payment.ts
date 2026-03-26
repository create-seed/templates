import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'

import { authClient } from '@/features/auth/data-access/auth-client'
import { authMiddleware } from '@/features/auth/data-access/auth-middleware'
import { serverOrpcClient } from '@/lib/orpc-server'

export const getPayment = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async () => {
    const { billingEnabled } = await serverOrpcClient.billing.getState()

    if (!billingEnabled) {
      return {
        billingEnabled: false,
        customerState: null,
      }
    }

    const { data: customerState } = await authClient.customer.state({
      fetchOptions: {
        headers: getRequestHeaders(),
      },
    })

    return {
      billingEnabled: true,
      customerState,
    }
  })

import { createServerFn } from '@tanstack/react-start'

import { authMiddleware } from '@/features/auth/data-access/auth-middleware'
import { serverOrpcClient } from '@/lib/orpc-server'

export interface OrganizationListMineOrganization {
  id: string
  isActive: boolean
  logo: string | null
  name: string
  role: string
  slug: string
}

export interface OrganizationListMineData {
  activeOrganizationId: string | null
  organizations: OrganizationListMineOrganization[]
}

export const getOrganizationListMine = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    if (!context.session) {
      return null
    }

    return (await serverOrpcClient.organization.listMine()) satisfies OrganizationListMineData
  })

import { useQuery } from '@tanstack/react-query'

import type { AdminOrganizationGetOwner } from './use-admin-organization-get-query'

import { orpc } from '@/lib/orpc'

export interface AdminOrganizationDirectoryItem {
  createdAt: Date | string
  id: string
  logo: string | null
  memberCount: number
  metadata: unknown
  name: string
  owners: AdminOrganizationGetOwner[]
  slug: string
}

export interface AdminOrganizationDirectoryResult {
  limit: number
  offset: number
  organizations: AdminOrganizationDirectoryItem[]
  total: number
}

interface UseAdminOrganizationDirectoryQueryOptions {
  search?: string
}

export function useAdminOrganizationDirectoryQuery(options: UseAdminOrganizationDirectoryQueryOptions = {}) {
  return useQuery(
    orpc.adminOrganization.list.queryOptions({
      input: {
        limit: 25,
        search: options.search,
      },
    }),
  )
}

import { useQuery } from '@tanstack/react-query'

import { orpc } from '@/lib/orpc'

export interface AdminOrganizationGetMember {
  createdAt: Date | string
  email: string
  id: string
  name: string
  organizationId: string
  role: string
  userId: string
}

export interface AdminOrganizationGetOwner {
  email: string
  name: string
  userId: string
}

export interface AdminOrganizationGetResult {
  createdAt: Date | string
  id: string
  logo: string | null
  memberCount: number
  members: AdminOrganizationGetMember[]
  metadata: unknown
  name: string
  owners: AdminOrganizationGetOwner[]
  slug: string
}

interface UseAdminOrganizationGetQueryOptions {
  enabled?: boolean
  initialData?: AdminOrganizationGetResult
}

export function getAdminOrganizationGetRouteQueryOptions(organizationId: string) {
  return orpc.adminOrganization.get.queryOptions({
    input: {
      organizationId,
    },
  })
}

export function useAdminOrganizationGetQuery(
  organizationId: string,
  options: UseAdminOrganizationGetQueryOptions = {},
) {
  return useQuery({
    ...getAdminOrganizationGetRouteQueryOptions(organizationId),
    enabled: (options.enabled ?? true) && Boolean(organizationId),
    initialData: options.initialData,
  })
}

import { useQuery } from '@tanstack/react-query'

import { orpc } from '@/lib/orpc'

export interface AdminOrganizationOwnerCandidate {
  email: string
  id: string
  name: string
}

interface UseAdminOrganizationOwnerCandidatesQueryOptions {
  enabled?: boolean
  search?: string
}

export function useAdminOrganizationOwnerCandidatesQuery(
  options: UseAdminOrganizationOwnerCandidatesQueryOptions = {},
) {
  return useQuery(
    orpc.adminOrganization.listOwnerCandidates.queryOptions({
      enabled: options.enabled ?? true,
      input: {
        limit: 10,
        search: options.search,
      },
    }),
  )
}

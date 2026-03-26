import { useQuery } from '@tanstack/react-query'

import type { OrganizationListMineData } from './get-organization-list-mine'

import { authClient } from '@/features/auth/data-access/auth-client'
import { orpc } from '@/lib/orpc'

interface UseOrganizationListMineOptions {
  enabled?: boolean
  initialData?: OrganizationListMineData
}

export function useOrganizationListMine(options: UseOrganizationListMineOptions = {}) {
  const { data: session } = authClient.useSession()
  const userId = session?.user.id ?? 'anonymous'

  return useQuery({
    ...orpc.organization.listMine.queryOptions(),
    enabled: (options.enabled ?? true) && Boolean(session?.user.id),
    initialData: options.initialData,
    queryKey: [...orpc.organization.listMine.key(), userId],
    staleTime: Number.POSITIVE_INFINITY,
  })
}

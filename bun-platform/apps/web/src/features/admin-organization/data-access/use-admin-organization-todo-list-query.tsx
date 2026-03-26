import { useQuery } from '@tanstack/react-query'

import { orpc } from '@/lib/orpc'

export interface AdminOrganizationTodo {
  completed: boolean
  id: number
  text: string
}

interface UseAdminOrganizationTodoListQueryOptions {
  enabled?: boolean
}

export function getAdminOrganizationTodoListQueryOptions(organizationId: string) {
  return orpc.adminTodo.list.queryOptions({
    input: {
      organizationId,
    },
  })
}

export function useAdminOrganizationTodoListQuery(
  organizationId: string,
  options: UseAdminOrganizationTodoListQueryOptions = {},
) {
  return useQuery({
    ...getAdminOrganizationTodoListQueryOptions(organizationId),
    enabled: (options.enabled ?? true) && Boolean(organizationId),
  })
}

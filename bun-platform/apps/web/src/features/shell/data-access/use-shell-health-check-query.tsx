import { useQuery } from '@tanstack/react-query'

import { orpc } from '@/lib/orpc'

export function useShellHealthCheckQuery() {
  return useQuery(orpc.healthCheck.queryOptions())
}

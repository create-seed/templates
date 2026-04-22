import { useQuery } from '@tanstack/react-query'

import { authStorageAuthenticated } from '@/features/auth/data-access/auth-storage'
import { useAuthStorage } from '@/features/auth/data-access/use-auth-storage'

export function useAuthStatusQuery() {
  const { queryKey } = useAuthStorage()
  const { data, isLoading } = useQuery({
    queryFn: authStorageAuthenticated,
    queryKey,
    staleTime: Number.POSITIVE_INFINITY,
  })

  return { isAuthenticated: data ?? false, isLoading }
}

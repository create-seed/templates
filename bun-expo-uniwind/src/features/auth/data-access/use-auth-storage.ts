import { useQueryClient } from '@tanstack/react-query'

import { AUTH_STORAGE_KEY } from '@/features/auth/data-access/auth-storage'

const queryKey = [AUTH_STORAGE_KEY] as const
export function useAuthStorage() {
  const queryClient = useQueryClient()

  return {
    queryKey,
    signIn: async () => {
      await queryClient.setQueryData(queryKey, true)
    },
    signOut: async () => {
      await queryClient.setQueryData(queryKey, false)
    },
  }
}

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { useOrganizationActiveCookie } from './use-organization-active-cookie'

import { orpc } from '@/lib/orpc'

interface UseOrganizationSetActiveOptions {
  onSuccess?: (organizationId: string) => void
}

export function useOrganizationSetActive(options: UseOrganizationSetActiveOptions = {}) {
  const queryClient = useQueryClient()
  const { setOrganizationActiveCookie } = useOrganizationActiveCookie()

  return useMutation(
    orpc.organization.setActive.mutationOptions({
      onError: (error) => {
        toast.error(error.message)
      },
      onSuccess: async (_data, variables) => {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: orpc.organization.listMine.key(),
          }),
          queryClient.invalidateQueries({
            queryKey: orpc.todo.getAll.key(),
          }),
        ])
        setOrganizationActiveCookie(variables.organizationId)
        options.onSuccess?.(variables.organizationId)
      },
    }),
  )
}

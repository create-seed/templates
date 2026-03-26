import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { orpc } from '@/lib/orpc'

export function useAdminOrganizationUpdate(organizationId: string) {
  const queryClient = useQueryClient()

  return useMutation(
    orpc.adminOrganization.update.mutationOptions({
      onError: (error) => {
        toast.error(error.message)
      },
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: orpc.adminOrganization.get.key({
              input: {
                organizationId,
              },
            }),
          }),
          queryClient.invalidateQueries({
            queryKey: orpc.adminOrganization.list.key(),
          }),
        ])
        toast.success('Organization updated.')
      },
    }),
  )
}

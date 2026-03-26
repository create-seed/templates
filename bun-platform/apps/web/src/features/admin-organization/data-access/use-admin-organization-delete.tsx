import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { orpc } from '@/lib/orpc'

export function useAdminOrganizationDelete() {
  const queryClient = useQueryClient()

  return useMutation(
    orpc.adminOrganization.delete.mutationOptions({
      onError: (error) => {
        toast.error(error.message)
      },
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: orpc.adminOrganization.list.key(),
        })
        toast.success('Organization deleted.')
      },
    }),
  )
}

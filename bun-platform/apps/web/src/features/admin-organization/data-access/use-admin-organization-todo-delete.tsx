import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { orpc } from '@/lib/orpc'

export function useAdminOrganizationTodoDelete(organizationId: string) {
  const queryClient = useQueryClient()

  return useMutation(
    orpc.adminTodo.delete.mutationOptions({
      onError: (error) => {
        toast.error(error.message)
      },
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: orpc.adminTodo.list.key({
            input: {
              organizationId,
            },
          }),
        })
      },
    }),
  )
}

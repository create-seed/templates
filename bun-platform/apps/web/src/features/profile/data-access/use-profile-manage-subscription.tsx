import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

import { authClient } from '@/features/auth/data-access/auth-client'

export function useProfileManageSubscription() {
  return useMutation({
    mutationFn: async () => {
      await authClient.customer.portal()
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Unable to open billing portal.')
    },
  })
}

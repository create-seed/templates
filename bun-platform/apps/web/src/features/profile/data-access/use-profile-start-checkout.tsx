import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

import { authClient } from '@/features/auth/data-access/auth-client'

export function useProfileStartCheckout() {
  return useMutation({
    mutationFn: async () => {
      await authClient.checkout({ slug: 'pro' })
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Unable to start checkout.')
    },
  })
}

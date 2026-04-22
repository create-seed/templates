import { useMutation } from '@tanstack/react-query'
import { useToast } from 'heroui-native'

import { authStorageSignIn } from '@/features/auth/data-access/auth-storage'
import { useAuthStorage } from '@/features/auth/data-access/use-auth-storage'

export function useAuthSignInMutation() {
  const authStorage = useAuthStorage()
  const { toast } = useToast()
  const mutation = useMutation({
    mutationFn: authStorageSignIn,
    onSuccess: () => authStorage.signIn(),
  })

  async function signIn() {
    if (mutation.isPending) {
      return
    }

    try {
      await mutation.mutateAsync()
    } catch {
      toast.show({
        description: 'Unable to sign in right now.',
        label: 'Sign in failed',
        variant: 'danger',
      })
    }
  }

  return {
    isPending: mutation.isPending,
    signIn,
  }
}

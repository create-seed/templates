import { useMutation } from '@tanstack/react-query'
import { useToast } from 'heroui-native'

import { authStorageSignOut } from '@/features/auth/data-access/auth-storage'
import { useAuthStorage } from '@/features/auth/data-access/use-auth-storage'

export function useAuthSignOutMutation() {
  const authStorage = useAuthStorage()
  const { toast } = useToast()
  const mutation = useMutation({
    mutationFn: authStorageSignOut,
    onSuccess: () => authStorage.signOut(),
  })

  async function signOut() {
    if (mutation.isPending) {
      return
    }

    try {
      await mutation.mutateAsync()
    } catch {
      toast.show({
        description: 'Unable to sign out right now.',
        label: 'Sign out failed',
        variant: 'danger',
      })
    }
  }

  return {
    isPending: mutation.isPending,
    signOut,
  }
}

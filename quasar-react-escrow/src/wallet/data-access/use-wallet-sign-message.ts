import { useMutation } from '@tanstack/react-query'
import { type UiWalletAccount, useWalletAccountMessageSigner } from '@wallet-ui/react'

import { executeWalletSignMessage } from '@/wallet/data-access/execute-wallet-sign-message'

export function useWalletSignMessage({ account }: { account: UiWalletAccount }) {
  const messageSigner = useWalletAccountMessageSigner(account)
  const { isPending: isLoading, mutateAsync: signMessage } = useMutation({
    mutationFn: (text: string) => executeWalletSignMessage({ account, messageSigner, text }),
  })

  return {
    isLoading,
    signMessage,
  }
}

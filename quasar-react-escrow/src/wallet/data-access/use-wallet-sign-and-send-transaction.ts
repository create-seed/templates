import { useMutation } from '@tanstack/react-query'
import { type UiWalletAccount, useWalletUiSigner } from '@wallet-ui/react'

import type { SolanaClient } from '@/solana/data-access/solana-client'

import { executeWalletSignAndSendTransaction } from '@/wallet/data-access/execute-wallet-sign-and-send-transaction'

export function useWalletSignAndSendTransaction({
  account,
  client,
}: {
  account: UiWalletAccount
  client: SolanaClient
}) {
  const transactionSigner = useWalletUiSigner({ account })
  const { isPending: isLoading, mutateAsync: signAndSendTransaction } = useMutation({
    mutationFn: (text: string) => executeWalletSignAndSendTransaction({ client, text, transactionSigner }),
  })

  return {
    isLoading,
    signAndSendTransaction,
  }
}

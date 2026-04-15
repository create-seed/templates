import { sendAndConfirmTransactionFactory } from '@solana/kit'
import { useSignTransaction } from '@solana/react'
import { useMutation } from '@tanstack/react-query'
import { type SolanaClusterId, type UiWalletAccount } from '@wallet-ui/react'
import { useMemo } from 'react'

import type { SolanaClient } from '@/solana/data-access/solana-client'

import { executeWalletSignTransaction } from '@/wallet/data-access/execute-wallet-sign-transaction'

export function useWalletSignTransaction({
  account,
  client,
  cluster,
}: {
  account: UiWalletAccount
  client: SolanaClient
  cluster: SolanaClusterId
}) {
  const sendAndConfirmTransaction = useMemo(() => sendAndConfirmTransactionFactory(client), [client])
  const signTransactionWithWallet = useSignTransaction(account, cluster)
  const { isPending: isLoading, mutateAsync: signTransaction } = useMutation({
    mutationFn: (text: string) =>
      executeWalletSignTransaction({ account, client, sendAndConfirmTransaction, signTransactionWithWallet, text }),
  })

  return {
    isLoading,
    signTransaction,
  }
}

import { useMutation } from '@tanstack/react-query'
import { type SolanaClusterId, type UiWallet, type UiWalletAccount, useSignIn } from '@wallet-ui/react'
import { useCallback, useState } from 'react'

import {
  createSignInPayload,
  createSignInSession,
  executeWalletSignIn,
  type WalletSignInSession,
} from '@/wallet/data-access/execute-wallet-sign-in'

export function useWalletSignIn({
  account,
  cluster,
  wallet,
}: {
  account: UiWalletAccount
  cluster: SolanaClusterId
  wallet: UiWallet
}) {
  const [session, setSession] = useState<WalletSignInSession>(() => createSignInSession())
  const signInWithWallet = useSignIn(wallet)

  const getPayload = useCallback(
    (statement: string) => createSignInPayload({ account, cluster, session, statement }).payload,
    [account, cluster, session],
  )
  const { isPending: isLoading, mutateAsync: signIn } = useMutation({
    mutationFn: (statement: string) => {
      const nextSession = createSignInSession()
      setSession(nextSession)

      return executeWalletSignIn({ account, cluster, session: nextSession, signInWithWallet, statement })
    },
  })

  return {
    getPayload,
    isLoading,
    signIn,
  }
}

import { address } from '@solana/kit'
import { useQuery } from '@tanstack/react-query'
import { type SolanaClusterId, type UiWalletAccount } from '@wallet-ui/react'

import type { SolanaClient } from '@/solana/data-access/solana-client'

import {
  getWalletTokenAccountsByOwner,
  type WalletTokenAccount,
} from '@/wallet/data-access/get-token-accounts-by-owner'

export type WalletTokenAccountsState =
  | { error: unknown; status: 'error' }
  | { status: 'loading' }
  | { status: 'success'; tokenAccounts: WalletTokenAccount[] }

export function useWalletTokenAccountsQuery({
  account,
  client,
  cluster,
}: {
  account: UiWalletAccount
  client: SolanaClient
  cluster: SolanaClusterId
}) {
  // client.rpc is derived from the selected cluster and should not participate in cache identity.
  // eslint-disable-next-line @tanstack/query/exhaustive-deps
  const { data, error, isError, isFetching, refetch } = useQuery({
    queryFn: async () =>
      getWalletTokenAccountsByOwner({
        ownerAddress: address(account.address),
        rpc: client.rpc,
      }),
    queryKey: ['wallet-token-accounts', account.address, cluster],
  })

  const state: WalletTokenAccountsState = isFetching
    ? { status: 'loading' }
    : isError
      ? { error, status: 'error' }
      : data !== undefined
        ? { status: 'success', tokenAccounts: data }
        : { status: 'loading' }

  return {
    refresh() {
      void refetch()
    },
    state,
  }
}

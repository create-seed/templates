import { address, type Lamports } from '@solana/kit'
import { useQuery } from '@tanstack/react-query'
import { type SolanaClusterId, type UiWalletAccount } from '@wallet-ui/react'

import type { SolanaClient } from '@/solana/data-access/solana-client'

export type WalletBalanceState =
  | { balance: Lamports; status: 'success' }
  | { error: unknown; status: 'error' }
  | { status: 'loading' }

export function useWalletBalanceQuery({
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
    queryFn: async () => {
      const { value } = await client.rpc.getBalance(address(account.address), { commitment: 'confirmed' }).send()

      return value
    },
    queryKey: ['wallet-balance', account.address, cluster],
  })

  function refresh() {
    void refetch()
  }

  const state: WalletBalanceState = isFetching
    ? { status: 'loading' }
    : isError
      ? { error, status: 'error' }
      : data !== undefined
        ? { balance: data, status: 'success' }
        : { status: 'loading' }

  return {
    refresh,
    state,
  }
}

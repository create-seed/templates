import { useWalletUi } from '@wallet-ui/react'
import { useMemo } from 'react'

import { createSolanaClient } from './create-solana-client'
import { type SolanaClient } from './solana-client'

export function useSolanaClient() {
  const { cluster } = useWalletUi()

  return useMemo(() => createSolanaClient({ http: cluster.url }) as SolanaClient, [cluster.url])
}

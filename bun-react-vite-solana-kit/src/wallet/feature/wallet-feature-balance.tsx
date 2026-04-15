import { type SolanaClusterId, type UiWalletAccount } from '@wallet-ui/react'

import { useSolanaClient } from '@/solana/data-access/use-solana-client'
import { useWalletBalanceQuery } from '@/wallet/data-access/use-wallet-balance-query'
import { WalletUiBalanceCard } from '@/wallet/ui/wallet-ui-balance-card'

export function WalletFeatureBalance({ account, cluster }: { account: UiWalletAccount; cluster: SolanaClusterId }) {
  const client = useSolanaClient()
  const { refresh, state } = useWalletBalanceQuery({ account, client, cluster })

  return <WalletUiBalanceCard accountAddress={account.address} cluster={cluster} onRefresh={refresh} state={state} />
}

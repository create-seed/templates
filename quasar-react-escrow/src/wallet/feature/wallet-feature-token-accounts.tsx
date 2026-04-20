import { type SolanaClusterId, type UiWalletAccount } from '@wallet-ui/react'

import { useSolanaClient } from '@/solana/data-access/use-solana-client'
import { useWalletTokenAccountsQuery } from '@/wallet/data-access/use-wallet-token-accounts-query'
import { WalletUiTokenAccountsCard } from '@/wallet/ui/wallet-ui-token-accounts-card'

export function WalletFeatureTokenAccounts({
  account,
  cluster,
}: {
  account: UiWalletAccount
  cluster: SolanaClusterId
}) {
  const client = useSolanaClient()
  const { refresh, state } = useWalletTokenAccountsQuery({ account, client, cluster })

  return <WalletUiTokenAccountsCard accountAddress={account.address} onRefresh={refresh} state={state} />
}

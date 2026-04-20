import type { UiWallet, UiWalletAccount } from '@wallet-ui/react'

import { SolanaUiDisconnect } from '@/solana/ui/solana-ui-disconnect'
import { WalletUiAccountCard } from '@/wallet/ui/wallet-ui-account-card'

export function WalletFeatureAccount({ account, wallet }: { account: UiWalletAccount; wallet: UiWallet }) {
  return (
    <WalletUiAccountCard
      accountAddress={account.address}
      action={<SolanaUiDisconnect wallet={wallet} />}
      wallet={wallet}
    />
  )
}

import type { SolanaUiWalletGuardRenderProps } from '@/solana/ui/solana-ui-wallet-guard'

import { WalletFeatureAccount } from '@/wallet/feature/wallet-feature-account'
import { WalletFeatureBalance } from '@/wallet/feature/wallet-feature-balance'
import { WalletFeatureSignAndSendTransaction } from '@/wallet/feature/wallet-feature-sign-and-send-transaction'
import { WalletFeatureSignIn } from '@/wallet/feature/wallet-feature-sign-in'
import { WalletFeatureSignMessage } from '@/wallet/feature/wallet-feature-sign-message'
import { WalletFeatureSignTransaction } from '@/wallet/feature/wallet-feature-sign-transaction'

export function WalletFeatureConnected({ account, cluster, wallet }: SolanaUiWalletGuardRenderProps) {
  return (
    <div className="mx-auto my-4 max-w-6xl px-4">
      <div className="space-y-6">
        <WalletFeatureAccount account={account} wallet={wallet} />
        <WalletFeatureBalance account={account} cluster={cluster.id} />
        <WalletFeatureSignIn account={account} cluster={cluster.id} wallet={wallet} />
        <WalletFeatureSignMessage account={account} />
        <WalletFeatureSignAndSendTransaction account={account} />
        <WalletFeatureSignTransaction account={account} cluster={cluster.id} />
      </div>
    </div>
  )
}

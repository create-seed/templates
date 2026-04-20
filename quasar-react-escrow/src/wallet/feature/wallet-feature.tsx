import { SolanaUiWalletGuard } from '@/solana/ui/solana-ui-wallet-guard'
import { WalletFeatureConnected } from '@/wallet/feature/wallet-feature-connected'

export function WalletFeature() {
  return <SolanaUiWalletGuard render={WalletFeatureConnected} />
}

export { WalletFeature as Component }

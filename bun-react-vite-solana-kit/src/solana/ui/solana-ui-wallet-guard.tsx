import type { ReactNode } from 'react'

import { type SolanaCluster, type UiWallet, type UiWalletAccount, useWalletUi } from '@wallet-ui/react'

import { SolanaUiWalletDialog } from '@/solana/ui/solana-ui-wallet-dialog'

export interface SolanaUiWalletGuardRenderProps {
  account: UiWalletAccount
  cluster: SolanaCluster
  wallet: UiWallet
}

export function SolanaUiWalletGuard({ render }: { render: (props: SolanaUiWalletGuardRenderProps) => ReactNode }) {
  const { account, cluster, wallet } = useWalletUi()

  if (account && wallet) {
    return render({ account, cluster, wallet })
  }
  return (
    <div className="flex h-full items-center justify-center">
      <SolanaUiWalletDialog />
    </div>
  )
}

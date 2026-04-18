import type { ReactNode } from 'react'

import { type UiWallet, WalletUiIcon } from '@wallet-ui/react'

import { Card, CardAction, CardDescription, CardHeader, CardTitle } from '@/core/ui/card'
import { SolanaUiAddress } from '@/solana/ui/solana-ui-address'

export function WalletUiAccountCard({
  accountAddress,
  action,
  wallet,
}: {
  accountAddress: string
  action?: ReactNode
  wallet: UiWallet
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <WalletUiIcon className="size-6" wallet={wallet} />
          <span>{wallet.name}</span>
        </CardTitle>
        <CardDescription>
          <SolanaUiAddress address={accountAddress} />
        </CardDescription>
        {action ? <CardAction className="space-x-2">{action}</CardAction> : null}
      </CardHeader>
    </Card>
  )
}

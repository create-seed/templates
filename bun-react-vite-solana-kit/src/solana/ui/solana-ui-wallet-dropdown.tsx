'use client'

import { type UiWallet, useWalletUi, useWalletUiWallet, WalletUiIcon } from '@wallet-ui/react'

import { Button } from '@/core/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/core/ui/dropdown-menu'
import { cn } from '@/core/util/utils'

import { formatWalletTriggerLabel, INSTALL_WALLETS_URL, sortWallets } from './wallet-utils'

export interface WalletDropdownProps {
  className?: string
}

export function SolanaUiWalletDropdown({ className }: WalletDropdownProps) {
  const { account, connected, copy, disconnect, wallet, wallets } = useWalletUi()
  const sortedWallets = sortWallets(wallets)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button className={cn('justify-start gap-2', className)} variant="outline" />}>
        {connected && wallet ? <WalletUiIcon className="size-4 shrink-0" wallet={wallet} /> : null}
        <span className="truncate">
          {formatWalletTriggerLabel({ accountAddress: account?.address, connected, walletName: wallet?.name })}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {connected ? (
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => copy()}>Copy address</DropdownMenuItem>
            <DropdownMenuItem onClick={() => disconnect()}>Disconnect</DropdownMenuItem>
          </DropdownMenuGroup>
        ) : null}
        {connected && sortedWallets.length > 0 ? <DropdownMenuSeparator className="my-2" /> : null}
        <DropdownMenuGroup>
          {sortedWallets.length > 0 ? (
            sortedWallets.map((availableWallet) => (
              <WalletDropdownWalletItem key={availableWallet.name} wallet={availableWallet} />
            ))
          ) : (
            <DropdownMenuItem onClick={openInstallWalletsPage}>Install a Solana wallet</DropdownMenuItem>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function openInstallWalletsPage() {
  window.open(INSTALL_WALLETS_URL, '_blank', 'noopener,noreferrer')
}

function WalletDropdownWalletItem({ wallet }: { wallet: UiWallet }) {
  const { connect } = useWalletUiWallet({ wallet })

  return (
    <DropdownMenuItem onClick={() => void connect()}>
      <WalletUiIcon className="size-4 shrink-0" wallet={wallet} />
      <span className="truncate">{wallet.name}</span>
    </DropdownMenuItem>
  )
}

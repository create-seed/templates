import { type UiWallet, useDisconnect } from '@wallet-ui/react'
import { LucideUnplug } from 'lucide-react'

import { Button } from '@/core/ui/button'
import { Spinner } from '@/core/ui/spinner'

export function SolanaUiDisconnect({ wallet }: { wallet: UiWallet }) {
  const [isLoading, disconnect] = useDisconnect(wallet)

  return (
    <Button disabled={isLoading} onClick={() => disconnect()} size="sm" variant="secondary">
      {isLoading ? <Spinner /> : <LucideUnplug />}
      Disconnect
    </Button>
  )
}

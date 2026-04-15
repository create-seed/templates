import { type UiWallet, useConnect } from '@wallet-ui/react'
import { LucidePlug } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/core/ui/button'
import { Spinner } from '@/core/ui/spinner'

export function SolanaUiConnect({ wallet }: { wallet: UiWallet }) {
  const [isLoading, connect] = useConnect(wallet)

  return (
    <Button
      disabled={isLoading}
      onClick={async () =>
        connect().catch((err: unknown) => {
          const message = err instanceof Error ? err.message : String(err)
          toast.error(`Error connecting wallet: ${message}`)
        })
      }
      size="sm"
      variant="secondary"
    >
      {isLoading ? <Spinner /> : <LucidePlug />}
      Connect
    </Button>
  )
}

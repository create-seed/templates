import { type Lamports } from '@solana/kit'
import { type SolanaClusterId } from '@wallet-ui/react'
import { LucideRefreshCw } from 'lucide-react'

import type { WalletBalanceState } from '@/wallet/data-access/use-wallet-balance-query'

import { Button } from '@/core/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/core/ui/card'
import { Spinner } from '@/core/ui/spinner'
import { SolanaUiAddress } from '@/solana/ui/solana-ui-address'

const LAMPORTS_PER_SOL = 1_000_000_000n

export function WalletUiBalanceCard({
  accountAddress,
  cluster,
  onRefresh,
  state,
}: {
  accountAddress: string
  cluster: SolanaClusterId
  onRefresh(): void
  state: WalletBalanceState
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Balance</CardTitle>
        <CardDescription>
          {formatCluster(cluster)} balance for <SolanaUiAddress address={accountAddress} />
        </CardDescription>
        <CardAction>
          <Button
            aria-label="Refresh balance"
            disabled={state.status === 'loading'}
            onClick={onRefresh}
            size="icon"
            variant="outline"
          >
            {state.status === 'loading' ? <Spinner /> : <LucideRefreshCw />}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {state.status === 'success' ? (
          <div className="space-y-1">
            <div className="font-mono text-2xl font-semibold">{formatSolBalance(state.balance)}</div>
            <div className="font-mono text-muted-foreground">{state.balance.toLocaleString()} lamports</div>
          </div>
        ) : null}
        {state.status === 'loading' ? <div className="text-muted-foreground">Loading balance...</div> : null}
        {state.status === 'error' ? (
          <div className="text-destructive">Unable to load balance: {formatError(state.error)}</div>
        ) : null}
      </CardContent>
    </Card>
  )
}

function formatCluster(cluster: SolanaClusterId) {
  return cluster.replace('solana:', '')
}

function formatError(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message)
  }
  if (typeof error === 'string' && error.trim().length > 0) {
    return error
  }
  return 'Unknown error occurred'
}

function formatSolBalance(balance: Lamports) {
  const fraction = (balance % LAMPORTS_PER_SOL).toString().padStart(9, '0').replace(/0+$/, '')
  const whole = balance / LAMPORTS_PER_SOL

  return `${whole}${fraction ? `.${fraction}` : ''} SOL`
}

import { LucideRefreshCw } from 'lucide-react'

import type { WalletTokenAccountsState } from '@/wallet/data-access/use-wallet-token-accounts-query'

import { Badge } from '@/core/ui/badge'
import { Button } from '@/core/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/core/ui/card'
import { Spinner } from '@/core/ui/spinner'
import { SolanaUiAddress } from '@/solana/ui/solana-ui-address'

export function WalletUiTokenAccountsCard({
  accountAddress,
  onRefresh,
  state,
}: {
  accountAddress: string
  onRefresh(): void
  state: WalletTokenAccountsState
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Token Accounts</CardTitle>
        <CardDescription>
          Parsed token accounts owned by <SolanaUiAddress address={accountAddress} />. These same accounts power the
          escrow form dropdowns.
        </CardDescription>
        <CardAction>
          <Button
            aria-label="Refresh token accounts"
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
          state.tokenAccounts.length ? (
            <div className="space-y-3">
              {state.tokenAccounts.map((tokenAccount) => (
                <div
                  className="space-y-2 rounded-lg border border-border/60 bg-muted/20 p-3"
                  key={tokenAccount.address}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{tokenAccount.programLabel}</Badge>
                    <Badge variant={tokenAccount.state === 'initialized' ? 'secondary' : 'outline'}>
                      {formatState(tokenAccount.state)}
                    </Badge>
                    <span className="font-mono text-sm font-semibold">{tokenAccount.uiAmountString}</span>
                  </div>
                  <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                    <div>
                      <div className="font-medium text-foreground">Token account</div>
                      <div className="font-mono">
                        <SolanaUiAddress address={tokenAccount.address} len={8} />
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-foreground">Mint</div>
                      <div className="font-mono">
                        <SolanaUiAddress address={tokenAccount.mint} len={8} />
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-foreground">Raw amount</div>
                      <div className="font-mono">{tokenAccount.rawAmount}</div>
                    </div>
                    <div>
                      <div className="font-medium text-foreground">Decimals</div>
                      <div className="font-mono">{tokenAccount.decimals}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground">
              No token accounts were found for this wallet on the selected cluster.
            </div>
          )
        ) : null}
        {state.status === 'loading' ? <div className="text-muted-foreground">Loading token accounts...</div> : null}
        {state.status === 'error' ? (
          <div className="text-destructive">Unable to load token accounts: {formatError(state.error)}</div>
        ) : null}
      </CardContent>
    </Card>
  )
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

function formatState(state: string) {
  return `${state.slice(0, 1).toUpperCase()}${state.slice(1)}`
}

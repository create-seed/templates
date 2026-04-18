import { type SolanaCluster, type UiWallet, type UiWalletAccount, WalletUiIcon } from '@wallet-ui/react'

import { Alert, AlertDescription, AlertTitle } from '@/core/ui/alert'
import { Badge } from '@/core/ui/badge'
import { Button } from '@/core/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/core/ui/card'
import { Spinner } from '@/core/ui/spinner'
import { useCounterAccountQuery } from '@/counter/data-access/use-counter-account-query'
import { useCounterProgramMutation } from '@/counter/data-access/use-counter-program-mutation'
import { CounterUiSetForm } from '@/counter/ui/counter-ui-set-form'
import { useSolanaClient } from '@/solana/data-access/use-solana-client'
import { SolanaUiExplorerLink } from '@/solana/ui/solana-ui-explorer-link'
import { SolanaUiWalletGuard } from '@/solana/ui/solana-ui-wallet-guard'

export function CounterFeature() {
  return (
    <SolanaUiWalletGuard
      render={({ account, cluster, wallet }) => (
        <CounterFeatureConnected account={account} cluster={cluster} wallet={wallet} />
      )}
    />
  )
}

function CounterFeatureConnected({
  account,
  cluster,
  wallet,
}: {
  account: UiWalletAccount
  cluster: SolanaCluster
  wallet: UiWallet
}) {
  const client = useSolanaClient()
  const counterAccount = useCounterAccountQuery({
    account,
    client,
    cluster: cluster.id,
  })
  const counterMutation = useCounterProgramMutation({
    account,
    client,
    cluster: cluster.id,
  })
  const canWrite = counterAccount.programStatus === 'deployed' && !counterMutation.isLoading
  const isInitialized = counterAccount.counter !== null
  const latestAction = formatActionLabel(counterMutation.lastAction)
  const statusLabel = counterAccount.isLoading
    ? 'Loading'
    : counterAccount.programStatus !== 'deployed'
      ? 'Unavailable'
      : isInitialized
        ? 'Initialized'
        : 'Uninitialized'
  const statusVariant = counterAccount.isLoading
    ? 'secondary'
    : counterAccount.programStatus !== 'deployed'
      ? 'destructive'
      : isInitialized
        ? 'default'
        : 'outline'

  return (
    <div className="mx-auto my-4 max-w-6xl px-4">
      <Card className="border-border/60">
        <CardHeader className="gap-2">
          <CardTitle className="flex gap-2 text-xl font-semibold tracking-tight">
            <WalletUiIcon className="size-6" wallet={wallet} />
            {wallet.name}
          </CardTitle>
          <CardDescription className="max-w-2xl text-sm/6">{account.address}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {counterAccount.isError ? (
            <Alert variant="destructive">
              <AlertTitle>Unable to load counter state</AlertTitle>
              <AlertDescription>{formatUnknownError(counterAccount.error)}</AlertDescription>
            </Alert>
          ) : null}
          {counterAccount.programMessage ? (
            <Alert>
              <AlertTitle>Program unavailable on this cluster</AlertTitle>
              <AlertDescription>{counterAccount.programMessage}</AlertDescription>
            </Alert>
          ) : null}
          <div className="grid gap-3 lg:grid-cols-4">
            <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
              <div className="text-sm font-medium">Program</div>
              <div className="mt-4 space-y-2 text-xs">
                <div className="font-medium">Cluster</div>
                <div className="font-mono text-muted-foreground">{cluster.label}</div>
                <div className="font-medium">Program address</div>
                <SolanaUiExplorerLink
                  className="inline-flex gap-1 font-mono text-xs"
                  label={formatAddress(counterAccount.programAddress)}
                  path={`/address/${counterAccount.programAddress}`}
                />
                <div className="font-medium">Counter PDA</div>
                {counterAccount.counterAddress ? (
                  <SolanaUiExplorerLink
                    className="inline-flex gap-1 font-mono text-xs"
                    label={formatAddress(counterAccount.counterAddress)}
                    path={`/address/${counterAccount.counterAddress}`}
                  />
                ) : (
                  <div className="text-muted-foreground">Deriving counter address...</div>
                )}
                <div className="text-xs/relaxed text-muted-foreground">
                  {counterAccount.isRefreshing
                    ? 'Refreshing on-chain state...'
                    : 'Uses the generated Quasar client and PDA helper for every action.'}
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-medium">Counter state</div>
                <Badge variant={statusVariant}>{statusLabel}</Badge>
              </div>
              <div className="mt-1 text-xs/relaxed text-muted-foreground">
                {counterAccount.programStatus !== 'deployed'
                  ? 'Deploy the program to the selected cluster before sending any counter transactions.'
                  : isInitialized
                    ? 'The PDA is initialized and ready for CRUD operations.'
                    : 'Initialize the PDA to create the wallet-owned counter account.'}
              </div>
              <div className="mt-4 space-y-2 text-xs">
                <div className="font-medium">Current value</div>
                <div className="font-mono text-lg text-foreground">
                  {counterAccount.counter ? counterAccount.counter.value.toLocaleString() : 'Not initialized'}
                </div>
                <div className="font-medium">Authority</div>
                <div className="font-mono text-muted-foreground">
                  {counterAccount.counter
                    ? formatAddress(counterAccount.counter.authority)
                    : formatAddress(account.address)}
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
              <div className="text-sm font-medium">Actions</div>
              <div className="mt-1 text-xs/relaxed text-muted-foreground">
                Sends the same initialize, increment, decrement, set, and delete instructions used in the Quasar tests.
              </div>
              <div className="mt-4 space-y-2">
                <Button
                  className="w-full"
                  disabled={!canWrite || counterAccount.isLoading || isInitialized}
                  onClick={() => void counterMutation.initialize()}
                >
                  {counterMutation.isLoading && counterMutation.lastAction === 'initialize' ? <Spinner /> : null}
                  {counterMutation.isLoading && counterMutation.lastAction === 'initialize'
                    ? 'Sending initialize...'
                    : 'Initialize'}
                </Button>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Button
                    className="w-full"
                    disabled={!canWrite || counterAccount.isLoading || !isInitialized}
                    onClick={() => void counterMutation.decrement()}
                    variant="outline"
                  >
                    {counterMutation.isLoading && counterMutation.lastAction === 'decrement' ? <Spinner /> : null}
                    Decrement
                  </Button>
                  <Button
                    className="w-full"
                    disabled={!canWrite || counterAccount.isLoading || !isInitialized}
                    onClick={() => void counterMutation.increment()}
                    variant="outline"
                  >
                    {counterMutation.isLoading && counterMutation.lastAction === 'increment' ? <Spinner /> : null}
                    Increment
                  </Button>
                </div>
                <CounterUiSetForm
                  disabled={!canWrite || counterAccount.isLoading || !isInitialized}
                  initialValue={counterAccount.counter?.value ?? null}
                  isLoading={counterMutation.isLoading && counterMutation.lastAction === 'set'}
                  key={counterAccount.counter?.value.toString() ?? 'counter-set-form'}
                  onSubmit={(value) => counterMutation.setValue(value)}
                />
                <Button
                  className="w-full"
                  disabled={!canWrite || counterAccount.isLoading || !isInitialized}
                  onClick={() => void counterMutation.deleteCounter()}
                  variant="destructive"
                >
                  {counterMutation.isLoading && counterMutation.lastAction === 'delete' ? <Spinner /> : null}
                  {counterMutation.isLoading && counterMutation.lastAction === 'delete'
                    ? 'Sending delete...'
                    : 'Delete counter'}
                </Button>
              </div>
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-medium">Latest result</div>
                <Badge
                  variant={
                    counterMutation.errorMessage
                      ? 'destructive'
                      : counterMutation.isLoading
                        ? 'secondary'
                        : counterMutation.signature
                          ? 'default'
                          : 'outline'
                  }
                >
                  {counterMutation.errorMessage
                    ? 'Failed'
                    : counterMutation.isLoading
                      ? 'Sending'
                      : counterMutation.signature
                        ? 'Confirmed'
                        : 'Ready'}
                </Badge>
              </div>
              <div className="mt-1 text-xs/relaxed text-muted-foreground">
                {latestAction
                  ? `Tracks the latest ${latestAction.toLowerCase()} attempt from this screen.`
                  : 'No counter transaction has been submitted from this screen yet.'}
              </div>
              {counterMutation.errorMessage ? (
                <Alert className="mt-4" variant="destructive">
                  <AlertTitle>{latestAction ? `${latestAction} failed` : 'Transaction failed'}</AlertTitle>
                  <AlertDescription>{counterMutation.errorMessage}</AlertDescription>
                </Alert>
              ) : null}
              {counterMutation.signature ? (
                <div className="mt-4 space-y-2">
                  <div className="text-xs font-medium">Latest signature</div>
                  <SolanaUiExplorerLink
                    className="inline-flex gap-1 font-mono text-xs"
                    label={formatAddress(counterMutation.signature)}
                    path={`/tx/${counterMutation.signature}`}
                  />
                </div>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function formatActionLabel(action: null | string) {
  switch (action) {
    case 'decrement':
      return 'Decrement'
    case 'delete':
      return 'Delete'
    case 'increment':
      return 'Increment'
    case 'initialize':
      return 'Initialize'
    case 'set':
      return 'Set'
    default:
      return null
  }
}

function formatAddress(value: string) {
  return `${value.slice(0, 8)}...${value.slice(-8)}`
}

function formatUnknownError(error: unknown) {
  return error instanceof Error ? error.message : 'Unknown error occurred'
}

export { CounterFeature as Component }

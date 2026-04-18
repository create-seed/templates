import { type SolanaClusterId, type UiWalletAccount } from '@wallet-ui/react'
import { ErrorBoundary } from 'react-error-boundary'
import { toast } from 'sonner'

import { useSolanaClient } from '@/solana/data-access/use-solana-client'
import { SolanaUiExplorerLink } from '@/solana/ui/solana-ui-explorer-link'
import { useWalletSignTransaction } from '@/wallet/data-access/use-wallet-sign-transaction'
import { getErrorMessage, WalletUiError } from '@/wallet/ui/wallet-ui-error'
import { WalletUiSignTransactionForm } from '@/wallet/ui/wallet-ui-sign-transaction-form'

export function WalletFeatureSignTransaction({
  account,
  cluster,
}: {
  account: UiWalletAccount
  cluster: SolanaClusterId
}) {
  const client = useSolanaClient()
  const { isLoading, signTransaction } = useWalletSignTransaction({ account, client, cluster })

  return (
    <ErrorBoundary
      fallbackRender={({ error }) => <WalletUiError error={error} />}
      resetKeys={[account.address, cluster]}
    >
      <WalletUiSignTransactionForm
        isLoading={isLoading}
        onSubmit={async (text) => {
          try {
            const signature = await signTransaction(text)

            toast.success('Transaction signed', {
              description: (
                <SolanaUiExplorerLink
                  className="inline-flex items-center gap-1 underline underline-offset-4"
                  label="View on Solana Explorer"
                  path={`/tx/${signature}`}
                />
              ),
            })

            return true
          } catch (error) {
            toast.error('Error signing transaction', {
              description: getErrorMessage(error, 'Unknown error occurred'),
            })
            return false
          }
        }}
      />
    </ErrorBoundary>
  )
}

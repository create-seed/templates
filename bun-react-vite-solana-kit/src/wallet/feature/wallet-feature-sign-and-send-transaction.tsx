import { type UiWalletAccount } from '@wallet-ui/react'
import { ErrorBoundary } from 'react-error-boundary'
import { toast } from 'sonner'

import { useSolanaClient } from '@/solana/data-access/use-solana-client'
import { SolanaUiExplorerLink } from '@/solana/ui/solana-ui-explorer-link'
import { useWalletSignAndSendTransaction } from '@/wallet/data-access/use-wallet-sign-and-send-transaction'
import { getErrorMessage, WalletUiError } from '@/wallet/ui/wallet-ui-error'
import { WalletUiSignAndSendTransactionForm } from '@/wallet/ui/wallet-ui-sign-and-send-transaction-form'

export function WalletFeatureSignAndSendTransaction({ account }: { account: UiWalletAccount }) {
  const client = useSolanaClient()
  const { isLoading, signAndSendTransaction } = useWalletSignAndSendTransaction({
    account,
    client,
  })

  return (
    <ErrorBoundary fallbackRender={({ error }) => <WalletUiError error={error} />} resetKeys={[account.address]}>
      <WalletUiSignAndSendTransactionForm
        isLoading={isLoading}
        onSubmit={async (text) => {
          try {
            const signature = await signAndSendTransaction(text)

            toast.success('Transaction sent', {
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
            toast.error('Error signing and sending transaction', {
              description: getErrorMessage(error, 'Unknown error occurred'),
            })
            return false
          }
        }}
      />
    </ErrorBoundary>
  )
}

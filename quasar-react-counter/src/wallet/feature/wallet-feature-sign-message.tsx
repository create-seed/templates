import { type UiWalletAccount } from '@wallet-ui/react'
import { ErrorBoundary } from 'react-error-boundary'
import { toast } from 'sonner'

import { SolanaUiAddress } from '@/solana/ui/solana-ui-address'
import { useWalletSignMessage } from '@/wallet/data-access/use-wallet-sign-message'
import { getErrorMessage, WalletUiError } from '@/wallet/ui/wallet-ui-error'
import { WalletUiSignMessageForm } from '@/wallet/ui/wallet-ui-sign-message-form'

export function WalletFeatureSignMessage({ account }: { account: UiWalletAccount }) {
  const { isLoading, signMessage } = useWalletSignMessage({ account })

  return (
    <ErrorBoundary fallbackRender={({ error }) => <WalletUiError error={error} />} resetKeys={[account.address]}>
      <WalletUiSignMessageForm
        isLoading={isLoading}
        onSubmit={async (text) => {
          try {
            const signature = await signMessage(text)

            toast.success('Message signed', {
              description: <SolanaUiAddress address={signature} len={10} />,
            })

            return true
          } catch (error) {
            toast.error('Error signing message', {
              description: getErrorMessage(error, 'Unknown error occurred'),
            })
            return false
          }
        }}
      />
    </ErrorBoundary>
  )
}

import { type SolanaClusterId, type UiWallet, type UiWalletAccount } from '@wallet-ui/react'
import { ErrorBoundary } from 'react-error-boundary'
import { toast } from 'sonner'

import { SolanaUiAddress } from '@/solana/ui/solana-ui-address'
import { useWalletSignIn } from '@/wallet/data-access/use-wallet-sign-in'
import { getErrorMessage, WalletUiError } from '@/wallet/ui/wallet-ui-error'
import { WalletUiSignInForm } from '@/wallet/ui/wallet-ui-sign-in-form'

export function WalletFeatureSignIn({
  account,
  cluster,
  wallet,
}: {
  account: UiWalletAccount
  cluster: SolanaClusterId
  wallet: UiWallet
}) {
  const { getPayload, isLoading, signIn } = useWalletSignIn({ account, cluster, wallet })

  return (
    <ErrorBoundary fallbackRender={({ error }) => <WalletUiError error={error} />} resetKeys={[wallet.name]}>
      <WalletUiSignInForm
        getPayload={getPayload}
        isLoading={isLoading}
        onSubmit={async (statement) => {
          try {
            const nextAccount = await signIn(statement)

            toast.success('Signed in', {
              description: <SolanaUiAddress address={nextAccount?.address} />,
            })

            return true
          } catch (error) {
            toast.error('Error signing in', {
              description: getErrorMessage(error, 'Unknown error occurred'),
            })
            return false
          }
        }}
      />
    </ErrorBoundary>
  )
}

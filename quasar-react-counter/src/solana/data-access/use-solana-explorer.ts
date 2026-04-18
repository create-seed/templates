import { useWalletUi } from '@wallet-ui/react'
import { getExplorerUrl, type GetExplorerUrlProps } from '@wallet-ui/react'

export function useSolanaExplorer(
  { provider }: { provider: GetExplorerUrlProps['provider'] } = { provider: 'solana' },
) {
  const { cluster } = useWalletUi()
  const explorer: Omit<GetExplorerUrlProps, 'path'> = { network: cluster, provider }
  return (path: GetExplorerUrlProps['path']) => getExplorerUrl({ ...explorer, path })
}

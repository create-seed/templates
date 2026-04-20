import type { ExplorerPath } from '@wallet-ui/react'

import { ArrowUpRightFromSquare } from 'lucide-react'
import { type ReactNode } from 'react'

import { useSolanaExplorer } from '@/solana/data-access/use-solana-explorer'

export function SolanaUiExplorerLink({
  className,
  label = '',
  path,
}: {
  className?: string
  label: ReactNode
  path: ExplorerPath
}) {
  const getExplorerUrl = useSolanaExplorer()
  return (
    <a
      className={className ? className : `link inline-flex gap-1 font-mono`}
      href={getExplorerUrl(path)}
      rel="noopener noreferrer"
      target="_blank"
    >
      {label}
      <ArrowUpRightFromSquare size={12} />
    </a>
  )
}

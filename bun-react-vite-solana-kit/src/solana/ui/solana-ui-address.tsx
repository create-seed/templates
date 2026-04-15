import { type Address } from '@solana/kit'
import { ellipsify } from '@wallet-ui/react'

export function SolanaUiAddress({ address, len = 6 }: { address?: Address | string; len?: number }) {
  if (!address) {
    return null
  }
  return ellipsify(address, len, '…')
}

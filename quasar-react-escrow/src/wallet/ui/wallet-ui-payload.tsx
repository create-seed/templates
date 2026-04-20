import { type SolanaSignInInput } from '@wallet-ui/react'

export function WalletUiPayload({ data, label }: { data: SolanaSignInInput; label?: string }) {
  return (
    <pre className="max-h-96 overflow-auto rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
      {label ? `${label}: ` : ''}
      {JSON.stringify(data, null, 2)}
    </pre>
  )
}

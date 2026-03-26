import { cn } from '@bun-platform/ui/lib/utils'

interface ShellUiStatusIndicatorProps {
  status: 'connected' | 'disconnected' | 'loading'
}

export function ShellUiStatusIndicator({ status }: ShellUiStatusIndicatorProps) {
  const label =
    status === 'loading' ? 'Checking API status' : status === 'connected' ? 'API connected' : 'API disconnected'

  return (
    <div aria-label={label} role="status" title={label}>
      <div
        aria-hidden="true"
        className={cn(
          'size-2.5 rounded-full',
          status === 'loading' ? 'bg-muted-foreground/50' : status === 'connected' ? 'bg-green-500' : 'bg-destructive',
        )}
      />
      <span className="sr-only">{label}</span>
    </div>
  )
}

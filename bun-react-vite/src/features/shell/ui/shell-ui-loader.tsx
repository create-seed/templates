import { Loader2Icon } from 'lucide-react'

import { cn } from '@/lib/utils.ts'

export function ShellUiLoader({ fullScreen = false }: { fullScreen?: boolean }) {
  return (
    <div
      aria-live="polite"
      className={cn(
        'flex w-full flex-col items-center justify-center gap-3 py-10 text-center text-muted-foreground',
        fullScreen && 'min-h-screen px-4 py-0',
      )}
      role="status"
    >
      <Loader2Icon aria-hidden className="size-5 animate-spin" />
      <div className="text-sm font-medium">Loading...</div>
    </div>
  )
}

export default ShellUiLoader

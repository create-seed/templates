import { Link } from 'react-router'

import { cn } from '@/core/util/utils'

export function ShellUiNotFoundLink({ description, title, to }: { description: string; title: string; to: string }) {
  return (
    <Link
      className={cn(
        'block rounded-lg border border-border/60 bg-muted/20 p-4 transition-colors outline-none',
        'cursor-pointer hover:border-primary focus-visible:border-primary',
      )}
      to={to}
    >
      <div className="text-sm font-medium">{title}</div>
      <div className="mt-1 text-xs/relaxed text-muted-foreground">{description}</div>
    </Link>
  )
}

import type { ShellNotFoundProps } from '@/shell/data-access/shell-not-found-props'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/core/ui/card'
import { ShellUiNotFoundLink } from '@/shell/ui/shell-ui-not-found-link'

export function ShellUiNotFoundCard({ description, links = [], title }: ShellNotFoundProps) {
  return (
    <div className="relative flex h-full w-full flex-1 items-center justify-center overflow-hidden px-4 py-10">
      <div className="bg-[radial-gradient(circle_at_top,var(--color-foreground),transparent_45%)]/5 pointer-events-none absolute inset-0" />
      <div className="bg-[radial-gradient(circle,var(--color-primary),transparent_70%)]/8 pointer-events-none absolute inset-x-0 top-1/3 h-32 blur-3xl" />
      <Card className="relative w-full max-w-2xl border-border/60 bg-card/95 shadow-sm backdrop-blur">
        <CardHeader className="gap-3">
          <div className="w-fit rounded-full border border-border/60 bg-muted/30 px-3 py-1 font-mono text-[0.625rem] tracking-[0.35em] text-muted-foreground uppercase">
            404
          </div>
          <CardTitle className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</CardTitle>
          <CardDescription className="max-w-xl text-sm/6">{description}</CardDescription>
        </CardHeader>
        {links.length ? (
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {links.map((link) => (
              <ShellUiNotFoundLink key={link.to} {...link} />
            ))}
          </CardContent>
        ) : null}
      </Card>
    </div>
  )
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function AboutFeature() {
  return (
    <div className="w-full max-w-3xl">
      <Card className="border-border/60">
        <CardHeader className="gap-2">
          <CardTitle className="text-xl font-semibold tracking-tight">About</CardTitle>
          <CardDescription className="max-w-2xl text-sm/6">
            Bun React Vite is a simple starter for dashboards, settings pages, and other internal tools built with a
            clean shell and reusable UI primitives.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
            <div className="text-sm font-medium">Consistent UI</div>
            <div className="mt-1 text-xs/relaxed text-muted-foreground">
              Shared cards, controls, and spacing patterns.
            </div>
          </div>
          <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
            <div className="text-sm font-medium">Good starter shape</div>
            <div className="mt-1 text-xs/relaxed text-muted-foreground">
              Useful for analytics, CRUD flows, and settings.
            </div>
          </div>
          <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
            <div className="text-sm font-medium">Responsive layout</div>
            <div className="mt-1 text-xs/relaxed text-muted-foreground">
              Readable on smaller screens without feeling empty on larger ones.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export { AboutFeature as Component }

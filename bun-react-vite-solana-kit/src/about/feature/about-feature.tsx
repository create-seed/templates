import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/core/ui/card'

export function AboutFeature() {
  return (
    <div className="flex h-full w-full flex-1 flex-col items-center justify-center">
      <Card className="max-w-3xl border-border/60">
        <CardHeader className="gap-2">
          <CardTitle className="text-xl font-semibold tracking-tight">About</CardTitle>
          <CardDescription className="max-w-2xl text-sm/6">
            Bun React Vite Solana Kit is a starter for Solana apps that need wallet connection, signing flows, cluster
            switching, and a polished React UI from day one.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
            <div className="text-sm font-medium">Wallet-ready flows</div>
            <div className="mt-1 text-xs/relaxed text-muted-foreground">
              Connect wallets, view balances, and test sign in, sign message, sign transaction, and send transaction
              flows.
            </div>
          </div>
          <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
            <div className="text-sm font-medium">Solana client setup</div>
            <div className="mt-1 text-xs/relaxed text-muted-foreground">
              Includes Solana Kit client wiring, explorer links, and cluster-aware state for local development and
              testing.
            </div>
          </div>
          <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
            <div className="text-sm font-medium">Modern app shell</div>
            <div className="mt-1 text-xs/relaxed text-muted-foreground">
              Built with Vite, React, TypeScript, Tailwind CSS v4, and reusable UI primitives that are ready to extend.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export { AboutFeature as Component }

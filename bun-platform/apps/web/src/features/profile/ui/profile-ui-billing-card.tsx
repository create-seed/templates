import { Loader2 } from 'lucide-react'
import { Button } from '@bun-platform/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@bun-platform/ui/components/card'

interface ProfileUiBillingCardProps {
  actionLabel: string
  currentPlanLabel: string
  isActionPending: boolean
  isBillingEnabled: boolean
  isError: boolean
  isPending: boolean
  onAction: () => void
  onRetry: () => void
}

export function ProfileUiBillingCard({
  actionLabel,
  currentPlanLabel,
  isActionPending,
  isBillingEnabled,
  isError,
  isPending,
  onAction,
  onRetry,
}: ProfileUiBillingCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing</CardTitle>
        <CardDescription>Manage your Bun Platform plan and subscription.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isBillingEnabled ? (
          <p className="text-muted-foreground text-sm">Billing is disabled until `POLAR_ACCESS_TOKEN` is configured.</p>
        ) : isPending ? (
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Loader2 className="size-4 animate-spin" />
            Loading billing details
          </div>
        ) : isError ? (
          <>
            <p className="text-muted-foreground text-sm">We couldn&apos;t load your billing details.</p>
            <Button onClick={onRetry} variant="outline">
              Retry
            </Button>
          </>
        ) : (
          <>
            <div>
              <p className="text-muted-foreground text-sm">Current plan</p>
              <p className="text-lg font-medium">{currentPlanLabel}</p>
            </div>
            <Button disabled={isActionPending} onClick={onAction}>
              {isActionPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Working
                </>
              ) : (
                actionLabel
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}

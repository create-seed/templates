import { useProfileManageSubscription } from '../data-access/use-profile-manage-subscription'
import { useProfilePaymentState } from '../data-access/use-profile-payment-state'
import { useProfileStartCheckout } from '../data-access/use-profile-start-checkout'
import { ProfileUiAccountCard } from '../ui/profile-ui-account-card'
import { ProfileUiBillingCard } from '../ui/profile-ui-billing-card'

interface ProfileFeatureIndexProps {
  session: {
    user: {
      email: string
      name: string
      role?: string | null
    }
  }
}

export function ProfileFeatureIndex({ session }: ProfileFeatureIndexProps) {
  const paymentState = useProfilePaymentState()
  const manageSubscription = useProfileManageSubscription()
  const startCheckout = useProfileStartCheckout()

  const billingEnabled = paymentState.data?.billingEnabled ?? true
  const hasProSubscription = (paymentState.data?.customerState?.activeSubscriptions?.length ?? 0) > 0
  const isBillingActionPending = manageSubscription.isPending || startCheckout.isPending

  return (
    <div className="min-h-full overflow-y-auto px-4 py-6">
      <div className="mx-auto grid w-full max-w-3xl gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <ProfileUiAccountCard email={session.user.email} name={session.user.name} role={session.user.role ?? 'user'} />
        <ProfileUiBillingCard
          actionLabel={hasProSubscription ? 'Manage Subscription' : 'Upgrade to Pro'}
          currentPlanLabel={hasProSubscription ? 'Pro' : 'Free'}
          isActionPending={isBillingActionPending}
          isBillingEnabled={billingEnabled}
          isError={paymentState.isError}
          isPending={paymentState.isPending}
          onAction={() => {
            if (!billingEnabled) {
              return
            }

            if (hasProSubscription) {
              manageSubscription.mutate()
              return
            }

            startCheckout.mutate()
          }}
          onRetry={() => {
            void paymentState.refetch()
          }}
        />
      </div>
    </div>
  )
}

import { HomeFeatureIndex } from '@/features/home/home-feature-index'
import { useOnboardStatusQuery } from '@/features/onboard/data-access/use-onboard-status-query'
import { OnboardFeatureLanding } from '@/features/onboard/onboard-feature-landing'
import { OnboardUiLoading } from '@/features/onboard/ui/onboard-ui-loading'

export function OnboardFeatureEntry() {
  const { isLoading, isOnboarded, refresh } = useOnboardStatusQuery()

  if (isLoading) {
    return <OnboardUiLoading />
  }

  if (isOnboarded) {
    return <HomeFeatureIndex onSignedOut={refresh} />
  }

  return <OnboardFeatureLanding onOnboarded={refresh} />
}

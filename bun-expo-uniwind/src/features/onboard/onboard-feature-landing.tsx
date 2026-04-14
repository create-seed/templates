import { useState } from 'react'

import { useOnboardComplete } from '@/features/onboard/data-access/use-onboard-complete'
import { OnboardUiGetStarted } from '@/features/onboard/ui/onboard-ui-get-started'

interface OnboardFeatureLandingProps {
  onOnboarded: () => Promise<void>
}

export function OnboardFeatureLanding({ onOnboarded }: OnboardFeatureLandingProps) {
  const [errorMessage, setErrorMessage] = useState<null | string>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { completeOnboarding } = useOnboardComplete()

  async function handleGetStarted() {
    if (isSubmitting) {
      return
    }

    setErrorMessage(null)
    setIsSubmitting(true)

    try {
      const didComplete = await completeOnboarding()

      if (!didComplete) {
        setErrorMessage('Unable to save your onboarding state right now.')
        setIsSubmitting(false)
        return
      }

      await onOnboarded()
    } catch (error) {
      console.error('Failed to finalize onboarding flow.', error)
      setErrorMessage('Unable to continue right now. Please try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <OnboardUiGetStarted
      errorMessage={errorMessage}
      isSubmitting={isSubmitting}
      onGetStarted={() => void handleGetStarted()}
    />
  )
}

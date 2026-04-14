import { useRouter } from 'expo-router'
import { useState } from 'react'

import { HomeUiIndex } from '@/features/home/ui/home-ui-index'
import { useOnboardReset } from '@/features/onboard/data-access/use-onboard-reset'

interface HomeFeatureIndexProps {
  onSignedOut: () => Promise<void>
}

export function HomeFeatureIndex({ onSignedOut }: HomeFeatureIndexProps) {
  const router = useRouter()
  const [errorMessage, setErrorMessage] = useState<null | string>(null)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const { resetOnboarding } = useOnboardReset()

  function handleOpenDev() {
    router.push('./dev')
  }

  async function handleSignOut() {
    if (isSigningOut) {
      return
    }

    setErrorMessage(null)
    setIsSigningOut(true)

    try {
      const didReset = await resetOnboarding()

      if (!didReset) {
        setErrorMessage('Unable to sign out right now.')
        setIsSigningOut(false)
        return
      }

      await onSignedOut()
    } catch (error) {
      console.error('Failed to sign out.', error)
      setErrorMessage('Unable to sign out right now.')
      setIsSigningOut(false)
    }
  }

  return (
    <HomeUiIndex
      errorMessage={errorMessage}
      isSigningOut={isSigningOut}
      onOpenDev={handleOpenDev}
      onSignOut={() => void handleSignOut()}
    />
  )
}

import AsyncStorage from '@react-native-async-storage/async-storage'
import { useEffect, useState } from 'react'

import { ONBOARD_STORAGE_KEY } from '@/features/onboard/data-access/onboard-storage'

interface UseOnboardStatusQueryResult {
  isLoading: boolean
  isOnboarded: boolean
  refresh: () => Promise<void>
}

export function useOnboardStatusQuery(): UseOnboardStatusQueryResult {
  const [isLoading, setIsLoading] = useState(true)
  const [isOnboarded, setIsOnboarded] = useState(false)

  async function loadStatus() {
    try {
      const onboardingState = await AsyncStorage.getItem(ONBOARD_STORAGE_KEY)
      return onboardingState === 'true'
    } catch (error) {
      console.error('Failed to read onboarding state.', error)
      return false
    }
  }

  async function refresh() {
    const nextIsOnboarded = await loadStatus()

    setIsLoading(false)
    setIsOnboarded(nextIsOnboarded)
  }

  useEffect(() => {
    let isActive = true

    async function hydrateStatus() {
      const nextIsOnboarded = await loadStatus()

      if (!isActive) {
        return
      }

      setIsLoading(false)
      setIsOnboarded(nextIsOnboarded)
    }

    void hydrateStatus()

    return () => {
      isActive = false
    }
  }, [])

  return { isLoading, isOnboarded, refresh }
}

import AsyncStorage from '@react-native-async-storage/async-storage'

import { ONBOARD_STORAGE_KEY } from '@/features/onboard/data-access/onboard-storage'

interface UseOnboardCompleteResult {
  completeOnboarding: () => Promise<boolean>
}

export function useOnboardComplete(): UseOnboardCompleteResult {
  async function completeOnboarding() {
    try {
      await AsyncStorage.setItem(ONBOARD_STORAGE_KEY, 'true')
      return true
    } catch (error) {
      console.error('Failed to persist onboarding state.', error)
      return false
    }
  }

  return { completeOnboarding }
}

import AsyncStorage from '@react-native-async-storage/async-storage'

import { ONBOARD_STORAGE_KEY } from '@/features/onboard/data-access/onboard-storage'

interface UseOnboardResetResult {
  resetOnboarding: () => Promise<boolean>
}

export function useOnboardReset(): UseOnboardResetResult {
  async function resetOnboarding() {
    try {
      await AsyncStorage.removeItem(ONBOARD_STORAGE_KEY)
      return true
    } catch (error) {
      console.error('Failed to clear onboarding state.', error)
      return false
    }
  }

  return { resetOnboarding }
}

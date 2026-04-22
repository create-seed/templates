import AsyncStorage from '@react-native-async-storage/async-storage'

export const AUTH_STORAGE_KEY = 'bun-expo-uniwind.authenticated'

export async function authStorageAuthenticated() {
  try {
    const authState = await AsyncStorage.getItem(AUTH_STORAGE_KEY)
    return authState === 'true'
  } catch (error) {
    console.error('Failed to read auth state.', error)
    return false
  }
}

export async function authStorageSignIn() {
  try {
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, 'true')
  } catch (error) {
    console.error('Failed to persist auth state.', error)
    throw error
  }
}

export async function authStorageSignOut() {
  try {
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY)
  } catch (error) {
    console.error('Failed to clear auth state.', error)
    throw error
  }
}

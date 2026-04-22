import '../global.css'
import { Stack } from 'expo-router'

import { useAuthStatusQuery } from '@/features/auth/data-access/use-auth-status-query'
import { AuthUiLoading } from '@/features/auth/ui/auth-ui-loading'
import { AppProviders } from '@/features/core/data-access/app-providers'
import { useTheme } from '@/features/shell/data-access/use-theme'

export default function RootLayout() {
  return (
    <AppProviders>
      <RootNavigator />
    </AppProviders>
  )
}

function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuthStatusQuery()
  const { screenOptions } = useTheme()

  if (isLoading) {
    return <AuthUiLoading />
  }

  return (
    <Stack screenOptions={{ ...screenOptions, headerShown: false }}>
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="index" />
      </Stack.Protected>
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
    </Stack>
  )
}

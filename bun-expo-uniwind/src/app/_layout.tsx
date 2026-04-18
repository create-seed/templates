import '../global.css'
import { Stack } from 'expo-router'

import { AppProviders } from '@/features/core/data-access/app-providers'
import { useTheme } from '@/features/shell/data-access/use-theme'

export default function RootLayout() {
  const { screenOptions } = useTheme()

  return (
    <AppProviders>
      <Stack screenOptions={{ ...screenOptions, headerTitle: 'Home' }} />
    </AppProviders>
  )
}

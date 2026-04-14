import '../global.css'
import { Stack } from 'expo-router'

import { useTheme } from '@/features/shell/data-access/use-theme'
import { AppProviders } from '@/lib/app-providers'

export default function RootLayout() {
  const { screenOptions } = useTheme()

  return (
    <AppProviders>
      <Stack screenOptions={{ ...screenOptions, headerTitle: 'Home' }} />
    </AppProviders>
  )
}

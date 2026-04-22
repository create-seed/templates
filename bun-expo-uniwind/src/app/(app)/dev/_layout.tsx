import { Stack } from 'expo-router'

import { useTheme } from '@/features/shell/data-access/use-theme'

export default function DevLayout() {
  const { screenOptions } = useTheme()

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen name="index" options={{ title: 'Dev' }} />
    </Stack>
  )
}

import { Stack } from 'expo-router'

import { useTheme } from '@/features/shell/data-access/use-theme'

export default function AppLayout() {
  const { screenOptions } = useTheme()

  return <Stack initialRouteName="home" screenOptions={screenOptions} />
}

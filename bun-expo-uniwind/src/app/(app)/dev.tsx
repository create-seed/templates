import { Stack } from 'expo-router'

import { HomeFeatureDev } from '@/features/home/home-feature-dev'

export default function DevRoute() {
  return (
    <Stack.Screen options={{ title: 'Dev' }}>
      <HomeFeatureDev />
    </Stack.Screen>
  )
}

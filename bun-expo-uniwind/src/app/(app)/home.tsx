import { Stack } from 'expo-router'

import { HomeFeatureIndex } from '@/features/home/home-feature-index'

export default function HomeRoute() {
  return (
    <Stack.Screen options={{ title: 'Home' }}>
      <HomeFeatureIndex />
    </Stack.Screen>
  )
}

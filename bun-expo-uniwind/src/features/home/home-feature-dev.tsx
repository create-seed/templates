import { Stack } from 'expo-router'

import { HomeUiDevShowcase } from '@/features/home/ui/home-ui-dev-showcase'

export function HomeFeatureDev() {
  return (
    <>
      <Stack.Screen options={{ title: 'Dev' }} />
      <HomeUiDevShowcase />
    </>
  )
}

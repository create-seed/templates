import { ScrollView, View } from 'react-native'

import { HomeUiCustomizeCard } from '@/features/home/ui/home-ui-customize-card'
import { HomeUiHeroCard } from '@/features/home/ui/home-ui-hero-card'
import { HomeUiWiredInCard } from '@/features/home/ui/home-ui-wired-in-card'

export function HomeFeatureEntry() {
  return (
    <ScrollView className="flex-1 bg-background" contentInsetAdjustmentBehavior="automatic">
      <View className="gap-6 px-6 py-8">
        <HomeUiHeroCard />
        <HomeUiWiredInCard />
        <HomeUiCustomizeCard />
      </View>
    </ScrollView>
  )
}

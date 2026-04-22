import { ScrollView, View } from 'react-native'

import { SettingsFeatureAccount } from '@/features/settings/settings-feature-account'
import { SettingsUiAppearanceCard } from '@/features/settings/ui/settings-ui-appearance-card'
import { SettingsUiIntroCard } from '@/features/settings/ui/settings-ui-intro-card'

export function SettingsFeatureEntry() {
  return (
    <ScrollView className="flex-1 bg-background" contentInsetAdjustmentBehavior="automatic">
      <View className="gap-6 px-6 py-8">
        <SettingsUiIntroCard />
        <SettingsUiAppearanceCard />
        <SettingsFeatureAccount />
      </View>
    </ScrollView>
  )
}

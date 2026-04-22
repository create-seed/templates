import { Text, View } from 'react-native'

export function SettingsUiIntroCard() {
  return (
    <View className="gap-3 rounded-3xl border border-black/5 bg-neutral-50 p-6 dark:border-white/10 dark:bg-neutral-900">
      <Text className="text-2xl font-semibold text-neutral-950 dark:text-neutral-50">Settings</Text>
      <Text className="text-base leading-6 text-neutral-600 dark:text-neutral-400">
        This starter keeps preferences generic on purpose so you can grow the section without ripping out placeholder
        product-specific settings later.
      </Text>
    </View>
  )
}

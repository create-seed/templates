import { Text, View } from 'react-native'

export function HomeUiCustomizeCard() {
  return (
    <View className="gap-3 rounded-3xl border border-black/5 bg-white/80 p-6 dark:border-white/10 dark:bg-neutral-900/80">
      <Text className="text-lg font-semibold text-foreground">Where to customize first</Text>
      <Text className="text-base leading-6 text-muted">
        Replace this overview with your real product surface, keep the Dev tab while building new UI, and extend
        Settings only when your app needs more user-facing preferences.
      </Text>
    </View>
  )
}

import { Text, View } from 'react-native'

export function HomeUiWiredInCard() {
  return (
    <View className="gap-3 rounded-3xl border border-black/5 bg-white/80 p-6 dark:border-white/10 dark:bg-neutral-900/80">
      <Text className="text-lg font-semibold text-foreground">What is already wired in</Text>
      <Text className="text-base leading-6 text-muted">
        The Home tab gives you a clean landing screen, Dev keeps a removable component sandbox nearby, and Settings
        holds starter preferences and account actions.
      </Text>
    </View>
  )
}

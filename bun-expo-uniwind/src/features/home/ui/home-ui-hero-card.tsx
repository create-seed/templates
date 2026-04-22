import { Text, View } from 'react-native'

export function HomeUiHeroCard() {
  return (
    <View className="gap-3 rounded-3xl border border-black/5 bg-neutral-50 p-6 dark:border-white/10 dark:bg-neutral-900">
      <Text className="text-2xl font-semibold text-neutral-950 dark:text-neutral-50">Bun Expo Uniwind</Text>
      <Text className="text-base leading-6 text-neutral-600 dark:text-neutral-400">
        Expo Router, HeroUI Native, and Uniwind are wired into a protected starter shell that is ready to branch into a
        real product.
      </Text>
    </View>
  )
}

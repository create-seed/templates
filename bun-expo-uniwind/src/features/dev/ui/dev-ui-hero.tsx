import { Text, View } from 'react-native'

export function DevUiHero() {
  return (
    <View className="gap-2">
      <Text className="text-3xl font-semibold text-foreground">HeroUI Native</Text>
      <Text className="text-base leading-6 text-muted">
        Quick-start integration using Bun with representative components wired into this starter tab.
      </Text>
    </View>
  )
}

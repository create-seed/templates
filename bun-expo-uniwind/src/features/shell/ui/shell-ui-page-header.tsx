import { Text, View } from 'react-native'

export function ShellUiPageHeader({ description, title }: { description: string; title: string }) {
  return (
    <View className="gap-2">
      <Text className="text-3xl font-semibold text-foreground">{title}</Text>
      <Text className="text-base leading-6 text-muted">{description}</Text>
    </View>
  )
}

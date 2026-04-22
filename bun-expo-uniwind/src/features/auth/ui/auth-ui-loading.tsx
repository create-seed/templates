import { Text, View } from 'react-native'

export function AuthUiLoading() {
  return (
    <View className="flex-1 items-center justify-center bg-white px-6 py-10 dark:bg-neutral-950">
      <Text className="text-base text-neutral-600 dark:text-neutral-400">Checking auth...</Text>
    </View>
  )
}

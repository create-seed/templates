import { ScrollView, View } from 'react-native'
import { PropsWithChildren } from 'react'

export function ShellUiPage({ children }: PropsWithChildren) {
  return (
    <ScrollView className="flex-1" contentInsetAdjustmentBehavior="automatic">
      <View className="gap-6 px-6 py-8">{children}</View>
    </ScrollView>
  )
}

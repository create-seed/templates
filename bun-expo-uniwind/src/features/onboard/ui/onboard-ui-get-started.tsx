import { Button } from 'heroui-native'
import { Text, View } from 'react-native'

interface OnboardUiGetStartedProps {
  errorMessage: null | string
  isSubmitting: boolean
  onGetStarted: () => void
}

export function OnboardUiGetStarted({ errorMessage, isSubmitting, onGetStarted }: OnboardUiGetStartedProps) {
  return (
    <View className="flex-1 bg-white px-6 py-10 dark:bg-neutral-950">
      <View className="flex-1 items-center justify-center">
        <View className="w-full gap-6 rounded-3xl border border-black/5 bg-neutral-50 p-6 dark:border-white/10 dark:bg-neutral-900">
          <View className="gap-3">
            <Text className="text-2xl font-semibold text-neutral-950 dark:text-neutral-50">
              Welcome to Bun Expo Uniwind
            </Text>
            <Text className="text-base leading-6 text-neutral-600 dark:text-neutral-400">
              Start the mock app flow here. Once you continue, we will keep you on the home screen until you sign out.
            </Text>
          </View>
          <View className="gap-3">
            <Button className="w-full" onPress={onGetStarted}>
              {isSubmitting ? 'Starting...' : 'Get started'}
            </Button>
            {errorMessage ? <Text className="text-sm text-red-600 dark:text-red-400">{errorMessage}</Text> : null}
          </View>
        </View>
      </View>
    </View>
  )
}

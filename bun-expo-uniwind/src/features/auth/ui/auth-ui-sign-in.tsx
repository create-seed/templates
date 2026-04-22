import { Button } from 'heroui-native'
import { Text, View } from 'react-native'

export function AuthUiSignIn({ isSigningIn, onSignIn }: { isSigningIn: boolean; onSignIn: () => void }) {
  return (
    <View className="flex-1 bg-white px-6 py-10 dark:bg-neutral-950">
      <View className="flex-1 items-center justify-center">
        <View className="w-full gap-6 rounded-3xl border border-black/5 bg-neutral-50 p-6 dark:border-white/10 dark:bg-neutral-900">
          <View className="gap-3">
            <Text className="text-2xl font-semibold text-neutral-950 dark:text-neutral-50">Bun Expo Uniwind</Text>
            <Text className="text-base leading-6 text-neutral-600 dark:text-neutral-400">
              This starter includes a placeholder auth gate for protected routes. Replace it with your real auth flow,
              or remove it if you do not need auth.
            </Text>
          </View>
          <View className="gap-3">
            <Button className="w-full" onPress={onSignIn}>
              {isSigningIn ? 'Signing in...' : 'Sign in'}
            </Button>
          </View>
        </View>
      </View>
    </View>
  )
}

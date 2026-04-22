import { Button } from 'heroui-native'
import { Text, View } from 'react-native'

export function SettingsUiAccountCard({ isSigningOut, signOut }: { isSigningOut: boolean; signOut: () => void }) {
  return (
    <View className="gap-4 rounded-3xl border border-black/5 bg-white/80 p-6 dark:border-white/10 dark:bg-neutral-900/80">
      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">Account</Text>
        <Text className="text-base leading-6 text-muted">
          The auth flow is intentionally lightweight. Replace this action when you connect your real account system.
        </Text>
      </View>
      <Button className="w-full" onPress={signOut} variant="secondary">
        {isSigningOut ? 'Signing out...' : 'Sign out'}
      </Button>
    </View>
  )
}

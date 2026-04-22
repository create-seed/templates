import { Link } from 'expo-router'
import { Button } from 'heroui-native'
import { Text, View } from 'react-native'

import { ShellUiThemeSwitcher } from '@/features/shell/ui/shell-ui-theme-switcher'

export function HomeUiIndex({ isSigningOut, onSignOut }: { isSigningOut: boolean; onSignOut: () => void }) {
  return (
    <View className="flex-1 bg-white px-6 py-10 dark:bg-neutral-950">
      <View className="flex-1 items-center gap-6">
        <View className="w-full gap-3 rounded-3xl border border-black/5 bg-neutral-50 p-6 dark:border-white/10 dark:bg-neutral-900">
          <Text className="text-2xl font-semibold text-neutral-950 dark:text-neutral-50">Bun Expo Uniwind</Text>
          <Text className="text-base leading-6 text-neutral-600 dark:text-neutral-400">
            Basic light and dark styling is now wired into the app shell, status bar, and default screen surface.
          </Text>
        </View>
        <View className="w-full gap-3 rounded-3xl border border-black/5 bg-white/80 p-4 dark:border-white/10 dark:bg-neutral-900/80">
          <Link asChild href="/dev">
            <Button className="w-full">Open /dev showcase</Button>
          </Link>
          <Button className="w-full" onPress={onSignOut} variant="secondary">
            {isSigningOut ? 'Signing out...' : 'Sign out'}
          </Button>
        </View>
        <ShellUiThemeSwitcher />
      </View>
    </View>
  )
}

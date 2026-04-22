import { Text, View } from 'react-native'

import { ShellUiThemeSwitcher } from '@/features/shell/ui/shell-ui-theme-switcher'

export function SettingsUiAppearanceCard() {
  return (
    <View className="gap-4 rounded-3xl border border-black/5 bg-white/80 p-6 dark:border-white/10 dark:bg-neutral-900/80">
      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">Appearance</Text>
        <Text className="text-base leading-6 text-muted">
          Theme preference lives here, with room for future notification, privacy, or account settings.
        </Text>
      </View>
      <ShellUiThemeSwitcher />
    </View>
  )
}

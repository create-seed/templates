import { HeroUINativeProvider } from 'heroui-native'
import { ReactNode } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

import { ShellUiThemeStatusBar } from '@/features/shell/ui/shell-ui-theme-status-bar'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <HeroUINativeProvider config={{ devInfo: { stylingPrinciples: false } }}>
        {children}
        <ShellUiThemeStatusBar />
      </HeroUINativeProvider>
    </GestureHandlerRootView>
  )
}

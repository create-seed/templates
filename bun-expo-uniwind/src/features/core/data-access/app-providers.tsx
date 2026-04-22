import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HeroUINativeProvider } from 'heroui-native'
import { ReactNode } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

import { useTheme } from '@/features/shell/data-access/use-theme'
import { ShellUiThemeStatusBar } from '@/features/shell/ui/shell-ui-theme-status-bar'

const queryClient = new QueryClient()

export function AppProviders({ children }: { children: ReactNode }) {
  const { backgroundColor } = useTheme()

  return (
    <GestureHandlerRootView style={{ backgroundColor, flex: 1 }}>
      <HeroUINativeProvider config={{ devInfo: { stylingPrinciples: false } }}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        <ShellUiThemeStatusBar />
      </HeroUINativeProvider>
    </GestureHandlerRootView>
  )
}

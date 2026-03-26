import type { ReactNode } from 'react'

import { ShellDataAccessThemeProvider } from '@/features/shell/data-access/shell-data-access-theme-provider'

export function AppProviders({ children }: { children: ReactNode }) {
  return <ShellDataAccessThemeProvider>{children}</ShellDataAccessThemeProvider>
}

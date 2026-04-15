import type { ReactNode } from 'react'

import { ThemeProvider } from '@/core/data-access/theme-provider'

export function AppProviders({ children }: { children: ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>
}

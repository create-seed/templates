import type { ReactNode } from 'react'

import { ThemeProvider } from '@/components/theme-provider.tsx'

export function AppProviders({ children }: { children: ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>
}

import type { PropsWithChildren } from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'

export function ShellDataAccessThemeProvider({ children }: PropsWithChildren) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="dark" disableTransitionOnChange enableSystem={false}>
      {children}
    </NextThemesProvider>
  )
}

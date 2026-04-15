import type { ReactNode } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { ThemeProvider } from '@/core/data-access/theme-provider'
import { Toaster } from '@/core/ui/sonner'
import { SolanaProvider } from '@/solana/data-access/solana-provider'

const queryClient = new QueryClient()

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <SolanaProvider>
          {children}
          <Toaster closeButton richColors />
        </SolanaProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}

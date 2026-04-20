import { createBrowserRouter, Navigate } from 'react-router'

import type { ShellNotFoundProps } from '@/shell/data-access/shell-not-found-props'

import { ShellFeature, ShellUiLoader } from '@/shell/feature'

export const appRouter = createBrowserRouter([
  {
    children: [
      { element: <Navigate replace to="/escrow" />, index: true },
      {
        lazy: () => import('@/escrow/feature/escrow-feature'),
        path: 'escrow',
      },
      {
        lazy: () => import('@/wallet/feature/wallet-feature'),
        path: 'wallet',
      },
      {
        lazy: () => import('@/shell/feature/shell-not-found-feature'),
        loader: (): ShellNotFoundProps => ({
          links: [
            {
              description: 'Jump back to the escrow playground to create, take, or refund the maker PDA offer.',
              title: 'Escrow',
              to: '/escrow',
            },
            {
              description: 'Open the wallet screen if you were looking for connection and signing tools.',
              title: 'Wallet',
              to: '/wallet',
            },
          ],
        }),
        path: '*',
      },
    ],
    element: (
      <ShellFeature
        links={[
          { label: 'Escrow', to: '/escrow' },
          { label: 'Wallet', to: '/wallet' },
        ]}
      />
    ),
    hydrateFallbackElement: <ShellUiLoader fullScreen />,
  },
])

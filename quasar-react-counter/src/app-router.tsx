import { createBrowserRouter, Navigate } from 'react-router'

import type { ShellNotFoundProps } from '@/shell/data-access/shell-not-found-props'

import { ShellFeature, ShellUiLoader } from '@/shell/feature'

export const appRouter = createBrowserRouter([
  {
    children: [
      { element: <Navigate replace to="/counter" />, index: true },
      {
        lazy: () => import('@/counter/feature/counter-feature'),
        path: 'counter',
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
              description: 'Jump back to the counter playground to initialize the PDA and try CRUD actions.',
              title: 'Counter',
              to: '/counter',
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
          { label: 'Counter', to: '/counter' },
          { label: 'Wallet', to: '/wallet' },
        ]}
      />
    ),
    hydrateFallbackElement: <ShellUiLoader fullScreen />,
  },
])

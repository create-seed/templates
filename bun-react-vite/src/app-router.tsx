import { createBrowserRouter, Navigate } from 'react-router'

import type { ShellNotFoundProps } from '@/shell/data-access/shell-not-found-props'

import { ShellFeature, ShellUiLoader } from '@/shell/feature'

export const appRouter = createBrowserRouter(
  [
    {
      children: [
        { element: <Navigate replace to="/demo" />, index: true },
        {
          lazy: () => import('@/about/feature/about-feature'),
          path: 'about',
        },
        {
          lazy: () => import('@/demo/feature/demo-feature'),
          path: 'demo',
        },
        {
          lazy: () => import('@/shell/feature/shell-not-found-feature'),
          loader: (): ShellNotFoundProps => ({
            description:
              'The route you opened does not exist, or it may have moved while the starter was being cleaned up.',
            links: [
              {
                description: 'Browse the reference UI primitives, typography, and demo controls.',
                title: 'Demo',
                to: '/demo',
              },
              {
                description: 'Read what this starter includes and how to extend it for your own app.',
                title: 'About',
                to: '/about',
              },
            ],
            title: 'Page not found',
          }),
          path: '*',
        },
      ],
      element: (
        <ShellFeature
          links={[
            { label: 'Demo', to: '/demo' },
            { label: 'About', to: '/about' },
          ]}
        />
      ),
      hydrateFallbackElement: <ShellUiLoader fullScreen />,
    },
  ],
  {
    // Set the base URL for router links and redirects, removing trailing slashes if present, independent of the base
    basename: import.meta.env.BASE_URL === '/' ? '/' : import.meta.env.BASE_URL.replace(/\/$/, ''),
  },
)

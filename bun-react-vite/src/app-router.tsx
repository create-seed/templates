import { createBrowserRouter, Navigate } from 'react-router'

import { ShellFeature, ShellUiLoader } from '@/shell/feature'

export const appRouter = createBrowserRouter([
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
])

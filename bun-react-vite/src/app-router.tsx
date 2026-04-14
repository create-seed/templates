import { lazy } from 'react'
import { createBrowserRouter, Navigate } from 'react-router'

const ShellFeature = lazy(() => import('@/features/shell/shell-feature.tsx'))
const ShellUiLoader = lazy(() => import('@/features/shell/ui/shell-ui-loader.tsx'))

export const appRouter = createBrowserRouter([
  {
    children: [
      { element: <Navigate replace to="/demo" />, index: true },
      {
        lazy: () => import('@/features/about/about-feature.tsx'),
        path: 'about',
      },
      {
        lazy: () => import('@/features/demo/demo-feature.tsx'),
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

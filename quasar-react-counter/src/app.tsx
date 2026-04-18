import { RouterProvider } from 'react-router/dom'

import { appRouter } from '@/app-router'
import { AppProviders } from '@/core/data-access/app-providers'

export default function App() {
  return (
    <AppProviders>
      <RouterProvider router={appRouter} />
    </AppProviders>
  )
}

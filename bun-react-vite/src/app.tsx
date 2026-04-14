import { RouterProvider } from 'react-router/dom'

import { appRouter } from '@/app-router.tsx'

export function App() {
  return <RouterProvider router={appRouter} />
}

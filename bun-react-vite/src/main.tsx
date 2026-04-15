import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'

import './index.css'
import { ShellUiLoader } from '@/shell/feature'

const App = lazy(() => import('./app'))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={<ShellUiLoader fullScreen />}>
      <App />
    </Suspense>
  </StrictMode>,
)

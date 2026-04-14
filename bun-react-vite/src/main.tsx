import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './index.css'
import { AppProviders } from '@/lib/app-providers.tsx'

import { App } from './app.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
)

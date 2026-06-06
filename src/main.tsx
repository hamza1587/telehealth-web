import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from '@app/App.tsx'
import { AppProviders } from '@app/providers/AppProviders.tsx'

// 4.13 — axe-core runs in development only; logs violations to the browser console
if (import.meta.env.DEV) {
  const axe = await import('@axe-core/react')
  const React = await import('react')
  const ReactDOM = await import('react-dom')
  axe.default(React.default, ReactDOM.default, 1000)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
)

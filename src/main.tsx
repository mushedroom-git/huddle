import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from '@/App'
import { assertDemo, createInitialState } from '@/data/seed'
import { StoreProvider } from '@/state/store'
import { ThemeProvider } from '@/state/theme'
import '@/styles/index.css'

if (import.meta.env.DEV) assertDemo(createInitialState())

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <StoreProvider>
        <App />
      </StoreProvider>
    </ThemeProvider>
  </StrictMode>,
)

import { IconContext } from '@phosphor-icons/react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { startSync } from './lib/sync'

startSync()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Íconos por defecto: del tamaño del texto que acompañan y con trazo marcado. */}
    <IconContext.Provider value={{ size: '1.2em', weight: 'bold' }}>
      <App />
    </IconContext.Provider>
  </StrictMode>,
)

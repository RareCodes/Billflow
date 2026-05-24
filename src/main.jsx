import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { Toaster } from 'sonner'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontFamily: 'Nunito Sans, sans-serif',
            fontSize: 14,
            borderRadius: 12,
          },
        }}
        richColors
      />
      <App />
    </BrowserRouter>
  </StrictMode>
)
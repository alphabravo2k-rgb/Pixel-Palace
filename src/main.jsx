import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast' // 🔔 UI: Import the Notification Engine

// ✅ CORE APP IMPORT
import App from './app/App'

// ✅ STYLES
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 🔔 GLOBAL NOTIFICATIONS 
      Configured to match your "Cyberpunk" Dark Theme 
    */}
    <Toaster 
      position="bottom-right"
      toastOptions={{
        // Default Dark Mode Styles
        style: {
          background: '#18181b', // bg-elevated (Zinc-800)
          color: '#fff',
          border: '1px solid #27272a', // border-tactical
          padding: '16px',
          borderRadius: '8px',
        },
        // Success State (Emerald)
        success: {
          iconTheme: {
            primary: '#10b981',
            secondary: '#fff',
          },
        },
        // Error State (Red)
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
          },
        },
      }} 
    />
    
    {/* 🚀 MAIN APPLICATION */}
    <App />
  </React.StrictMode>,
)

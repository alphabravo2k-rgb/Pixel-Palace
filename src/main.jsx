import React from 'react'
import ReactDOM from 'react-dom/client'

// ✅ FIX: Path is now direct (sibling folder)
import App from './app/App'

// ✅ FIX: CSS is now a sibling file
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

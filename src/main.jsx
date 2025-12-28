import React from 'react'
import ReactDOM from 'react-dom/client'
// ✅ FIX: Path is now ./app/App because we are in /src/
import App from './app/App'
// ✅ FIX: Path is now ./index.css
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

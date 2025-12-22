import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App.jsx'; // ✅ CHANGED: Added './app/'
import './index.css';

// 🚀 FORCE NEW BUILD HASH
console.log("🔥🔥 APPLICATION STARTING - BUILD V6 (FIXED IMPORT) 🔥🔥");

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App.jsx';
import './index.css';  // 👈 CHANGED: Removed 'ui/' to look in the current folder

// 🚀 FORCE NEW BUILD HASH
console.log("🔥🔥 APPLICATION STARTING - BUILD V8 (CSS FIX) 🔥🔥");

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

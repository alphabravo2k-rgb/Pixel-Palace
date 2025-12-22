import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './ui/index.css';

// 🚀 FORCE NEW BUILD HASH (Cache Buster)
console.log("🔥🔥 APPLICATION STARTING - BUILD V5 (DEBUG MODE) 🔥🔥");

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

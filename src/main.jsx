import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App.jsx';
import './index.css';
// 👇 IMPORT THE PROVIDER
import { SessionProvider } from './auth/useSession'; 

// 🚀 LOG FOR SANITY CHECK
console.log("🔥🔥 APPLICATION STARTING - BUILD V9 (PROVIDER FIX) 🔥🔥");

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 👇 WRAP THE ENTIRE APP HERE */}
    <SessionProvider>
      <App />
    </SessionProvider>
  </React.StrictMode>,
);

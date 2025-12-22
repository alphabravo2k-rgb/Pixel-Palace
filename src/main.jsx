import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './app/router'; // 👈 We must use the Router configuration
import './index.css';

// 🚀 RESTORING ROUTER CONTEXT
console.log("🔥🔥 APPLICATION STARTING - BUILD V10 (ROUTER RESTORED) 🔥🔥");

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* App.jsx is already inside 'router', so we just render the provider here */}
    <RouterProvider router={router} />
  </React.StrictMode>,
);

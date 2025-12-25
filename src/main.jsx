import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './app/router'; // 👈 Check this path!
import './index.css';

console.log("🔥🔥 APPLICATION STARTING - BUILD V10 (ROUTER RESTORED) 🔥🔥");

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);

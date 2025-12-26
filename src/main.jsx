import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App'; // 🟢 Points to our new "Brain"
import './index.css';

console.log("🔥🔥 APPLICATION STARTING - PIXEL PALACE V2.5 (RBAC ENABLED) 🔥🔥");

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

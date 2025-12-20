import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './app/router'; // <--- CHANGED from '../' to './'
import './ui/index.css'; // Adjust this if your CSS is in 'src/ui/' or just './index.css' if in 'src/'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);

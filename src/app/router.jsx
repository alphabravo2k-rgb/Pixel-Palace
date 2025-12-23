import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import BracketView from '../components/BracketView'; 
import VetoPanel from '../components/VetoPanel';
import AdminDashboard from '../components/AdminDashboard';

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, // App handles the Layout and Providers
    children: [
      // 1. Home (Default View)
      {
        index: true, 
        element: <BracketView initialTab="bracket" />
      },
      // 2. Explicit /bracket route
      {
        path: "bracket",
        element: <BracketView initialTab="bracket" />
      },
      // 3. Explicit /roster route
      {
        path: "roster",
        element: <BracketView initialTab="teams" />
      },
      // 4. Admin Dashboard
      {
        path: "admin",
        element: <AdminDashboard />
      },
      // 5. Veto Interface
      {
        path: "veto",
        element: <VetoPanel />
      }
    ]
  }
]);

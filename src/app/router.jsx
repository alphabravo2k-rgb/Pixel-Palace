import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import BracketView from '../components/BracketView'; 
import VetoPanel from '../components/VetoPanel';
import AdminDashboard from '../components/AdminDashboard';
import PinLogin from '../components/PinLogin';

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      // 1. Home (Bracket + Login)
      {
        index: true, 
        element: (
          <>
            <BracketView initialTab="bracket" />
            <PinLogin />
          </>
        ) 
      },
      // 2. Explicit /bracket route (Fixes 404)
      {
        path: "bracket",
        element: (
          <>
            <BracketView initialTab="bracket" />
            <PinLogin />
          </>
        )
      },
      // 3. Explicit /roster route (Fixes 404)
      {
        path: "roster",
        element: (
          <>
            <BracketView initialTab="teams" />
            <PinLogin />
          </>
        )
      },
      // 4. Admin & Veto
      {
        path: "admin",
        element: <AdminDashboard />
      },
      {
        path: "veto",
        element: <VetoPanel />
      }
    ]
  }
]);

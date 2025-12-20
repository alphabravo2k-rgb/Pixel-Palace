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
      {
        index: true, 
        element: (
          <>
            <BracketView />
            <PinLogin />
          </>
        ) 
      },
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

import { createBrowserRouter } from 'react-router-dom';
import App from './App';

// IMPORTS
// We use Default Imports for the main views we fixed earlier
import BracketView from '../components/BracketView'; 
import AdminDashboard from '../components/AdminDashboard'; 
import PinLogin from '../components/PinLogin'; 

// We use Named Imports { } for components typically exported as constants
import { TeamRoster } from '../components/TeamRoster'; 
import { VetoPanel } from '../components/VetoPanel'; 

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      // 1. HOME & BRACKET (Both show the bracket)
      { 
        index: true, 
        element: <BracketView /> 
      },
      { 
        path: "bracket", 
        element: <BracketView /> 
      },

      // 2. ROSTER (Shows the teams)
      { 
        path: "roster", 
        element: <TeamRoster /> 
      },

      // 3. ADMIN LOGIN
      { 
        path: "admin", 
        element: <PinLogin /> 
      },

      // 4. ADMIN DASHBOARD (Protected by Auth Logic in component)
      { 
        path: "dashboard", 
        element: <AdminDashboard /> 
      },

      // 5. VETO INTERFACE
      { 
        path: "veto/:matchId", 
        element: <VetoPanel /> 
      }
    ]
  }
]);

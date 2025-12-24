import { createBrowserRouter } from 'react-router-dom';
import App from './App';

// IMPORTS
// Note: We use the default/named exports based on your previous files
import BracketView from '../components/BracketView'; 
import { TeamRoster } from '../components/TeamRoster'; // We will create this below to be safe
import AdminDashboard from '../components/AdminDashboard'; 
import PinLogin from '../components/PinLogin'; // We will fix this below
import { VetoPanel } from '../components/VetoPanel'; 

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      // 1. HOME & BRACKET (Both show the bracket)
      { index: true, element: <BracketView /> },
      { path: "bracket", element: <BracketView /> },

      // 2. ROSTER (Shows the teams)
      { path: "roster", element: <TeamRoster /> },

      // 3. ADMIN & DASHBOARD
      { path: "admin", element: <PinLogin /> },
      { path: "dashboard", element: <AdminDashboard /> },

      // 4. VETO
      { path: "veto/:matchId", element: <VetoPanel /> }
    ]
  }
]);

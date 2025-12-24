import { createBrowserRouter } from 'react-router-dom';
import App from './App';

// ✅ FIX: Use Default Import (No curly braces)
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
        element: <BracketView />
      },
      {
        path: "admin",
        element: <PinLogin />
      },
      {
        path: "dashboard",
        element: <AdminDashboard />
      },
      {
        path: "veto/:matchId",
        element: <VetoPanel />
      }
    ]
  }
]);

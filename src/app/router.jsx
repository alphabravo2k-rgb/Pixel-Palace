import { createBrowserRouter } from 'react-router-dom';
import App from './App'; // This will become our Layout Wrapper
import BracketView from '../components/BracketView'; // The file you just renamed
import VetoPanel from '../components/VetoPanel';
import AdminDashboard from '../components/AdminDashboard';
import PinLogin from '../components/PinLogin';

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, // Wraps everything in Session/Tournament Providers
    children: [
      {
        index: true, 
        element: (
          <>
            <BracketView />
            <PinLogin /> {/* Overlay Login on the main bracket */}
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

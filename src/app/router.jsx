import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from './App';
import { useSession } from '../auth/useSession';

// COMPONENT IMPORTS
import BracketView from '../components/BracketView'; 
import AdminDashboard from '../components/AdminDashboard'; 
import PinLogin from '../components/PinLogin'; 
import { TeamRoster } from '../components/TeamRoster'; 
import { VetoPanel } from '../components/VetoPanel';

// ROLE DEFINITIONS
const ROLES = {
  ADMIN: 'ADMIN',
  OWNER: 'OWNER',
  CAPTAIN: 'CAPTAIN'
};

/**
 * 🔧 Required Fix: Protected Routes
 * Implementation of role-gated route wrappers.
 */
const RequireRole = ({ allowed, children }) => {
  const { session, loading } = useSession();

  // Discipline: Prevent flashes while checking authority
  if (loading) return null; 

  // Enforcement: Redirect if role is not allowed
  if (!session || !allowed.includes(session.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <BracketView /> },
      { path: "bracket", element: <BracketView /> },
      { path: "roster", element: <TeamRoster /> },
      { path: "admin", element: <PinLogin /> },
      
      // ✅ IMPLEMENTED: Dashboard with role-gated wrapper
      { 
        path: "dashboard", 
        element: (
          <RequireRole allowed={[ROLES.ADMIN, ROLES.OWNER]}>
            <AdminDashboard />
          </RequireRole>
        ) 
      },

      // ✅ IMPLEMENTED: Veto with role-gated wrapper
      { 
        path: "veto/:matchId", 
        element: (
          <RequireRole allowed={[ROLES.ADMIN, ROLES.OWNER, ROLES.CAPTAIN]}>
            <VetoPanel />
          </RequireRole>
        ) 
      }
    ]
  }
]);

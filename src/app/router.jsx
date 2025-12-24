import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import App from './App';
import { useSession } from '../auth/useSession';

// COMPONENT IMPORTS
import BracketView from '../components/BracketView'; 
import AdminDashboard from '../components/AdminDashboard'; 
import PinLogin from '../components/PinLogin'; 
import { TeamRoster } from '../components/TeamRoster'; 
import { VetoPanel } from '../components/VetoPanel';
import AdminToolbar from '../components/AdminToolbar';

// ROLE DEFINITIONS
const ROLES = {
  ADMIN: 'ADMIN',
  OWNER: 'OWNER',
  CAPTAIN: 'CAPTAIN'
};

/**
 * RequireRole Wrapper
 * Enforces route-level authority.
 */
const RequireRole = ({ allowed, children }) => {
  const { session, loading } = useSession();
  if (loading) return null; 
  if (!session || !allowed.includes(session.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

/**
 * AdminLayout
 * Mounts AdminToolbar ONLY within authorized nested routes.
 */
const AdminLayout = () => {
  return (
    <div className="admin-surface">
      <AdminToolbar />
      <Outlet />
    </div>
  );
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <BracketView /> },
      { path: "bracket", element: <BracketView /> },
      { path: "roster", element: <TeamRoster /> },

      // ✅ IMPLEMENTED: Hardened Nested Admin Structure
      {
        path: "admin",
        children: [
          { path: "login", element: <PinLogin /> },
          { index: true, element: <Navigate to="login" replace /> },
          {
            element: (
              <RequireRole allowed={[ROLES.ADMIN, ROLES.OWNER]}>
                <AdminLayout />
              </RequireRole>
            ),
            children: [
              { path: "dashboard", element: <AdminDashboard /> }
            ]
          }
        ]
      },

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

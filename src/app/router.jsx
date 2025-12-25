import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import App from './App';
import { useSession } from '../auth/useSession';
import { ROLES } from '../lib/roles';

// COMPONENT IMPORTS
import BracketView from '../components/BracketView'; 
import { AdminDashboard } from '../components/AdminDashboard'; 
import { PinLogin } from '../components/PinLogin'; 
import { TeamRoster } from '../components/TeamRoster'; 
import { AdminToolbar } from '../components/AdminToolbar';

// 🛡️ AUTH GUARD
const RequireRole = ({ allowed, children }) => {
  const { session, loading } = useSession();

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-black text-zinc-500">Authenticating...</div>;

  // 1. Check Authentication
  if (!session.isAuthenticated) {
    // If trying to access Admin/Owner areas, send to Login
    if (allowed.includes(ROLES.ADMIN) || allowed.includes(ROLES.OWNER)) {
      return <Navigate to="/admin/login" replace />;
    }
    return <Navigate to="/" replace />;
  }

  // 2. Check Role Permission
  if (!allowed.includes(session.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// 🛡️ ADMIN LAYOUT
const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-black">
      <AdminToolbar /> 
      <div className="pt-20"> 
        <Outlet />
      </div>
    </div>
  );
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <BracketView /> },
      { path: "roster", element: <TeamRoster /> },
      {
        path: "admin",
        element: <Outlet />,
        children: [
          { path: "login", element: <PinLogin /> },
          {
            path: "dashboard",
            element: (
              <RequireRole allowed={[ROLES.ADMIN, ROLES.OWNER]}>
                <AdminLayout />
              </RequireRole>
            ),
            children: [
              { index: true, element: <AdminDashboard /> }
            ]
          }
        ]
      },
      { path: "*", element: <Navigate to="/" replace /> }
    ]
  }
]);

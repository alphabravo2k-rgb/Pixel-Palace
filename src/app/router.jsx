import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import App from './App';
import { useSession } from '../auth/useSession';
import { ROLES } from '../lib/roles';

// COMPONENT IMPORTS
// ✅ FIX: All Admin/Auth components are now Named Imports { }
import BracketView from '../components/BracketView'; 
import { AdminDashboard } from '../components/AdminDashboard'; 
import { PinLogin } from '../components/PinLogin'; 
import { TeamRoster } from '../components/TeamRoster'; 
import { AdminToolbar } from '../components/AdminToolbar';

// 🛡️ AUTH GUARD WRAPPER
// Route-level access control
const RequireRole = ({ allowed, children }) => {
  const { session, loading } = useSession();

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-black text-zinc-500">Authenticating...</div>;

  if (!allowed.includes(session.role)) {
    // Redirect logic: Admins to login, others to home
    if (allowed.includes(ROLES.ADMIN)) return <Navigate to="/admin/login" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

// 🛡️ ADMIN LAYOUT WRAPPER
// Ensures the AdminToolbar only appears in admin routes
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
      // --- PUBLIC ROUTES ---
      {
        index: true,
        element: <BracketView />
      },
      {
        path: "roster",
        element: <TeamRoster />
      },

      // --- ADMIN ROUTES (NESTED & GUARDED) ---
      {
        path: "admin",
        element: <Outlet />, // Grouping for admin paths
        children: [
          // Public Entry: Login
          {
            path: "login",
            element: <PinLogin />
          },
          // Protected Area: Dashboard
          {
            path: "dashboard",
            element: (
              <RequireRole allowed={[ROLES.ADMIN, ROLES.OWNER]}>
                <AdminLayout />
              </RequireRole>
            ),
            children: [
              {
                index: true,
                element: <AdminDashboard /> 
              }
            ]
          }
        ]
      },

      // Fallback
      {
        path: "*",
        element: <Navigate to="/" replace />
      }
    ]
  }
]);

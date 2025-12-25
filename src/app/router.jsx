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

// 🛡️ AUTH GUARD WRAPPER (FIXED)
const RequireRole = ({ allowed, children }) => {
  const { session, loading } = useSession();

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-black text-zinc-500">Authenticating...</div>;

  // 🛑 1. AUTHENTICATION CHECK (Issue #1 Fix)
  // We must verify they are actually logged in before checking permissions.
  // Assuming 'session' object exists and has a role other than GUEST implies authentication.
  // Ideally, useSession should return an explicit 'isAuthenticated' boolean.
  const isAuthenticated = session && session.role !== ROLES.GUEST;

  if (!isAuthenticated) {
    // 🛑 2. REDIRECT LOGIC (Issue #2 Fix)
    // If unauthenticated and trying to access Admin/Owner areas, send to Login.
    if (allowed.includes(ROLES.ADMIN) || allowed.includes(ROLES.OWNER)) {
      return <Navigate to="/admin/login" replace />;
    }
    // Otherwise, send to public home
    return <Navigate to="/" replace />;
  }

  // 🛑 3. PERMISSION CHECK
  // They are logged in, but are they allowed here?
  if (!allowed.includes(session.role)) {
    // Authenticated but unauthorized (e.g., Captain trying to view Admin Dashboard)
    // Redirect to Home (or a 403 Forbidden page)
    return <Navigate to="/" replace />;
  }

  return children;
};

// 🛡️ ADMIN LAYOUT WRAPPER
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

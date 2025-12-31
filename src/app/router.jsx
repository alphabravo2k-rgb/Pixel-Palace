import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { useSession } from '../auth/useSession';
import { ROLES } from '../lib/roles';
import { Loader2 } from 'lucide-react';

// Components (Ensure these files exist in these folders!)
import { LandingPage } from '../components/LandingPage';
import { AdminLogin } from '../components/admin/AdminLogin';
import { BracketView } from '../components/BracketView';
import { MatchRoom } from '../components/match/MatchRoom';
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { PlayerDashboard } from '../components/player/PlayerDashboard';
import { AdminToolbar } from '../components/admin/AdminToolbar';

// Authentication guard
const RequireAuth = ({ children }) => {
  const { session } = useSession();

  if (session.loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#050505]">
        <Loader2 className="animate-spin text-fuchsia-600 w-8 h-8"/>
      </div>
    );
  }

  if (!session.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children || <Outlet />;
};

// Role-based access control
const RequireRole = ({ allowedRoles = [], children }) => {
  const { session } = useSession();

  if (allowedRoles.length > 0 && !allowedRoles.includes(session.role)) {
    console.warn(`⛔ ACCESS DENIED: Role ${session.role} attempted to access protected route.`);
    return <Navigate to="/" replace />;
  }

  return children || <Outlet />;
};

// Layout for Admin
const AdminLayout = () => (
  <div className="min-h-screen bg-[#050505]">
    <AdminToolbar />
    <div className="pt-16">
      <Outlet />
    </div>
  </div>
);

// Routing structure
export const router = createBrowserRouter([
  {
    path: '/',
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'login', element: <AdminLogin /> },
      { path: 'bracket', element: <BracketView /> },
      { path: 'match/:matchId', element: <MatchRoom /> },

      // PROTECTED ADMIN ROUTES
      {
        path: 'admin',
        element: (
          <RequireAuth>
            <RequireRole allowedRoles={[ROLES.ADMIN, ROLES.OWNER, ROLES.REFEREE]}>
              <AdminLayout />
            </RequireRole>
          </RequireAuth>
        ),
        children: [
          { path: 'dashboard', element: <AdminDashboard /> },
        ]
      },

      // PROTECTED PLAYER ROUTES
      {
        path: 'dashboard',
        element: (
          <RequireAuth>
            <RequireRole allowedRoles={[ROLES.CAPTAIN, ROLES.PLAYER, ROLES.OWNER]}>
              <PlayerDashboard />
            </RequireRole>
          </RequireAuth>
        )
      },

      // Fallback
      { path: '*', element: <Navigate to="/" replace /> }
    ]
  }
]);

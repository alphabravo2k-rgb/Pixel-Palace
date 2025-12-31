import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { useSession } from '../auth/useSession';
import { ROLES } from '../lib/roles';
import { Loader2 } from 'lucide-react';

// COMPONENTS
import { LandingPage } from '../components/LandingPage'; 
import { AdminLogin } from '../components/admin/AdminLogin';
import { BracketView } from '../components/BracketView';
import { MatchRoom } from '../components/match/MatchRoom'; 
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { PlayerDashboard } from '../components/player/PlayerDashboard'; 
import { AdminToolbar } from '../components/admin/AdminToolbar';

// 🚧 UX GUARD 1: Authentication (Is user logged in?)
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

// 🚧 UX GUARD 2: Authorization (Does user have the right role?)
const RequireRole = ({ allowedRoles = [], children }) => {
  const { session } = useSession();

  if (allowedRoles.length > 0 && !allowedRoles.includes(session.role)) {
    console.warn(`⛔ ACCESS DENIED: Role ${session.role} attempted to access protected route.`);
    return <Navigate to="/" replace />;
  }

  return children || <Outlet />;
};

// 🏗️ LAYOUTS
const AdminLayout = () => (
  <div className="min-h-screen bg-[#050505]">
    <AdminToolbar />
    <div className="pt-16">
      <Outlet />
    </div>
  </div>
);

// 🛣️ ROUTE DEFINITIONS
export const router = createBrowserRouter([
  {
    path: '/',
    children: [
      // PUBLIC ROUTES
      { index: true, element: <LandingPage /> },
      { path: 'login', element: <AdminLogin /> },
      { path: 'bracket', element: <BracketView /> },
      
      // HYBRID ROUTE (Read Public / Write Protected by Component Logic)
      { path: 'match/:matchId', element: <MatchRoom /> },

      // 🛡️ ADMIN AREA
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
      
      // 🛡️ PLAYER AREA
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
      
      // 404 CATCH-ALL
      { path: '*', element: <Navigate to="/" replace /> }
    ]
  }
]);

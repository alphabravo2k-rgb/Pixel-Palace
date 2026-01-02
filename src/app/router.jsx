import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { useSession } from '../auth/useSession';
import { ROLES } from '../lib/roles';
import { Loader2 } from 'lucide-react';

// --- AUTH COMPONENTS ---
// 🛡️ Verify these paths exist exactly as written
import { AdminLogin } from '../components/admin/AdminLogin'; 
import { StaffRegistration } from '../components/auth/StaffRegistration';

// --- PUBLIC COMPONENTS ---
import { LandingPage } from '../components/LandingPage';
import { BracketView } from '../components/BracketView';
import { MatchRoom } from '../components/match/MatchRoom';

// --- ADMIN COMPONENTS ---
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { TeamRosterView } from '../components/admin/TeamRosterView';
import { StaffManagement } from '../components/admin/StaffManagement';
import { AdminToolbar } from '../components/admin/AdminToolbar';

// --- PLAYER COMPONENTS ---
import { PlayerDashboard } from '../components/player/PlayerDashboard';

const RequireAuth = ({ children }) => {
  const { session } = useSession();
  if (session.loading) return <div className="h-screen w-full flex items-center justify-center bg-[#050505]"><Loader2 className="animate-spin text-fuchsia-600 w-8 h-8"/></div>;
  if (!session.isAuthenticated) return <Navigate to="/login" replace />;
  return children || <Outlet />;
};

const RequireRole = ({ allowedRoles = [], children }) => {
  const { session } = useSession();
  if (allowedRoles.length > 0 && !allowedRoles.includes(session.role)) return <Navigate to="/" replace />;
  return children || <Outlet />;
};

const AdminLayout = () => (
  <div className="min-h-screen bg-[#050505]">
    <AdminToolbar />
    <div className="pt-16 p-6">
      <Outlet />
    </div>
  </div>
);

export const router = createBrowserRouter([
  {
    path: '/',
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'login', element: <AdminLogin /> },
      { path: 'staff-register', element: <StaffRegistration /> },
      { path: 'bracket', element: <BracketView /> },
      { path: 'match/:matchId', element: <MatchRoom /> },
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
          { path: 'roster', element: <TeamRosterView /> },
          { path: 'staff', element: <StaffManagement /> },
        ]
      },
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
      { path: '*', element: <Navigate to="/" replace /> }
    ]
  }
]);

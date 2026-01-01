import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { useSession } from './auth/useSession';
import { ROLES } from './lib/roles';
import { Loader2 } from 'lucide-react';

// --- AUTH COMPONENTS ---
import { AdminLogin } from './components/auth/AdminLogin';
import { StaffRegistration } from './components/auth/StaffRegistration'; // 🆕 Secret Route

// --- PUBLIC COMPONENTS ---
import { LandingPage } from './components/LandingPage';
import { BracketView } from './components/BracketView';
import { MatchRoom } from './components/match/MatchRoom';

// --- ADMIN COMPONENTS ---
import { AdminDashboard } from './components/admin/AdminDashboard';
import { TeamRosterView } from './components/admin/TeamRosterView'; // 🆕 Roster Command
import { StaffManagement } from './components/admin/StaffManagement'; // 🆕 Staff Hierarchy
import { AdminToolbar } from './components/admin/AdminToolbar';

// --- PLAYER COMPONENTS ---
import { PlayerDashboard } from './components/player/PlayerDashboard';

// 1. Authentication Guard (Protects Routes)
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

// 2. Role Guard (Restricts Access based on Rank)
const RequireRole = ({ allowedRoles = [], children }) => {
  const { session } = useSession();

  if (allowedRoles.length > 0 && !allowedRoles.includes(session.role)) {
    console.warn(`⛔ ACCESS DENIED: Role ${session.role} attempted to access protected route.`);
    return <Navigate to="/" replace />;
  }

  return children || <Outlet />;
};

// 3. Admin Layout (Adds the Toolbar to all Admin Pages)
const AdminLayout = () => (
  <div className="min-h-screen bg-[#050505]">
    <AdminToolbar />
    <div className="pt-16 p-6">
      <Outlet />
    </div>
  </div>
);

// 4. THE ROUTER MAP
export const router = createBrowserRouter([
  {
    path: '/',
    children: [
      // --- PUBLIC ROUTES ---
      { index: true, element: <LandingPage /> },
      { path: 'login', element: <AdminLogin /> },
      { path: 'staff-register', element: <StaffRegistration /> }, // 🆕 The Secret Link works here
      { path: 'bracket', element: <BracketView /> },
      { path: 'match/:matchId', element: <MatchRoom /> },

      // --- PROTECTED ADMIN AREA ---
      {
        path: 'admin',
        element: (
          <RequireAuth>
            {/* Only Owners, Admins, and Referees can enter */}
            <RequireRole allowedRoles={[ROLES.ADMIN, ROLES.OWNER, ROLES.REFEREE]}>
              <AdminLayout />
            </RequireRole>
          </RequireAuth>
        ),
        children: [
          // The Dashboard Landing
          { path: 'dashboard', element: <AdminDashboard /> },
          
          // 🆕 Roster Command Center
          { path: 'roster', element: <TeamRosterView /> },
          
          // 🆕 Staff Hierarchy Management
          { path: 'staff', element: <StaffManagement /> },
        ]
      },

      // --- PROTECTED PLAYER AREA ---
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

      // Fallback (404)
      { path: '*', element: <Navigate to="/" replace /> }
    ]
  }
]);

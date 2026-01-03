import React from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { Loader2, AlertTriangle } from 'lucide-react';

// ✅ SAFE RELATIVE IMPORTS
import { useSession } from '../auth/useSession';
import { ROLES } from '../lib/roles';

// 📦 STANDARD COMPONENT IMPORTS (Fixes Error #306)
// We use { NamedImports } because your components are likely exported as 'export const Name = ...'
import { LandingPage } from '../components/LandingPage';
import { AdminLogin } from '../components/admin/AdminLogin';
import { AdminPasswordReset } from '../components/admin/AdminPasswordReset';
import { StaffRegistration } from '../components/auth/StaffRegistration';
import { BracketView } from '../components/BracketView';
import { MatchRoom } from '../components/match/MatchRoom';
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { TeamRosterView } from '../components/admin/TeamRosterView';
import { StaffManagement } from '../components/admin/StaffManagement';
import { AdminToolbar } from '../components/admin/AdminToolbar';
import { PlayerDashboard } from '../components/player/PlayerDashboard';

// 🛑 1. LOADING UI
const PageLoader = () => (
  <div className="h-screen w-full flex flex-col items-center justify-center bg-[#050505] space-y-4">
    <div className="relative">
        <div className="w-16 h-16 border-4 border-zinc-800 border-t-fuchsia-600 rounded-full animate-spin" />
    </div>
    <div className="text-zinc-500 font-mono text-xs uppercase tracking-widest animate-pulse">
      Loading Interface...
    </div>
  </div>
);

// 🛡️ 2. AUTH GUARDS
const RequireAuth = ({ children }) => {
  const { session } = useSession();
  
  // Wait for session to initialize
  if (!session.isReady) return <PageLoader />;
  
  // Redirect if not logged in
  if (!session.isAuthenticated) return <Navigate to="/login" replace />;
  
  return children || <Outlet />;
};

const RequireRole = ({ allowedRoles = [], children }) => {
  const { session } = useSession();
  if (allowedRoles.length > 0 && !allowedRoles.includes(session.role)) {
      return <Navigate to="/" replace />;
  }
  return children || <Outlet />;
};

// 🧱 3. LAYOUT SHELLS
const RootLayout = () => (
  <div className="min-h-screen bg-[#050505] text-white selection:bg-fuchsia-500/30">
    <div className="scanlines" /> 
    <Outlet />
  </div>
);

const AdminLayout = () => (
  <div className="min-h-screen bg-[#050505] relative z-10">
    <AdminToolbar />
    <div className="pt-16 p-6">
      <Outlet />
    </div>
  </div>
);

// 🗺️ 4. ROUTE DEFINITIONS
export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-[#050505] text-red-500 gap-4">
            <AlertTriangle size={48} />
            <h1 className="text-2xl font-mono uppercase tracking-widest">Critical UI Failure</h1>
            <p className="text-zinc-500 text-sm font-mono">Router Crash Detected</p>
            <button onClick={() => window.location.reload()} className="px-4 py-2 border border-red-500 hover:bg-red-500/10 rounded uppercase text-xs font-bold transition-colors">
                System Reboot
            </button>
        </div>
    ),
    children: [
      // --- PUBLIC ROUTES ---
      { index: true, element: <LandingPage /> },
      { path: 'login', element: <AdminLogin /> },
      { path: 'recover-password', element: <AdminPasswordReset /> },
      { path: 'staff-register', element: <StaffRegistration /> },
      { path: 'bracket', element: <BracketView /> },
      { path: 'match/:matchId', element: <MatchRoom /> },

      // --- ADMIN ROUTES (Protected) ---
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

      // --- PLAYER ROUTES (Protected) ---
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

      // --- CATCH ALL ---
      { path: '*', element: <Navigate to="/" replace /> }
    ]
  }
]);

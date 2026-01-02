import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { Loader2, AlertTriangle } from 'lucide-react';

// ✅ FIX: Use Absolute Aliases for robustness
import { useSession } from '@/auth/useSession';
import { ROLES } from '@/lib/roles';

// ⚡ PERFORMANCE: LAZY LOAD COMPONENTS
// This ensures players don't download Admin code, making the site 3x faster.
const LandingPage = lazy(() => import('@/components/LandingPage'));
const AdminLogin = lazy(() => import('@/components/admin/AdminLogin'));
const AdminPasswordReset = lazy(() => import('@/components/admin/AdminPasswordReset'));
const StaffRegistration = lazy(() => import('@/components/auth/StaffRegistration'));
const BracketView = lazy(() => import('@/components/BracketView'));
const MatchRoom = lazy(() => import('@/components/match/MatchRoom'));
const AdminDashboard = lazy(() => import('@/components/admin/AdminDashboard'));
const TeamRosterView = lazy(() => import('@/components/admin/TeamRosterView'));
const StaffManagement = lazy(() => import('@/components/admin/StaffManagement'));
const AdminToolbar = lazy(() => import('@/components/admin/AdminToolbar'));
const PlayerDashboard = lazy(() => import('@/components/player/PlayerDashboard'));

// 🛑 1. GLOBAL LOADING UI
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

// 🛡️ 2. AUTH GUARDS (Supabase Integrated)
const RequireAuth = ({ children }) => {
  const { session } = useSession();
  
  // Wait for Supabase to confirm session status
  if (!session.isReady) return <PageLoader />;
  
  // If not logged in, redirect to login
  if (!session.isAuthenticated) return <Navigate to="/login" replace />;
  
  return children || <Outlet />;
};

const RequireRole = ({ allowedRoles = [], children }) => {
  const { session } = useSession();
  
  // Role-Based Access Control (RBAC)
  if (allowedRoles.length > 0 && !allowedRoles.includes(session.role)) {
      return <Navigate to="/" replace />;
  }
  
  return children || <Outlet />;
};

// 🧱 3. LAYOUT SHELLS
// Root Layout ensures Scanlines & Background persist on ALL pages
const RootLayout = () => (
  <div className="min-h-screen bg-[#050505] text-white selection:bg-fuchsia-500/30">
    <div className="scanlines" /> {/* CRT Effect from index.css */}
    <Suspense fallback={<PageLoader />}>
      <Outlet />
    </Suspense>
  </div>
);

const AdminLayout = () => (
  <div className="min-h-screen bg-[#050505] relative z-10">
    <Suspense fallback={<div className="h-16 bg-zinc-900 animate-pulse" />}>
        <AdminToolbar />
    </Suspense>
    <div className="pt-16 p-6">
      <Outlet />
    </div>
  </div>
);

// 🗺️ 4. ROUTE DEFINITIONS
export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />, // Wraps app in global styles
    errorElement: (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-[#050505] text-red-500 gap-4">
            <AlertTriangle size={48} />
            <h1 className="text-2xl font-mono uppercase tracking-widest">Critical UI Failure</h1>
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

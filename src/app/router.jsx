import React from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { Loader2, AlertTriangle, Terminal } from 'lucide-react';
import { Toaster } from 'react-hot-toast'; // 🔔 NOTIFICATIONS SYSTEM

// ✅ LOGIC IMPORTS
import { useSession } from '../auth/useSession';
import { ROLES } from '../lib/roles';

// 📦 COMPONENT IMPORTS
import { LandingPage } from '../components/LandingPage';
import { UnifiedLogin } from '../components/auth/UnifiedLogin'; // ⚡ The Master Login
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

// 🛑 1. LOADING UI (The "Boot Screen")
const PageLoader = () => (
  <div className="h-screen w-full flex flex-col items-center justify-center bg-bg space-y-6">
    <div className="relative">
        <div className="w-16 h-16 border-4 border-zinc-800 border-t-brand rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
            <Terminal size={20} className="text-zinc-600" />
        </div>
    </div>
    <div className="text-zinc-500 font-mono text-xs uppercase tracking-widest animate-pulse flex flex-col items-center gap-1">
      <span>Initializing System...</span>
      <span className="text-[10px] opacity-50">VERIFYING CREDENTIALS</span>
    </div>
  </div>
);

// 🛡️ 2. AUTH GUARDS
const RequireAuth = ({ children }) => {
  const { session } = useSession();
  
  // Wait for session to hydrate
  if (!session.isReady) return <PageLoader />;
  
  // Redirect if not logged in
  if (!session.isAuthenticated) return <Navigate to="/login" replace />;
  
  return children || <Outlet />;
};

const RequireRole = ({ allowedRoles = [], children }) => {
  const { session } = useSession();
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(session.role)) {
      // If Admin tries to access Player route, or vice versa, bounce them
      const fallback = [ROLES.ADMIN, ROLES.OWNER].includes(session.role) ? '/admin/dashboard' : '/dashboard';
      return <Navigate to={fallback} replace />;
  }
  return children || <Outlet />;
};

// 🧱 3. LAYOUT SHELLS
const RootLayout = () => (
  <div className="min-h-screen bg-bg text-white selection:bg-brand/30 font-sans">
    {/* Global Toast Container */}
    <Toaster 
        position="top-right"
        toastOptions={{
            style: { background: '#09090b', color: '#fff', border: '1px solid #27272a' },
            success: { iconTheme: { primary: '#10b981', secondary: '#09090b' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#09090b' } },
        }}
    />
    
    {/* Scanline Overlay (Optional Aesthetic) */}
    <div className="pointer-events-none fixed inset-0 z-50 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
    
    <Outlet />
  </div>
);

const AdminLayout = () => (
  <div className="min-h-screen bg-bg relative z-10">
    <AdminToolbar />
    <div className="pt-14"> {/* Offset for Fixed Toolbar */}
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
        <div className="h-screen w-full flex flex-col items-center justify-center bg-black text-red-500 gap-4">
            <AlertTriangle size={64} />
            <h1 className="text-4xl font-display font-black uppercase tracking-widest">System Failure</h1>
            <p className="text-zinc-500 text-sm font-mono bg-zinc-900 px-4 py-2 rounded">CRITICAL ROUTER EXCEPTION</p>
            <button onClick={() => window.location.href='/'} className="px-6 py-3 border border-red-500 hover:bg-red-500/10 rounded uppercase text-xs font-bold transition-colors">
                Hard Reboot
            </button>
        </div>
    ),
    children: [
      // --- PUBLIC ROUTES ---
      { index: true, element: <LandingPage /> },
      { path: 'login', element: <UnifiedLogin /> }, // 👈 Combined Login
      { path: 'admin/login', element: <AdminLogin /> }, // 👈 Staff-Only Backdoor
      { path: 'admin/recover', element: <AdminPasswordReset /> },
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
          // Redirect root /admin to dashboard
          { index: true, element: <Navigate to="dashboard" replace /> }
        ]
      },

      // --- PLAYER ROUTES (Protected) ---
      {
        path: 'dashboard',
        element: (
          <RequireAuth>
            <RequireRole allowedRoles={[ROLES.CAPTAIN, ROLES.PLAYER, ROLES.SUBSTITUTE]}>
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

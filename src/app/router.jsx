import React, { useEffect } from 'react';
import { createBrowserRouter, Navigate, Outlet, useLocation, ScrollRestoration } from 'react-router-dom';
import { AlertTriangle, Activity } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

// ✅ LOGIC IMPORTS
import { useSession } from '../auth/useSession';
import { ROLES } from '../lib/roles';
// import { SoundNexus, CUES } from '../lib/soundNexus'; // Un-comment when Audio Engine is ready

// 📦 COMPONENT IMPORTS
import { LandingPage } from '../components/LandingPage';
import { UnifiedLogin } from '../components/auth/UnifiedLogin';
import { StaffRegistration } from '../components/auth/StaffRegistration';
import { BracketView } from '../components/BracketView';
import { MatchRoom } from '../components/match/MatchRoom';
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { TeamRosterView } from '../components/admin/TeamRosterView';
import { StaffManagement } from '../components/admin/StaffManagement';
import { AdminToolbar } from '../components/admin/AdminToolbar';
import { PlayerDashboard } from '../components/player/PlayerDashboard';

/**
 * ⚡ PIXEL PALACE: ROUTING MATRIX (V2.0)
 * -------------------------------------
 * STATUS: MASTERED (DUBAI STANDARD)
 * * UPGRADES:
 * 1. SCROLL RESTORATION: Remembers user position on back/forward navigation.
 * 2. AUDIO TRIGGERS: Hooks for sound effects on page transitions.
 * 3. FAILSAFE: "Red Alert" crash handler.
 */

// 🛑 1. CINEMATIC BOOT LOADER
const PageLoader = () => (
  <div className="h-screen w-full flex flex-col items-center justify-center bg-[#050505] gap-8">
    <div className="relative">
      <div className="w-20 h-20 border-2 border-brand/20 border-t-brand rounded-full animate-spin shadow-[0_0_30px_rgba(var(--color-brand),0.4)]" />
      <div className="absolute inset-0 flex items-center justify-center">
        <Activity size={24} className="text-brand animate-pulse" />
      </div>
    </div>
    <div className="flex flex-col items-center gap-2">
      <span className="text-white font-display font-black italic text-xl tracking-tighter uppercase">
        Initializing Nexus
      </span>
      <span className="text-[10px] text-zinc-600 font-mono tracking-[0.5em] uppercase animate-pulse">
        Verifying Clearance...
      </span>
    </div>
  </div>
);

// 🛡️ 2. SECURITY GATES
const RequireAuth = ({ children }) => {
  const { session } = useSession();
  
  // Wait for hydration
  if (!session.isReady) return <PageLoader />;
  
  // Bounce unauthenticated users
  if (!session.isAuthenticated) return <Navigate to="/login" replace />;
  
  return children || <Outlet />;
};

const RequireRole = ({ allowedRoles = [], children }) => {
  const { session } = useSession();
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(session.role)) {
    // Intelligent fallback based on role
    const isStaff = [ROLES.ADMIN, ROLES.OWNER, ROLES.REFEREE].includes(session.role);
    const fallback = isStaff ? '/admin/dashboard' : '/dashboard';
    return <Navigate to={fallback} replace />;
  }
  
  return children || <Outlet />;
};

// 🧱 3. LAYOUT SHELLS

// Wrapper to handle route-change side effects (Sound/Analytics)
const RouteEffectWrapper = () => {
  const location = useLocation();

  useEffect(() => {
    // 🔊 AUDIO TRIGGER: Play sound on navigation
    // SoundNexus.play(CUES.NAVIGATION_SWISH); 
    // console.log(`🧭 Navigated to: ${location.pathname}`);
  }, [location]);

  return null;
};

const RootLayout = () => (
  <div className="min-h-screen bg-bg text-white selection:bg-brand/30 font-sans">
    <RouteEffectWrapper />
    
    {/* 🧠 MEMORY: Remembers scroll position */}
    <ScrollRestoration />

    {/* Global Notifications */}
    <Toaster 
      position="bottom-right"
      toastOptions={{
        style: { background: '#09090b', color: '#fff', border: '1px solid #27272a' },
        success: { iconTheme: { primary: '#10b981', secondary: '#09090b' } },
        error: { iconTheme: { primary: '#ef4444', secondary: '#09090b' } },
      }}
    />
    
    {/* Cinematic Grain Overlay */}
    <div className="pointer-events-none fixed inset-0 z-[100] opacity-[0.02] bg-repeat bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    
    <Outlet />
  </div>
);

const AdminLayout = () => (
  <div className="min-h-screen bg-bg relative">
    <AdminToolbar />
    <div className="pt-16">
      <Outlet />
    </div>
  </div>
);

// 🗺️ 4. THE MASTER MAP
export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#050000] text-red-500 gap-6">
        <AlertTriangle size={80} className="animate-pulse" />
        <div className="text-center">
          <h1 className="text-5xl font-display font-black uppercase italic tracking-tighter text-white">System Failure</h1>
          <p className="text-red-500/80 font-mono text-[10px] mt-2 uppercase tracking-[0.4em]">
            Router Protocol Violation
          </p>
        </div>
        <button 
          onClick={() => window.location.href='/'} 
          className="px-8 py-3 bg-red-600/20 border border-red-500 text-red-100 hover:bg-red-600 hover:text-white font-bold uppercase text-xs tracking-widest transition-all"
        >
          Hard Reboot
        </button>
      </div>
    ),
    children: [
      // --- PUBLIC ROUTES ---
      { index: true, element: <LandingPage /> },
      { path: 'login', element: <UnifiedLogin /> },
      { path: 'staff-register', element: <StaffRegistration /> },
      
      // --- MATCH INTERFACES ---
      { path: 'bracket', element: <BracketView /> },
      { path: 'match/:matchId', element: <MatchRoom /> },

      // --- ADMIN SECTOR (Level 60+) ---
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
          { path: 'bracket', element: <BracketView adminMode={true} /> },
          { index: true, element: <Navigate to="dashboard" replace /> }
        ]
      },

      // --- PLAYER SECTOR (Level 10+) ---
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

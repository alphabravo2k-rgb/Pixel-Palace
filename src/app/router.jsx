/**
 * 🗺️ MASTER NAVIGATION HUB: GENESIS OMNI
 * VERSION: 2050.5.0 (MASTER OMNI)
 * STATUS: OPERATIONAL // SECURED
 */

import React from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { Activity, ShieldAlert } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

// MASTER CORE
import { useNexusStore } from '../store/useNexusStore';
import { getClearanceLevel } from '../lib/security/engine';
import { SoundNexus, CUES } from '../lib/soundNexus';

// VIEW COMPONENTS
import { LandingPage } from '../components/LandingPage';
import { UnifiedLogin } from '../components/auth/UnifiedLogin';
import { StaffRegistration } from '../components/auth/StaffRegistration';
import { BracketView } from '../components/BracketView';

// 3D/CORE COMPONENTS
import { MatchRoom } from '../components/match/MatchRoom'; 
import { SystemDiagnostic } from '../components/admin/SystemDiagnostic'; 

// OPERATIONAL MODULES
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { MatchWarRoom } from '../components/admin/MatchWarRoom';
import { PlayerDashboard } from '../components/player/PlayerDashboard';
import { AdminToolbar } from '../components/admin/AdminToolbar';

/**
 * 🛑 SYSTEM BOOT LOADER
 * Cinematic interlude while LocalStorage is hydrated.
 */
const PageLoader = () => (
  <div className="h-screen w-full flex flex-col items-center justify-center bg-[#020202] gap-10 font-mono">
    <div className="relative">
      <div className="w-24 h-24 border border-brand/10 border-t-brand rounded-sm animate-spin shadow-[0_0_30px_rgba(var(--color-brand)/0.1)]" />
      <div className="absolute inset-0 flex items-center justify-center">
        <Activity size={32} className="text-brand animate-pulse" />
      </div>
    </div>
    <div className="text-[9px] text-zinc-700 tracking-[1em] uppercase animate-flicker">
      Calibrating_Neural_Link...
    </div>
  </div>
);

/**
 * 🛡️ SECURITY GATES
 */
const RequireAuth = () => {
  const { uid, isHydrated } = useNexusStore();
  
  // Wait for LocalStorage to sync
  if (!isHydrated) return <PageLoader />;
  
  return uid ? <Outlet /> : <Navigate to="/login" replace />;
};

const RequireClearance = ({ minLevel = 0 }) => {
  const { profile } = useNexusStore();
  const level = getClearanceLevel(profile?.role);

  if (level < minLevel) {
    try { SoundNexus.play(CUES.UI_ERROR); } catch(e){}
    const fallback = level >= 60 ? '/admin/warroom' : '/dashboard';
    return <Navigate to={fallback} replace />;
  }
  
  return <Outlet />;
};

/**
 * 🧱 ARCHITECTURAL SHELLS
 */
const RootLayout = () => (
  <div className="min-h-screen bg-[#050505] text-white selection:bg-brand/30">
    <Toaster 
      position="bottom-right" 
      toastOptions={{
        className: 'nexus-toast',
        style: {
          background: '#09090b',
          border: '1px solid rgba(255,255,255,0.05)',
          color: '#fff',
          fontFamily: 'monospace',
          fontSize: '11px',
          letterSpacing: '0.1em',
          borderRadius: '2px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
        }
      }}
    />
    <Outlet />
  </div>
);

const AdminLayout = () => (
  <div className="min-h-screen bg-[#09090b] relative animate-in fade-in duration-700">
    <AdminToolbar />
    <div className="pt-24 pb-12 px-8 max-w-[1800px] mx-auto"> 
      <Outlet />
    </div>
  </div>
);

/**
 * 🗺️ THE MASTER ROUTE DEFINITION
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: (
        <div className="h-screen flex flex-col items-center justify-center bg-black text-red-500 font-mono gap-4 uppercase tracking-widest text-[10px]">
            <ShieldAlert size={48} className="animate-pulse" />
            <span>Critical_Router_Exception</span>
            <button onClick={() => window.location.href = '/'} className="mt-4 px-4 py-2 border border-red-900/50 hover:bg-red-900/20">Reboot_System</button>
        </div>
    ),
    children: [
      // 🔓 PUBLIC SECTOR
      { index: true, element: <LandingPage /> },
      { path: 'login', element: <UnifiedLogin /> },
      { path: 'staff-register', element: <StaffRegistration /> },
      
      // ⚔️ LIVE SECTOR (Contextual Overlays)
      { path: 'match/:matchId', element: <MatchRoom /> },
      { path: 'bracket', element: <BracketView /> },

      // 🔐 OPERATOR SECTOR (Clearance 10+)
      {
        path: 'dashboard',
        element: <RequireAuth />,
        children: [
          {
            element: <RequireClearance minLevel={10} />,
            children: [{ index: true, element: <PlayerDashboard /> }]
          }
        ]
      },

      // 🔐 OVERSEER SECTOR (Clearance 60+)
      {
        path: 'admin',
        element: <RequireAuth />,
        children: [
          {
            element: <RequireClearance minLevel={60} />,
            children: [
              {
                element: <AdminLayout />,
                children: [
                  { path: 'warroom', element: <AdminDashboard /> },
                  { path: 'match/:matchId', element: <MatchWarRoom /> }, 
                  { path: 'diagnostics', element: <SystemDiagnostic /> }, 
                  { path: 'bracket', element: <BracketView adminMode={true} /> },
                  { index: true, element: <Navigate to="warroom" replace /> }
                ]
              }
            ]
          }
        ]
      },

      // 🛑 DEVIATION PROTOCOL
      { path: '*', element: <Navigate to="/" replace /> }
    ]
  }
]);

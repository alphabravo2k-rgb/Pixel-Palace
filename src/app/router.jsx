/**
 * 🗺️ PIXEL PALACE: MASTER NAVIGATION HUB
 * --------------------------------------
 * STATUS: MASTERED (BURJ KHALIFA STANDARD)
 * VERSION: 5.0.0
 * * FEATURES:
 * 1. 3D ROUTING: Directs combatants to the WebGL 'CombatHUD'.
 * 2. SECURITY GATES: Enforces the 6-Layer RBAC model via 'security/engine'.
 * 3. ADMIN TOOLS: Exposes the new 'SystemDiagnostic' panel.
 */

import React from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { Activity } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

// 🧠 MASTER LOGIC
import { useNexusStore } from '../store/useNexusStore';
import { getClearanceLevel } from '../lib/security/engine';

// 🏗️ VIEW COMPONENTS
import { LandingPage } from '../components/LandingPage';
import { UnifiedLogin } from '../components/auth/UnifiedLogin';
import { StaffRegistration } from '../components/auth/StaffRegistration';
import { BracketView } from '../components/BracketView';

// 🚀 NEW 3D COMPONENTS
import { MatchRoom } from '../components/match/MatchRoom'; // The 3D Cockpit
import { SystemDiagnostic } from '../components/admin/SystemDiagnostic'; // The Engine Room

// 🧱 LEGACY COMPONENTS (To be upgraded)
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { MatchWarRoom } from '../components/admin/MatchWarRoom';
import { PlayerDashboard } from '../components/player/PlayerDashboard';
import { AdminToolbar } from '../components/admin/AdminToolbar';

// 🛑 1. SYSTEM BOOT LOADER (Cinematic)
const PageLoader = () => (
  <div className="h-screen w-full flex flex-col items-center justify-center bg-[#020202] gap-8">
    <div className="relative">
      <div className="w-20 h-20 border-2 border-brand/20 border-t-brand rounded-sm animate-spin shadow-neon" />
      <div className="absolute inset-0 flex items-center justify-center">
        <Activity size={24} className="text-brand animate-pulse" />
      </div>
    </div>
    <div className="text-[10px] text-zinc-600 font-mono tracking-[0.5em] uppercase">
      Checking Clearance...
    </div>
  </div>
);

// 🛡️ 2. SECURITY GATES
const RequireAuth = () => {
  const { uid, isHydrated } = useNexusStore();
  if (!isHydrated) return <PageLoader />;
  return uid ? <Outlet /> : <Navigate to="/login" replace />;
};

const RequireClearance = ({ minLevel = 0 }) => {
  const { profile } = useNexusStore();
  const level = getClearanceLevel(profile?.role);

  if (level < minLevel) {
    // Smart Redirect: Admins go to War Room, Players to Dashboard
    const fallback = level >= 60 ? '/admin/warroom' : '/dashboard';
    return <Navigate to={fallback} replace />;
  }
  return <Outlet />;
};

// 🧱 3. ARCHITECTURAL SHELLS
const RootLayout = () => (
  <div className="min-h-screen bg-[#050505] text-white selection:bg-brand/30">
    <Toaster position="bottom-right" 
      toastOptions={{
        style: {
          background: '#09090b',
          border: '1px solid rgba(255,255,255,0.1)',
          color: '#fff',
          fontFamily: 'monospace',
          fontSize: '12px',
          textTransform: 'uppercase'
        }
      }}
    />
    <Outlet />
  </div>
);

const AdminLayout = () => (
  <div className="min-h-screen bg-[#09090b] relative">
    <AdminToolbar />
    <div className="pt-20 px-6"> 
      <Outlet />
    </div>
  </div>
);

// 🗺️ 4. THE MASTER MAP
export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <div className="h-screen flex items-center justify-center bg-black text-red-500 font-mono">CRITICAL ROUTER FAILURE</div>,
    children: [
      // 🔓 PUBLIC ACCESS
      { index: true, element: <LandingPage /> },
      { path: 'login', element: <UnifiedLogin /> },
      { path: 'staff-register', element: <StaffRegistration /> },
      
      // ⚔️ LIVE COMBAT (The 3D HUD)
      // Accessible to everyone, but view changes based on Role (Player vs Spec)
      { path: 'match/:matchId', element: <MatchRoom /> },
      { path: 'bracket', element: <BracketView /> },

      // 🔐 PROTECTED: OPERATOR DECK (Level 10+)
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

      // 🔐 PROTECTED: OVERSEER DECK (Level 60+)
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
                  { path: 'match/:matchId', element: <MatchWarRoom /> }, // ⚔️ ADMIN SPECIFIC CONTROL
                  { path: 'diagnostics', element: <SystemDiagnostic /> }, // 🩺 NEW
                  { path: 'bracket', element: <BracketView adminMode={true} /> },
                  { index: true, element: <Navigate to="warroom" replace /> }
                ]
              }
            ]
          }
        ]
      },

      // 🛑 CATCH ALL
      { path: '*', element: <Navigate to="/" replace /> }
    ]
  }
]);

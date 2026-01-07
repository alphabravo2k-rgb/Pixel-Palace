/**
 * PIXEL PALACE: MASTER NAVIGATION HUB
 * VERSION: 4.5.0 (NEXUS INTEGRATED)
 * - Reactive Nexus Guarding (Zustand)
 * - Intelligent Role Redirection
 * - Hardware Accelerated Layouts
 */

import React from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { AlertTriangle, Activity, Lock } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

// MASTER LOGIC
import { useNexusStore } from '../store/useNexusStore';
import { getClearanceLevel, ROLES } from '../lib/roles';

// VIEW COMPONENTS
import { LandingPage } from '../components/LandingPage';
import { UnifiedLogin } from '../components/auth/UnifiedLogin';
import { StaffRegistration } from '../components/auth/StaffRegistration';
import { BracketView } from '../components/BracketView';
import { MatchRoom } from '../components/match/MatchRoom';
import { AdminDashboard } from '../components/admin/AdminDashboard';
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

// 🛡️ 2. SECURITY GATES (The Guards)
const RequireAuth = () => {
  const { uid, isHydrated } = useNexusStore();
  
  if (!isHydrated) return <PageLoader />;
  return uid ? <Outlet /> : <Navigate to="/login" replace />;
};

const RequireClearance = ({ minLevel = 0 }) => {
  const { role } = useNexusStore();
  const level = getClearanceLevel(role);
  
  if (level < minLevel) {
    // Redirect based on current status
    const fallback = level >= 60 ? '/admin/warroom' : '/dashboard';
    return <Navigate to={fallback} replace />;
  }
  return <Outlet />;
};

// 🧱 3. ARCHITECTURAL SHELLS
const RootLayout = () => (
  <div className="min-h-screen bg-[#050505] text-white selection:bg-brand/30">
    <Toaster position="bottom-right" />
    <div className="pointer-events-none fixed inset-0 z-[100] opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    <Outlet />
  </div>
);

const AdminLayout = () => (
  <div className="min-h-screen bg-bg relative">
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
    errorElement: <div className="h-screen flex items-center justify-center bg-black text-red-500">Critical Router Failure</div>,
    children: [
      // PUBLIC ACCESS
      { index: true, element: <LandingPage /> },
      { path: 'login', element: <UnifiedLogin /> },
      { path: 'staff-register', element: <StaffRegistration /> },
      
      // PROTECTED: OVERSEER DECK (Level 60+)
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
                  { path: 'bracket', element: <BracketView adminMode={true} /> },
                  { index: true, element: <Navigate to="warroom" replace /> }
                ]
              }
            ]
          }
        ]
      },

      // PROTECTED: OPERATOR DECK (Level 10+)
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

      // MATCH INTERFACES
      { path: 'bracket', element: <BracketView /> },
      { path: 'match/:matchId', element: <MatchRoom /> },

      // CATCH ALL
      { path: '*', element: <Navigate to="/" replace /> }
    ]
  }
]);

import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { useSession } from '../auth/useSession';
import { ROLES } from '../lib/roles';
import { Loader2 } from 'lucide-react';

// 1. PUBLIC PAGES
import { LandingPage } from '../components/LandingPage'; 
import { AdminLogin } from '../components/admin/AdminLogin';
import { BracketView } from '../components/BracketView';

// 2. MATCH ENGINE
import { MatchRoom } from '../components/match/MatchRoom'; 

// 3. DASHBOARDS
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { PlayerDashboard } from '../components/player/PlayerDashboard'; 
import { AdminToolbar } from '../components/admin/AdminToolbar';

// 🛡️ SECURITY GUARD: CLIENT-SIDE RBAC
const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const { session } = useSession();
  
  // A. Loading State (Prevents flicker)
  if (session.loading) {
    return (
        <div className="h-screen w-full flex items-center justify-center bg-[#050505]">
            <Loader2 className="animate-spin text-fuchsia-600 w-8 h-8"/>
        </div>
    );
  }

  // B. Auth Check
  if (!session.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // C. Role Check (Strict)
  if (allowedRoles.length > 0 && !allowedRoles.includes(session.role)) {
    console.warn(`⛔ ACCESS DENIED: Role ${session.role} attempted to access protected route.`);
    return <Navigate to="/" replace />; 
  }
  
  return children ? children : <Outlet />;
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
      // PUBLIC
      { index: true, element: <LandingPage /> },
      { path: 'login', element: <AdminLogin /> },
      { path: 'bracket', element: <BracketView /> },
      
      // 🏟️ MATCH ROOM (Hybrid Access - Read Public / Write Protected via Components)
      { path: 'match/:matchId', element: <MatchRoom /> },

      // 🛡️ ADMIN AREA (Owner / Admin / Referee)
      {
        path: 'admin',
        element: <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.OWNER, ROLES.REFEREE]}><AdminLayout /></ProtectedRoute>,
        children: [
          { path: 'dashboard', element: <AdminDashboard /> }, 
        ]
      },
      
      // 🛡️ PLAYER AREA (Captain / Player / Owner)
      {
        path: 'dashboard',
        element: <ProtectedRoute allowedRoles={[ROLES.CAPTAIN, ROLES.PLAYER, ROLES.OWNER]}><PlayerDashboard /></ProtectedRoute>
      },
      
      // 404 CATCH-ALL
      { path: '*', element: <Navigate to="/" replace /> }
    ]
  }
]);

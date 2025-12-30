import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { useSession } from '../auth/useSession';
import { ROLES } from '../lib/roles';
import { Loader2 } from 'lucide-react';

// COMPONENTS
import { LandingPage } from '../components/LandingPage'; 
import { AdminLogin } from '../components/admin/AdminLogin';
import { AdminDashboard } from '../components/admin/AdminDashboard'; // The Main Hub
import { BracketView } from '../components/BracketView';
import { MatchRoom } from '../components/match/MatchRoom'; 
import { PlayerDashboard } from '../components/player/PlayerDashboard'; 
import { AdminToolbar } from '../components/admin/AdminToolbar';

// 🛡️ GUARD
const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const { session } = useSession();
  
  if (session.loading) return <div className="h-screen flex items-center justify-center bg-zinc-950"><Loader2 className="animate-spin text-fuchsia-500"/></div>;
  if (!session.isAuthenticated) return <Navigate to="/login" replace />;
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(session.role)) {
    return <Navigate to="/" replace />; 
  }
  
  return children ? children : <Outlet />;
};

const AdminLayout = () => (
    <div className="min-h-screen bg-black">
        <AdminToolbar />
        <div className="pt-16"><Outlet /></div>
    </div>
);

export const router = createBrowserRouter([
  {
    path: '/',
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'login', element: <AdminLogin /> },
      { path: 'bracket', element: <BracketView /> },
      
      // 🏟️ MATCH ROOM (Public Read / Private Write)
      { path: 'match/:matchId', element: <MatchRoom /> },

      // 🛡️ ADMIN AREA
      {
        path: 'admin',
        element: <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.OWNER, ROLES.REFEREE]}><AdminLayout /></ProtectedRoute>,
        children: [
          { path: 'dashboard', element: <AdminDashboard /> }, // The Unified Dashboard
        ]
      },
      
      // 🛡️ PLAYER AREA
      {
        path: 'dashboard',
        element: <ProtectedRoute allowedRoles={[ROLES.CAPTAIN, ROLES.PLAYER, ROLES.OWNER]}><PlayerDashboard /></ProtectedRoute>
      },
      
      // 404 CATCH-ALL
      { path: '*', element: <Navigate to="/" replace /> }
    ]
  }
]);

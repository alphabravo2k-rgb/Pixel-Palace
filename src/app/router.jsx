import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { useSession } from '../auth/useSession';
import { ROLES } from '../lib/roles';
import { Loader2 } from 'lucide-react';

// COMPONENTS
import { LandingPage } from '../components/LandingPage';
import { AdminLogin } from '../components/admin/AdminLogin';
import { TournamentWarRoom } from '../components/TournamentWarRoom';
import { StaffManagement } from '../components/admin/StaffManagement';
import { BracketView } from '../components/BracketView';
import { TeamRoster } from '../components/TeamRoster';
import { AdminToolbar } from '../components/admin/AdminToolbar'; // Ensure path is correct

// 🛡️ GUARD: Require Auth & Role
const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const { session, loading } = useSession();

  if (loading) return <div className="h-screen flex items-center justify-center bg-zinc-950"><Loader2 className="animate-spin text-fuchsia-500"/></div>;

  if (!session.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(session.role)) {
    return <Navigate to="/" replace />; // Unauthorized
  }

  return children ? children : <Outlet />;
};

// 🛡️ LAYOUTS
const MainLayout = () => (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-fuchsia-500/30">
        <Outlet />
    </div>
);

const AdminLayout = () => (
    <div className="min-h-screen bg-black">
        <AdminToolbar />
        <div className="pt-16">
            <Outlet />
        </div>
    </div>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'login', element: <AdminLogin /> },
      { path: 'bracket', element: <BracketView /> }, // Public View
      
      // 🛡️ ADMIN ROUTES
      {
        path: 'admin',
        element: <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.OWNER, ROLES.REFEREE]}><AdminLayout /></ProtectedRoute>,
        children: [
          { path: 'war-room', element: <TournamentWarRoom /> },
          { path: 'staff', element: <StaffManagement /> },
          // Add other admin routes here
        ]
      },
      
      // 🛡️ CAPTAIN ROUTES
      {
        path: 'roster',
        element: <ProtectedRoute allowedRoles={[ROLES.CAPTAIN, ROLES.OWNER]}><TeamRoster /></ProtectedRoute>
      },
      
      // 404
      { path: '*', element: <Navigate to="/" replace /> }
    ]
  }
]);

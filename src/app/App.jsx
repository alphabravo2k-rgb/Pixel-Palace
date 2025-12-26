import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom';

// 1. Auth & Governance
import { SessionProvider, useSession } from '../auth/useSession';
import { useCapabilities } from '../auth/useCapabilities';
import { TournamentProvider } from '../tournament/useTournament'; 

// 2. Components
import { PlayerDashboard } from '../components/player/PlayerDashboard';
import { MatchRoom } from '../components/match/MatchRoom';
import { AdminDashboard } from '../components/admin'; // ✅ Using the Index Barrel we made
import { AdminLogin } from '../components/admin/AdminLogin'; 
import { LandingPage } from '../components/LandingPage'; 
import ErrorBoundary from '../components/ErrorBoundary'; // ✅ Import ErrorBoundary

// 🛡️ CAPABILITY GUARD
const RouteGuard = ({ children, requiredCapability = null }) => {
  const { session, loading } = useSession();
  const { hasCapability } = useCapabilities();

  if (loading) {
    return (
      <div className="h-screen w-full bg-black flex items-center justify-center">
        <div className="text-zinc-500 font-mono text-sm animate-pulse">
          VERIFYING IDENTITY PROTOCOLS...
        </div>
      </div>
    );
  }

  if (!session?.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredCapability) {
    const [resource, action] = requiredCapability.split(':');
    const canAccess = hasCapability(session.role, resource, action);

    if (!canAccess) {
      console.warn(`SECURITY ALERT: Access Denied. Missing ${requiredCapability}`);
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

const MatchRoomWrapper = () => {
  const { id } = useParams();
  return <MatchRoom matchId={id} />;
};

// 🛡️ ERROR BOUNDARY WRAPPER
// This component listens to the route. If the route changes, it resets the error boundary.
const AppContent = () => {
  const location = useLocation(); 

  return (
    <ErrorBoundary key={location.pathname}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AdminLogin />} />
        
        <Route 
          path="/dashboard" 
          element={
            <RouteGuard requiredCapability="PROFILE:EDIT">
              <PlayerDashboard />
            </RouteGuard>
          } 
        />
        
        <Route 
          path="/match/:id" 
          element={
            <RouteGuard requiredCapability="MATCH:CHECK_IN">
               <MatchRoomWrapper />
            </RouteGuard>
          } 
        />

        <Route 
          path="/admin/dashboard" 
          element={
            <RouteGuard requiredCapability="TOURNAMENT:CONFIGURE">
              <AdminDashboard />
            </RouteGuard>
          } 
        />

        <Route path="*" element={
          <div className="h-screen bg-black text-white flex flex-col items-center justify-center font-mono">
            <h1 className="text-4xl font-bold text-red-500">404 // ZONE LOST</h1>
            <p className="text-zinc-500 mt-2">The requested sector does not exist.</p>
          </div>
        } />
      </Routes>
    </ErrorBoundary>
  );
};

function App() {
  return (
    <BrowserRouter>
      <SessionProvider>
        <TournamentProvider>
           <AppContent />
        </TournamentProvider>
      </SessionProvider>
    </BrowserRouter>
  );
}

export default App;

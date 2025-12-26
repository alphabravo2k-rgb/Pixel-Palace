import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom';

// 1. Auth & Governance
import { SessionProvider, useSession } from '../auth/useSession';
import { useCapabilities } from '../auth/useCapabilities';
import { TournamentProvider } from '../tournament/useTournament'; 

// 2. Components
import { PlayerDashboard } from '../components/player/PlayerDashboard';
import { MatchRoom } from '../components/match/MatchRoom';
import { AdminDashboard } from '../components/admin'; 
import { AdminLogin } from '../components/admin/AdminLogin'; 
import { LandingPage } from '../components/LandingPage'; 
import ErrorBoundary from '../components/ErrorBoundary'; // ✅ Import

// 🛡️ CAPABILITY GUARD
const RouteGuard = ({ children, requiredCapability = null }) => {
  const { session, loading } = useSession();
  const { hasCapability } = useCapabilities();

  if (loading) return <div className="h-screen bg-black" />;

  if (!session?.isAuthenticated) return <Navigate to="/login" replace />;

  if (requiredCapability) {
    const [resource, action] = requiredCapability.split(':');
    if (!hasCapability(session.role, resource, action)) {
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
const AppContent = () => {
  const location = useLocation(); // Gets current route path

  return (
    // Key forces ErrorBoundary to reset state on route change
    <ErrorBoundary resetKey={location.pathname}> 
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

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';

// 1. Auth & Governance (Correctly stepping out of src/app)
import { SessionProvider, useSession } from '../auth/useSession';
import { useCapabilities } from '../auth/useCapabilities';

// 2. Components
import { PlayerDashboard } from '../components/player/PlayerDashboard';
import { MatchRoom } from '../components/match/MatchRoom';
import { AdminDashboard } from '../components/admin/AdminDashboard'; 
import { AdminLogin } from '../components/admin/AdminLogin'; 
import { LandingPage } from '../components/LandingPage'; 

/**
 * 🛡️ CAPABILITY GUARD (The "Real" Check)
 * instead of checking "Is Admin?", we check "Can this user Configure Tournaments?"
 * This decouples your Router from your Roles.
 */
const RouteGuard = ({ children, requiredCapability = null }) => {
  const { session, loading } = useSession();
  const { hasCapability } = useCapabilities();

  // 1. Loading State (Don't leak UI while checking)
  if (loading) {
    return (
      <div className="h-screen w-full bg-black flex items-center justify-center">
        <div className="text-zinc-500 font-mono text-sm animate-pulse">
          VERIFYING IDENTITY PROTOCOLS...
        </div>
      </div>
    );
  }

  // 2. Authentication Check (Identity)
  if (!session?.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 3. Capability Check (Policy)
  // We parse "TOURNAMENT:CONFIGURE" into resource/action
  if (requiredCapability) {
    const [resource, action] = requiredCapability.split(':');
    
    // We pass the session role to hasCapability (the hook handles the matrix)
    const canAccess = hasCapability(session.role, resource, action);

    if (!canAccess) {
      console.warn(`SECURITY ALERT: Access Denied. Missing ${requiredCapability}`);
      // Redirect to the safe "Player" zone if they try to access Admin
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

// 🎮 Helper to grab ID from URL
const MatchRoomWrapper = () => {
  const { id } = useParams();
  return <MatchRoom matchId={id} />;
};

function App() {
  return (
    <BrowserRouter>
      {/* SessionProvider = The Single Source of Identity Truth */}
      <SessionProvider>
        <Routes>
          {/* PUBLIC ZONES */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AdminLogin />} />
          
          {/* 🛡️ PLAYER ZONE (Requires minimal read access) */}
          <Route 
            path="/dashboard" 
            element={
              <RouteGuard requiredCapability="PROFILE:EDIT">
                <PlayerDashboard />
              </RouteGuard>
            } 
          />
          
          {/* 🛡️ MATCH ZONE (Requires capability to view/play) */}
          <Route 
            path="/match/:id" 
            element={
              <RouteGuard requiredCapability="MATCH:CHECK_IN">
                 <MatchRoomWrapper />
              </RouteGuard>
            } 
          />

          {/* 🛡️ ADMIN WAR ROOM (Strictly guarded by High-Risk Permission) */}
          {/* We do NOT ask for "ADMIN" role. We ask for "TOURNAMENT:CONFIGURE" power. */}
          <Route 
            path="/admin/dashboard" 
            element={
              <RouteGuard requiredCapability="TOURNAMENT:CONFIGURE">
                <AdminDashboard />
              </RouteGuard>
            } 
          />

          {/* 404 CATCH ALL */}
          <Route path="*" element={
            <div className="h-screen bg-black text-white flex flex-col items-center justify-center font-mono">
              <h1 className="text-4xl font-bold text-red-500">404 // ZONE LOST</h1>
              <p className="text-zinc-500 mt-2">The requested sector does not exist.</p>
            </div>
          } />
        </Routes>
      </SessionProvider>
    </BrowserRouter>
  );
}

export default App;

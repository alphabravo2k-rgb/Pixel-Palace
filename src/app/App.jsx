import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';

// 1. Auth & Context (Note the '../' to go up one level)
import { SessionProvider, useSession } from '../auth/useSession';

// 2. The New Components (We just built these)
import { PlayerDashboard } from '../components/player/PlayerDashboard';
import { MatchRoom } from '../components/match/MatchRoom';

// 3. Existing/Placeholder Components (Ensure these exist or comment them out)
// If you don't have an AdminDashboard yet, you can temporarily point it to PlayerDashboard
import { AdminDashboard } from '../components/admin/AdminDashboard'; 
import { AdminLogin } from '../components/admin/AdminLogin'; 
import { LandingPage } from '../components/LandingPage'; 

// 🛡️ Route Guard: Ensures user is logged in
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { session, loading } = useSession();

  if (loading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center text-zinc-500">
        Loading System Access...
      </div>
    );
  }

  if (!session?.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Role Check (Optional strict mode)
  if (requiredRole && session.role !== requiredRole && session.role !== 'OWNER') {
    // If an Admin tries to go to a Super-Admin page, kick them to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// 🎮 Match Room Wrapper: Hooks into 'react-router-dom' to get the ID
const MatchRoomWrapper = () => {
  const { id } = useParams(); // Gets '123' from '/match/123'
  return <MatchRoom matchId={id} />;
};

function App() {
  return (
    <BrowserRouter>
      <SessionProvider>
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AdminLogin />} />
          
          {/* 🛡️ PLAYER DASHBOARD */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <PlayerDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* 🛡️ MATCH ROOM (Dynamic ID) */}
          <Route 
            path="/match/:id" 
            element={
              <ProtectedRoute>
                <MatchRoomWrapper />
              </ProtectedRoute>
            } 
          />

          {/* 🛡️ ADMIN WAR ROOM */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />

          {/* 404 CATCH ALL */}
          <Route path="*" element={
            <div className="h-screen bg-black text-white flex flex-col items-center justify-center">
              <h1 className="text-4xl font-bold font-['Teko']">404</h1>
              <p className="text-zinc-500">Zone Lost</p>
            </div>
          } />
        </Routes>
      </SessionProvider>
    </BrowserRouter>
  );
}

export default App;

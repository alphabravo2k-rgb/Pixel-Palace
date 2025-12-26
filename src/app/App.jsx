import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SessionProvider, useSession } from './auth/useSession';

// 1. Import The New Components
import { AdminDashboard } from './components/admin/AdminDashboard';
import { PlayerDashboard } from './components/player/PlayerDashboard';
import { MatchRoom } from './components/match/MatchRoom';
import { AdminLogin } from './components/admin/AdminLogin'; // Assuming you have a login page

// 2. Import Legacy/Existing Components (Placeholders if needed)
import { LandingPage } from './components/LandingPage'; 

// 🛡️ Route Guard: Ensures user is logged in
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { session, loading } = useSession();

  if (loading) return <div className="h-screen bg-black flex items-center justify-center text-zinc-500">Loading Access...</div>;

  if (!session.isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // Optional: Role-based redirect (Prevent players from seeing Admin Dashboard)
  if (requiredRole && session.role !== requiredRole && session.role !== 'OWNER') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// 🎮 Match Room Wrapper: Extracts ID from URL
const MatchRoomWrapper = () => {
  const matchId = window.location.pathname.split("/").pop(); // Simple extraction
  return <MatchRoom matchId={matchId} />;
};

function App() {
  return (
    <BrowserRouter>
      <SessionProvider>
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/login" element={<Navigate to="/admin/login" />} /> {/* Unified Login for now */}

          {/* 🛡️ PLAYER ROUTES */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <PlayerDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/match/:id" 
            element={
              <ProtectedRoute>
                <MatchRoomWrapper />
              </ProtectedRoute>
            } 
          />

          {/* 🛡️ ADMIN ROUTES */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />

          {/* 404 CATCH ALL */}
          <Route path="*" element={<div className="h-screen bg-black text-white flex items-center justify-center">404 - Zone Lost</div>} />
        </Routes>
      </SessionProvider>
    </BrowserRouter>
  );
}

export default App;

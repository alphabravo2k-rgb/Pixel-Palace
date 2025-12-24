import React from 'react';
import { Outlet } from 'react-router-dom';
import { SessionProvider, useSession } from '../auth/useSession';
import { TournamentProvider } from '../tournament/useTournament';
import ErrorBoundary from '../components/ErrorBoundary';
import AdminToolbar from '../components/AdminToolbar';

/**
 * AdminGate Component
 * Internal guard to prevent unauthorized DOM leakage.
 * The AdminToolbar is only injected into the tree if a valid
 * Admin session is confirmed.
 */
const AdminGate = () => {
  const { isAdmin, loading } = useSession();
  
  // Do not render anything while loading or if not an admin.
  // This prevents capability discovery by guests.
  if (loading || !isAdmin) return null;
  
  return <AdminToolbar />;
};

/**
 * App Root Component
 * Defines the global provider hierarchy and structural layout.
 */
function App() {
  // UUID for the active tournament instance.
  const ACTIVE_TOURNAMENT_ID = 'e42d6e9f-a84f-47b5-b26c-48b2cab0d5ca';

  return (
    <ErrorBoundary>
      <SessionProvider>
        <TournamentProvider tournamentId={ACTIVE_TOURNAMENT_ID}>
          <div className="min-h-screen bg-[#050505] text-white selection:bg-fuchsia-500/30 overflow-x-hidden">
            
            {/* 🛡️ Secure Admin Mounting */}
            <AdminGate />

            {/* Main Content Area
               PinLogin is now handled via the router to avoid 
               global mount conflicts and race conditions.
            */}
            <main className="relative">
              <Outlet />
            </main>

            {/* Visual Layer - Lowest Z-Index */}
            <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden opacity-40">
              <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-fuchsia-900/10 blur-[150px] rounded-full" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 blur-[150px] rounded-full" />
            </div>

          </div>
        </TournamentProvider>
      </SessionProvider>
    </ErrorBoundary>
  );
}

export default App;

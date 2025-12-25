import React from 'react';
import { Outlet } from 'react-router-dom';
import ErrorBoundary from '../components/ErrorBoundary';
import { SessionProvider } from '../auth/useSession';
import { TournamentProvider } from '../tournament/useTournament';

/**
 * 1️⃣ App.jsx — ROOT COMPOSITION AUDIT
 * ✅ Fix: Ambiguity Resolved.
 * We treat this as a Global App with a specific default target,
 * ensuring the public view always loads a tournament.
 */
const App = () => {
  // Pull default ID from environment to prevent "Blank State" on load
  const defaultTournamentId = import.meta.env.VITE_DEFAULT_TOURNAMENT_ID;

  return (
    <ErrorBoundary>
      <SessionProvider>
        {/* ❌ Fixed: "You are not passing a tournamentId." 
           ✅ We now explicitly pass the default config.
        */}
        <TournamentProvider defaultId={defaultTournamentId}>
          <div className="app-shell min-h-screen bg-black text-white font-sans selection:bg-fuchsia-500/30 selection:text-fuchsia-200">
            {/* The Outlet renders the route content determined by router.jsx 
               (e.g., BracketView, AdminLayout, etc.)
            */}
            <Outlet />
          </div>
        </TournamentProvider>
      </SessionProvider>
    </ErrorBoundary>
  );
};

export default App;

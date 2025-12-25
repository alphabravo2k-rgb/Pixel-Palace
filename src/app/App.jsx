import React from 'react';
import { Outlet } from 'react-router-dom';
import ErrorBoundary from '../components/ErrorBoundary';
import { SessionProvider } from '../auth/useSession';
import { TournamentProvider } from '../tournament/useTournament';

const App = () => {
  // Pull default ID from environment
  const defaultTournamentId = import.meta.env.VITE_DEFAULT_TOURNAMENT_ID;

  return (
    <ErrorBoundary>
      <SessionProvider>
        {/* ✅ BACKEND ALIGNMENT: 
            The Provider loads the tournament state from the DB immediately.
            If the DB says 'setup', the UI will reflect 'setup'.
        */}
        <TournamentProvider defaultId={defaultTournamentId}>
          <div className="app-shell min-h-screen bg-black text-white font-sans selection:bg-fuchsia-500/30 selection:text-fuchsia-200">
            <Outlet />
          </div>
        </TournamentProvider>
      </SessionProvider>
    </ErrorBoundary>
  );
};

export default App;

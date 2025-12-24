import React from 'react';
import { Outlet } from 'react-router-dom';
import { SessionProvider } from '../auth/useSession';
import { TournamentProvider } from '../tournament/useTournament';
import ErrorBoundary from '../components/ErrorBoundary';

/**
 * 1️⃣ App.jsx — ROOT COMPOSITION AUDIT
 * Strictly follows the rule: Root provides capabilities, not controls.
 */
const App = () => {
  // UUID for the active tournament instance
  const ACTIVE_TOURNAMENT_ID = 'e42d6e9f-a84f-47b5-b26c-48b2cab0d5ca';

  return (
    <ErrorBoundary>
      <SessionProvider>
        <TournamentProvider tournamentId={ACTIVE_TOURNAMENT_ID}>
          <div className="app-shell">
            {/* Controls (AdminToolbar/PinLogin) are no longer here.
               They will be mounted inside specific layouts/routes 
               defined in router.jsx to prevent leakage.
            */}
            <Outlet />
          </div>
        </TournamentProvider>
      </SessionProvider>
    </ErrorBoundary>
  );
};

export default App;

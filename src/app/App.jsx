import React from 'react';
import { SessionProvider } from '../auth/useSession';
import { TournamentProvider } from '../tournament/useTournament';
import Router from './router';
import PinLogin from '../components/PinLogin';

// Root component that sets up all contexts
const App = () => {
  return (
    <SessionProvider>
      <TournamentProvider>
        <Router />
        <PinLogin /> {/* Global Modal Layer */}
      </TournamentProvider>
    </SessionProvider>
  );
};

export default App;

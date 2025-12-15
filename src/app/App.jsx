import React from 'react';
import { AuthProvider } from '../auth/useAuth';
import { TournamentProvider } from '../tournament/useTournament';
import Router from './router';

// Root component that sets up all contexts
const App = () => {
  return (
    <AuthProvider>
      <TournamentProvider>
        <Router />
      </TournamentProvider>
    </AuthProvider>
  );
};

export default App;

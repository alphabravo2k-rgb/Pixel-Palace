import React from 'react';
import { SessionProvider } from '../auth/useSession';
import { TournamentProvider } from '../tournament/useTournament';
import Router from './router';
import PinLogin from '../components/PinLogin';

// Optional: Import a global error boundary here if desired

const App = () => {
  return (
    // 1. Auth Layer (Session Management)
    <SessionProvider>
      
      {/* 2. Data Layer (Tournament State) */}
      <TournamentProvider>
        
        <div className="antialiased text-zinc-300 min-h-screen bg-ui-bg selection:bg-brand selection:text-black">
          
          {/* 3. Navigation & Views */}
          <Router />
          
          {/* 4. Global Overlays */}
          <PinLogin />
          
        </div>
        
      </TournamentProvider>
      
    </SessionProvider>
  );
};

export default App;

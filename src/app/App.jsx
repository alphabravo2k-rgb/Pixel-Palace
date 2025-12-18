import React from 'react';
import { SessionProvider } from '../auth/useSession';
import { TournamentProvider } from '../tournament/useTournament';
import Router from './router';
import PinLogin from '../components/PinLogin';
import ErrorBoundary from '../components/ErrorBoundary';

const App = () => {
  return (
    // 1. Global Safety Net
    <ErrorBoundary>
      
      {/* 2. Auth Layer */}
      <SessionProvider>
        
        {/* 3. Data Layer */}
        <TournamentProvider>
          
          <div className="antialiased text-zinc-300 min-h-screen bg-ui-bg selection:bg-brand selection:text-black">
            
            {/* 4. Interface */}
            <Router />
            
            {/* 5. Global Overlays */}
            <PinLogin />
            
          </div>
          
        </TournamentProvider>
        
      </SessionProvider>
      
    </ErrorBoundary>
  );
};

export default App;

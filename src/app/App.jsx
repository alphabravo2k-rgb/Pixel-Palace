import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom'; // Import Outlet
import { SessionProvider } from '../auth/useSession';
import { TournamentProvider } from '../tournament/useTournament';
import ErrorBoundary from '../components/ErrorBoundary';

const App = () => {
  return (
    <ErrorBoundary>
      <SessionProvider>
        <TournamentProvider>
          <div className="antialiased text-zinc-300 min-h-screen bg-[#060709] selection:bg-[#ff5500] selection:text-black">
            
            {/* Renders the child route (Bracket, Admin, or Veto) */}
            <Outlet /> 

          </div>
        </TournamentProvider>
      </SessionProvider>
    </ErrorBoundary>
  );
};

export default App;

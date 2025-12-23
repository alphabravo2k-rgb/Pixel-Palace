import React from 'react';
import { Outlet } from 'react-router-dom';
import { SessionProvider } from '../auth/useSession';
import { TournamentProvider } from '../tournament/useTournament'; // ✅ Enabled for Live Data
import ErrorBoundary from '../components/ErrorBoundary';
import AdminToolbar from '../components/AdminToolbar';
import PinLogin from '../components/PinLogin';

const App = () => {
  return (
    <ErrorBoundary>
      <SessionProvider>
        {/* Data Layer: Provides Match/Team data to the whole app */}
        <TournamentProvider>
          <div className="antialiased text-zinc-300 min-h-screen bg-[#060709] selection:bg-[#ff5500] selection:text-black flex flex-col">
            {/* Persistent UI Elements */}
            <AdminToolbar />
            
            {/* The Page Content Renders Here */}
            <Outlet /> 
            
            {/* Global Modals */}
            <PinLogin />
          </div>
        </TournamentProvider>
      </SessionProvider>
    </ErrorBoundary>
  );
};

export default App;

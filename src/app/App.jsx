import React from 'react';
import { Outlet } from 'react-router-dom';
import { SessionProvider } from '../auth/useSession';
import { TournamentProvider } from '../tournament/useTournament';
import ErrorBoundary from '../components/ErrorBoundary';
// We need AdminToolbar here so it persists across all pages
import AdminToolbar from '../components/AdminToolbar';
import PinLogin from '../components/PinLogin';

const App = () => {
  return (
    <ErrorBoundary>
      <SessionProvider>
        <TournamentProvider>
          <div className="antialiased text-zinc-300 min-h-screen bg-[#060709] selection:bg-[#ff5500] selection:text-black flex flex-col">
            <AdminToolbar />
            <Outlet /> 
            <PinLogin /> {/* Global Modal */}
          </div>
        </TournamentProvider>
      </SessionProvider>
    </ErrorBoundary>
  );
};

export default App;

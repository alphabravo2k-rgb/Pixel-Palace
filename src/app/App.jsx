import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { SessionProvider } from '../auth/useSession';
import { TournamentProvider } from '../tournament/useTournament';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { router } from './router';

// 🛡️ GLOBAL CSS & FONTS are handled in index.html/index.css now.

function App() {
  return (
    <React.StrictMode>
      {/* 1. Safety Net: Catches UI crashes */}
      <ErrorBoundary>
        {/* 2. Auth Layer: Establishes Identity */}
        <SessionProvider>
          {/* 3. Data Layer: Loads Tournament Context */}
          <TournamentProvider>
            {/* 4. Routing Layer: Renders Pages */}
            <RouterProvider router={router} />
          </TournamentProvider>
        </SessionProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
}

export default App;

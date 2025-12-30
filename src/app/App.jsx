import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { SessionProvider } from '../auth/useSession';
import { TournamentProvider } from '../tournament/useTournament';
import ErrorBoundary from '../components/common/ErrorBoundary'; 
import { router } from './router';
import '../index.css'; // Ensure Tailwind is here

function App() {
  return (
    <React.StrictMode>
      <ErrorBoundary>
        <SessionProvider>
          <TournamentProvider>
            <RouterProvider router={router} />
          </TournamentProvider>
        </SessionProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
}

export default App;

import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { SessionProvider, useSession } from '../auth/useSession';
import { TournamentProvider } from '../tournament/useTournament';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { router } from './router';
import { Loader2 } from 'lucide-react'; // Ensure lucide-react is installed
import '../index.css';

// 🛑 THE GATEKEEPER COMPONENT
const SessionGate = ({ children }) => {
  const { session } = useSession();

  // If the session logic is still thinking, show the Splash Screen
  if (!session.isReady) {
    return (
      <div className="h-screen w-full bg-[#050505] flex flex-col items-center justify-center space-y-4">
        <div className="relative">
            <div className="w-16 h-16 border-4 border-fuchsia-600/30 border-t-fuchsia-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            </div>
        </div>
        <div className="text-zinc-500 font-mono text-xs uppercase tracking-[0.3em] animate-pulse">
            Establishing Link...
        </div>
      </div>
    );
  }

  return children;
};

function App() {
  return (
    <React.StrictMode>
      <ErrorBoundary>
        <SessionProvider>
          <SessionGate>
             <TournamentProvider>
               <RouterProvider router={router} />
             </TournamentProvider>
          </SessionGate>
        </SessionProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
}

export default App;

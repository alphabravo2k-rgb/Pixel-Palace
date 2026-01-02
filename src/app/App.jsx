import React from 'react';
import { RouterProvider } from 'react-router-dom';
// ✅ IMPORT FROM THE CORRECT FILE (Adjust path if needed)
import { SessionProvider, useSession } from '../auth/useSession';
import { TournamentProvider } from '../tournament/useTournament';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { router } from './router';
import '../index.css';

// 🛑 THE GATEKEEPER
const SessionGate = ({ children }) => {
  const { session } = useSession();

  // Safety check: If session is undefined (provider error), don't crash with 's is not defined'
  if (!session) return null;

  if (!session.isReady) {
    return (
      <div className="h-screen w-full bg-[#050505] flex flex-col items-center justify-center space-y-4">
        <div className="relative">
            <div className="w-16 h-16 border-4 border-fuchsia-600/30 border-t-fuchsia-500 rounded-full animate-spin"></div>
        </div>
        <div className="text-zinc-500 font-mono text-xs uppercase tracking-widest animate-pulse">
            System Boot...
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

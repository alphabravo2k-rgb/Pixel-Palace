import React from 'react';
import { Outlet } from 'react-router-dom';
import ErrorBoundary from '../components/ErrorBoundary';
import { SessionProvider } from '../auth/useSession';
import { TournamentProvider } from '../tournament/useTournament';

/**
 * 1️⃣ App.jsx — ROOT COMPOSITION AUDIT
 * 🔧 Required Fix: Root provides capabilities, not controls.
 *
 * - ❌ Removed <AdminToolbar /> (Now exists only in AdminLayout via router)
 * - ❌ Removed <PinLogin /> (Now exists only at /admin/login)
 * - ✅ Providers only
 * - ✅ Layout shell only
 */
const App = () => {
  return (
    <ErrorBoundary>
      <SessionProvider>
        <TournamentProvider>
          <div className="app-shell min-h-screen bg-black text-white font-sans selection:bg-fuchsia-500/30 selection:text-fuchsia-200">
            {/* The Outlet renders the route content determined by router.jsx 
              (e.g., BracketView, AdminLayout, etc.)
            */}
            <Outlet />
          </div>
        </TournamentProvider>
      </SessionProvider>
    </ErrorBoundary>
  );
};

export default App;

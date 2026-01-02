import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';

// ✅ FIX: Use '@' alias to point to 'src/' root (Defined in vite.config.js)
import { supabase } from '@/supabase/client'; 
import { SessionProvider, useSession } from '@/auth/useSession';
import { TournamentProvider } from '@/tournament/useTournament';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { router } from '@/router';

// ✅ CSS Import (Adjusted for alias)
import '@/index.css';

// 🎨 THEME MANAGER: Connects UI to Database
const ThemeManager = () => {
  useEffect(() => {
    const fetchTheme = async () => {
      try {
        // Fetch active tournament color settings
        const { data } = await supabase
          .from('tournaments')
          .select('theme_color')
          .eq('is_active', true)
          .single();

        if (data?.theme_color) {
          const root = document.documentElement;
          const hex = data.theme_color.replace('#', '');
          
          // Parse Hex to RGB
          const r = parseInt(hex.substring(0, 2), 16);
          const g = parseInt(hex.substring(2, 4), 16);
          const b = parseInt(hex.substring(4, 6), 16);
          const rgbString = `${r} ${g} ${b}`;

          // Inject into CSS Variables
          root.style.setProperty('--color-brand', rgbString);
          root.style.setProperty('--color-brand-dim', rgbString); 
          root.style.setProperty('--color-brand-glow', rgbString);
        }
      } catch (e) {
        // Silent fail - keep default theme
      }
    };

    fetchTheme();
  }, []);

  return null; 
};

// 🛑 THE GATEKEEPER
const SessionGate = ({ children }) => {
  const { session } = useSession();

  if (!session) return null;

  if (!session.isReady) {
    return (
      <div className="h-screen w-full bg-[#050505] flex flex-col items-center justify-center space-y-4">
        <div className="relative">
           <div className="w-16 h-16 border-4 border-brand/30 border-t-brand rounded-full animate-spin"></div>
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
        <ThemeManager />
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

import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';

// ✅ FIX 1: Use absolute alias for Supabase
import { supabase } from '@/supabase/client'; 

// ✅ FIX 2: Use ABSOLUTE alias for Router (Guaranteed to find src/router.jsx)
import { router } from '@/router'; 

// ✅ FIX 3: Use absolute alias for Auth/Tournament context
import { SessionProvider, useSession } from '@/auth/useSession';
import { TournamentProvider } from '@/tournament/useTournament';
import ErrorBoundary from '@/components/common/ErrorBoundary';

// ✅ CSS Import
import '@/index.css';

// 🎨 THEME MANAGER (Platinum Edition)
const ThemeManager = () => {
  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const { data } = await supabase
          .from('tournaments')
          .select('theme_color, theme_color_dim, theme_color_glow') // Fetch all variants
          .eq('is_active', true)
          .single();

        if (data?.theme_color) {
          const root = document.documentElement;
          
          // Helper: Hex -> RGB (e.g. "255 0 0")
          const toRGB = (hex) => {
             const cleanHex = hex.replace('#', '');
             const r = parseInt(cleanHex.substring(0, 2), 16);
             const g = parseInt(cleanHex.substring(2, 4), 16);
             const b = parseInt(cleanHex.substring(4, 6), 16);
             return `${r} ${g} ${b}`;
          };

          // 💉 Inject All 3 Layers
          root.style.setProperty('--color-brand', toRGB(data.theme_color));
          root.style.setProperty('--color-brand-dim', data.theme_color_dim ? toRGB(data.theme_color_dim) : toRGB(data.theme_color));
          root.style.setProperty('--color-brand-glow', data.theme_color_glow ? toRGB(data.theme_color_glow) : toRGB(data.theme_color));
        }
      } catch (e) {
        // Silent fail
      }
    };
    fetchTheme();
  }, []);
  return null; 
};

// 🛑 THE GATEKEEPER (Fixed Logic)
const SessionGate = ({ children }) => {
  const { isReady } = useSession(); 

  // ✅ Show Spinner ONLY while checking auth status
  if (!isReady) {
    return (
      <div className="h-screen w-full bg-[#050505] flex flex-col items-center justify-center space-y-4">
        <div className="relative">
           {/* Dynamic Brand Color Spinner */}
           <div className="w-16 h-16 border-4 border-brand/30 border-t-brand rounded-full animate-spin"></div>
        </div>
        <div className="text-zinc-500 font-mono text-xs uppercase tracking-widest animate-pulse">
           System Boot...
        </div>
      </div>
    );
  }

  // ✅ Render App (Router will handle Public vs Private pages)
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

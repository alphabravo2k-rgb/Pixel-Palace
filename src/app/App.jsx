import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';

// ✅ RELATIVE import for Router (Same folder)
import { router } from './router'; 

// ✅ ABSOLUTE aliases for everything else
import { supabase } from '@/supabase/client'; 
import { SessionProvider, useSession } from '@/auth/useSession';
import { TournamentProvider } from '@/tournament/useTournament';
import ErrorBoundary from '@/components/common/ErrorBoundary';

// ✅ CSS Import
import '@/index.css';

// 🎨 THEME MANAGER (Platinum Edition)
// - Handles "No Active Tournament" gracefully
// - Injects DB colors into CSS variables
const ThemeManager = () => {
  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const { data, error } = await supabase
          .from('tournaments')
          .select('theme_color, theme_color_dim, theme_color_glow') 
          .eq('is_active', true)
          // 🚀 CRITICAL FIX: Use .maybeSingle() instead of .single()
          // .single() crashes if 0 rows are found. 
          // .maybeSingle() returns null safely (falls back to default purple).
          .maybeSingle(); 

        if (data?.theme_color) {
          const root = document.documentElement;
          
          // Helper: Hex -> RGB
          const toRGB = (hex) => {
             if (!hex) return '192 38 211'; // Fallback Purple
             const cleanHex = hex.replace('#', '');
             const r = parseInt(cleanHex.substring(0, 2), 16);
             const g = parseInt(cleanHex.substring(2, 4), 16);
             const b = parseInt(cleanHex.substring(4, 6), 16);
             return `${r} ${g} ${b}`;
          };

          // 💉 Inject All 3 Layers
          console.log(`🎨 Theme Loaded: ${data.theme_color}`);
          root.style.setProperty('--color-brand', toRGB(data.theme_color));
          root.style.setProperty('--color-brand-dim', data.theme_color_dim ? toRGB(data.theme_color_dim) : toRGB(data.theme_color));
          root.style.setProperty('--color-brand-glow', data.theme_color_glow ? toRGB(data.theme_color_glow) : toRGB(data.theme_color));
        } else {
          console.log("🎨 No active tournament theme found. Using Default Protocol.");
        }
      } catch (e) {
        console.warn("Theme Sync Warning:", e);
      }
    };
    fetchTheme();
  }, []);
  return null; 
};

// 🛑 THE GATEKEEPER
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

import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';

// ✅ SAFE IMPORTS
import { SessionProvider, useSession } from '../auth/useSession';
import { TournamentProvider } from '../tournament/useTournament';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { supabase } from '../supabase/client'; 
import { router } from './router';

// ✅ CSS Import (Ensure this exists in your project root)
import '../index.css';

// 🎨 THEME MANAGER (Dynamic Brand Colors)
const ThemeManager = () => {
  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const { data } = await supabase
          .from('tournaments')
          .select('theme_color, theme_color_dim, theme_color_glow') 
          .eq('is_active', true)
          .maybeSingle(); 

        if (data?.theme_color) {
          const root = document.documentElement;
          
          // Helper: Convert HEX to RGB "r g b" string for Tailwind opacity support
          const toRGB = (hex) => {
             if (!hex) return '192 38 211'; // Default Fuchsia
             const cleanHex = hex.replace('#', '');
             const r = parseInt(cleanHex.substring(0, 2), 16);
             const g = parseInt(cleanHex.substring(2, 4), 16);
             const b = parseInt(cleanHex.substring(4, 6), 16);
             return `${r} ${g} ${b}`;
          };

          console.log(`🎨 Theme Loaded: ${data.theme_color}`);
          root.style.setProperty('--color-brand', toRGB(data.theme_color));
          root.style.setProperty('--color-brand-dim', data.theme_color_dim ? toRGB(data.theme_color_dim) : toRGB(data.theme_color));
          root.style.setProperty('--color-brand-glow', data.theme_color_glow ? toRGB(data.theme_color_glow) : toRGB(data.theme_color));
        }
      } catch (e) {
        console.warn("Theme Sync Warning:", e);
      }
    };
    fetchTheme();
  }, []);
  return null; 
};

// 🛑 THE GATEKEEPER (Prevents Auth Flicker)
const SessionGate = ({ children }) => {
  const { session } = useSession(); 

  // If the provider hasn't initialized the object, wait.
  if (!session) return null;

  // If the session logic is still running checks, show boot screen.
  if (!session.isReady) {
    return (
      <div className="h-screen w-full bg-[#050505] flex flex-col items-center justify-center space-y-4">
        <div className="relative">
           <div className="w-16 h-16 border-4 border-zinc-800 border-t-fuchsia-600 rounded-full animate-spin"></div>
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
  );
}

export default App;

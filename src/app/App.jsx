import React, { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router-dom';

// ✅ CORE MODULES
import { SessionProvider, useSession } from '../auth/useSession';
import { TournamentProvider } from '../tournament/useTournament';
import { supabase } from '../supabase/client';
import { router } from './router';

/**
 * 🎨 THEME ENGINE: HARDWARE ACCELERATED
 * -------------------------------------
 * Fetches the active tournament's branding and injects it directly 
 * into the CSS Root Variables.
 */
const ThemeManager = () => {
  useEffect(() => {
    const syncTheme = async () => {
      try {
        const { data } = await supabase
          .from('tournaments')
          .select('theme_color, theme_color_dim, theme_color_glow')
          .eq('is_active', true)
          .maybeSingle();

        if (data?.theme_color) {
          const root = document.documentElement;

          // Helper: Hex to Space-Separated RGB (for Tailwind Opacity)
          const toRGB = (hex) => {
            if (!hex) return '192 38 211'; // Default Fuchsia
            const cleanHex = hex.replace('#', '');
            const r = parseInt(cleanHex.substring(0, 2), 16);
            const g = parseInt(cleanHex.substring(2, 4), 16);
            const b = parseInt(cleanHex.substring(4, 6), 16);
            return `${r} ${g} ${b}`;
          };

          // 💉 INJECTION: Must match tailwind.config.js exactly!
          root.style.setProperty('--color-brand', toRGB(data.theme_color));
          root.style.setProperty('--color-brand-dim', data.theme_color_dim ? toRGB(data.theme_color_dim) : toRGB(data.theme_color));
          root.style.setProperty('--color-brand-glow', data.theme_color_glow ? toRGB(data.theme_color_glow) : toRGB(data.theme_color));
          
          console.log(`%c 🎨 THEME SYNC: [${data.theme_color}]`, "color: #10b981; font-weight: bold;");
        }
      } catch (e) {
        console.warn("⚠️ Theme Sync Warning:", e);
      }
    };

    syncTheme();
  }, []);

  return null; // Invisible Component
};

/**
 * 🛑 SYSTEM GATE: THE BOOT SEQUENCE
 * ---------------------------------
 * Prevents the app from flashing "Login" screens while checking 
 * if the user is actually logged in.
 */
const SystemGate = ({ children }) => {
  const { session, isLoading } = useSession();
  const [minLoadTimePassed, setMinLoadTimePassed] = useState(false);

  // 🧠 UX TRICK: Force the loader to show for at least 800ms 
  // This prevents a "flash" of the loader that looks like a glitch.
  useEffect(() => {
    const timer = setTimeout(() => setMinLoadTimePassed(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const isBooting = isLoading || !minLoadTimePassed;

  if (isBooting) {
    return (
      <div className="h-screen w-full bg-[#050505] flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background Atmosphere */}
        <div className="absolute inset-0 scanlines opacity-10 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center">
          {/* Spinner */}
          <div className="w-16 h-16 border-2 border-brand/20 border-t-brand rounded-full animate-spin shadow-[0_0_30px_rgba(var(--color-brand),0.3)]" />
          
          {/* Text */}
          <div className="mt-8 flex flex-col items-center gap-2">
            <span className="text-white font-display font-bold text-2xl tracking-widest uppercase">
              Pixel Palace
            </span>
            <div className="flex items-center gap-3">
               <div className="h-[1px] w-8 bg-zinc-800" />
               <span className="text-brand-glow font-mono text-[10px] uppercase tracking-[0.3em] animate-pulse">
                 Establishing Uplink...
               </span>
               <div className="h-[1px] w-8 bg-zinc-800" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

/**
 * 🏛️ APP CORE
 */
function App() {
  return (
    <>
      <ThemeManager />
      <SessionProvider>
        <SystemGate>
          <TournamentProvider>
             {/* 🗺️ THE MAP */}
             <RouterProvider router={router} />
          </TournamentProvider>
        </SystemGate>
      </SessionProvider>
    </>
  );
}

export default App;

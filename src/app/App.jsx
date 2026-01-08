import React, { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Wifi, WifiOff } from 'lucide-react';

// ✅ CORE MODULES (LEGACY & NEXUS)
import { SessionProvider, useSession } from '../auth/useSession';
import { TournamentProvider } from '../tournament/useTournament';
import { supabase } from '../supabase/client';
import { router } from './router';

// 🚀 NEW NEXUS MODULES
import { useNexusStore } from '../store/useNexusStore';
import { SoundNexus, CUES } from '../lib/soundNexus';
import { GlobalChatNexus } from '../components/communication/GlobalChatNexus';

/**
 * ⚡ PIXEL PALACE: CORE ROOT (MASTER HYBRID V4.5)
 * -----------------------------------------------
 * STATUS: MASTERED (BURJ KHALIFA STANDARD)
 * * ARCHITECTURE:
 * 1. HYBRID STATE: Runs Legacy Context + New Zustand Store in parallel.
 * 2. SENSORY ENGINE: Unlocks 8D Audio on first user interaction.
 * 3. GLOBAL OVERLAYS: Chat and Notifications persist across routes.
 */

// 📡 1. NETWORK MONITOR (PRESERVED)
const NetworkMonitor = () => {
  useEffect(() => {
    const handleOnline = () => {
      toast.success("UPLINK ESTABLISHED", {
        id: 'network-status',
        icon: <Wifi size={16} className="text-emerald-500" />,
        style: { border: '1px solid #10b981', color: '#10b981' }
      });
      useNexusStore.getState().setConnectionStatus('connected');
    };

    const handleOffline = () => {
      toast.error("CONNECTION LOST", {
        id: 'network-status',
        icon: <WifiOff size={16} className="text-red-500" />,
        duration: Infinity,
        style: { border: '1px solid #ef4444', color: '#ef4444' }
      });
      useNexusStore.getState().setConnectionStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return null;
};

// 🎨 2. THEME ENGINE (PRESERVED)
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
          const toRGB = (hex) => {
            if (!hex) return '192 38 211';
            const cleanHex = hex.replace('#', '');
            const r = parseInt(cleanHex.substring(0, 2), 16);
            const g = parseInt(cleanHex.substring(2, 4), 16);
            const b = parseInt(cleanHex.substring(4, 6), 16);
            return `${r} ${g} ${b}`;
          };

          root.style.setProperty('--color-brand', toRGB(data.theme_color));
          root.style.setProperty('--color-brand-dim', data.theme_color_dim ? toRGB(data.theme_color_dim) : toRGB(data.theme_color));
          root.style.setProperty('--color-brand-glow', data.theme_color_glow ? toRGB(data.theme_color_glow) : toRGB(data.theme_color));
        }
      } catch (e) {
        // Silent fail
      }
    };
    syncTheme();
  }, []);
  return null;
};

// 🛑 3. SYSTEM GATE (BOOT SEQUENCE)
const SystemGate = ({ children }) => {
  const { isLoading } = useSession(); // Legacy Check
  const { isHydrated, syncNexus } = useNexusStore(); // New Check
  const [minLoadTimePassed, setMinLoadTimePassed] = useState(false);

  useEffect(() => {
    // Sync New Store
    syncNexus();
    
    // Audio Unlocker
    const unlockAudio = () => {
      SoundNexus.init();
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
    window.addEventListener('click', unlockAudio);
    window.addEventListener('keydown', unlockAudio);

    // Min Load Time
    const timer = setTimeout(() => setMinLoadTimePassed(true), 800);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  const isBooting = isLoading || !minLoadTimePassed || !isHydrated;

  if (isBooting) {
    return (
      <div className="h-screen w-full bg-[#050505] flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 scanlines opacity-10 pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 border-2 border-brand/20 border-t-brand rounded-full animate-spin shadow-[0_0_30px_rgba(var(--color-brand),0.3)]" />
          <div className="mt-8 flex flex-col items-center gap-2">
            <span className="text-white font-display font-bold text-2xl tracking-widest uppercase">Pixel Palace</span>
            <div className="flex items-center gap-3">
               <div className="h-[1px] w-8 bg-zinc-800" />
               <span className="text-brand-glow font-mono text-[10px] uppercase tracking-[0.3em] animate-pulse">Initializing Nexus...</span>
               <div className="h-[1px] w-8 bg-zinc-800" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

// 🏛️ 4. APP CORE
function App() {
  const { is3DEnabled } = useNexusStore();

  return (
    <>
      <ThemeManager />
      <NetworkMonitor />
      
      {/* 📡 GLOBAL ATMOSPHERE (Noise Overlay) */}
      {!is3DEnabled && (
         <div className="fixed inset-0 pointer-events-none z-[0] opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      )}

      {/* 🧩 PROVIDER STACK */}
      <SessionProvider>
        <SystemGate>
          <TournamentProvider>
             
             {/* 🗺️ THE MAP */}
             <RouterProvider router={router} />

             {/* 💬 GLOBAL COMMS (Persistent Overlay) */}
             <GlobalChatNexus />

          </TournamentProvider>
        </SystemGate>
      </SessionProvider>
    </>
  );
}

export default App;

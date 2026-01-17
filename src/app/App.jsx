/**
 * ⚡ PIXEL PALACE: CORE ROOT (MASTER OMNI V5.0)
 * VERSION: 2050.5.0 (MASTER OMNI)
 * STATUS: OPERATIONAL // SYSTEM_READY
 */

import React, { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { Wifi, WifiOff, Activity, Cpu } from 'lucide-react';

// MASTER CORE
import { SessionProvider } from '../auth/useSession';
import { TournamentProvider } from '../tournament/useTournament';
import { supabase } from '../supabase/client';
import { router } from './router';

// NEW NEXUS MODULES
import { useNexusStore } from '../store/useNexusStore';
import { SoundNexus, CUES } from '../lib/soundNexus';
import { Telemetry, EVENTS } from '../lib/telemetry';
import { GlobalChatNexus } from '../components/communication/GlobalChatNexus';

// 📡 1. NETWORK MONITOR: SIGNAL INTEGRITY
const NetworkMonitor = () => {
  useEffect(() => {
    const handleOnline = () => {
      Telemetry.log(EVENTS.SYSTEM, { action: 'SIGNAL_RESTORED' });
      toast.success("UPLINK RESTABLISHED", {
        id: 'signal-node',
        icon: <Wifi size={14} className="text-emerald-500" />,
        style: { background: '#09090b', color: '#10b981', border: '1px solid #10b98120', fontSize: '10px', letterSpacing: '0.2em' }
      });
      useNexusStore.getState().setConnectionStatus('connected');
    };

    const handleOffline = () => {
      Telemetry.log(EVENTS.SYSTEM, { action: 'SIGNAL_LOSS' });
      toast.error("SIGNAL INTERRUPTED", {
        id: 'signal-node',
        icon: <WifiOff size={14} className="text-red-500" />,
        duration: Infinity,
        style: { background: '#09090b', color: '#ef4444', border: '1px solid #ef444420', fontSize: '10px', letterSpacing: '0.2em' }
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

// 🎨 2. THEME ENGINE: DYNAMIC DNA SYNC
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
            if (!hex) return '192 38 211'; // Default Fuchsia
            const cleanHex = hex.replace('#', '');
            const r = parseInt(cleanHex.substring(0, 2), 16);
            const g = parseInt(cleanHex.substring(2, 4), 16);
            const b = parseInt(cleanHex.substring(4, 6), 16);
            return `${r} ${g} ${b}`;
          };

          root.style.setProperty('--color-brand', toRGB(data.theme_color));
          root.style.setProperty('--color-brand-dim', toRGB(data.theme_color_dim || data.theme_color));
          root.style.setProperty('--color-brand-glow', toRGB(data.theme_color_glow || data.theme_color));
        }
      } catch (e) {
        console.error("Theme DNA Sync Failure");
      }
    };
    syncTheme();
  }, []);
  return null;
};

// 🛑 3. SYSTEM GATE: NEURAL LINK CALIBRATION
const SystemGate = ({ children }) => {
  const { isHydrated, syncNexus } = useNexusStore();
  const [bootSequenceComplete, setBootSequenceComplete] = useState(false);

  useEffect(() => {
    // Stage 1: Store Calibration
    syncNexus();
    
    // Stage 2: 8D Audio Unlock Protocol
    const unlockAudio = () => {
      SoundNexus.init();
      Telemetry.log(EVENTS.SYSTEM, { action: 'AUDIO_CORE_UNLOCKED' });
      window.removeEventListener('mousedown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
    window.addEventListener('mousedown', unlockAudio);
    window.addEventListener('keydown', unlockAudio);

    // Stage 3: Min-Load Cinematic Delay
    const timer = setTimeout(() => {
        setBootSequenceComplete(true);
        Telemetry.log(EVENTS.SYSTEM, { action: 'CORE_BOOT_COMPLETE' });
    }, 1200);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousedown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, [syncNexus]);

  if (!isHydrated || !bootSequenceComplete) {
    return (
      <div className="h-screen w-full bg-[#020202] flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 scanlines opacity-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-24 h-24 bg-zinc-900 border-2 border-brand/20 border-t-brand rounded-sm animate-spin shadow-[0_0_50px_rgba(var(--color-brand),0.2)]" />
          <div className="mt-12 flex flex-col items-center gap-4">
            <h1 className="text-white font-display font-black text-4xl italic tracking-tighter uppercase leading-none">
                Pixel <span className="text-brand">Palace</span>
            </h1>
            <div className="flex items-center gap-5">
               <div className="h-[1px] w-12 bg-zinc-800" />
               <p className="text-zinc-600 font-mono text-[9px] uppercase tracking-[0.6em] animate-pulse">
                 Establishing_Neural_Link...
               </p>
               <div className="h-[1px] w-12 bg-zinc-800" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

// 🏛️ 4. APP ASSEMBLY: GLOBAL INITIALIZATION
function App() {
  const { is3DEnabled } = useNexusStore();

  return (
    <>
      <ThemeManager />
      <NetworkMonitor />
      
      {/* 📡 GLOBAL ATMOSPHERIC OVERLAY */}
      {!is3DEnabled && (
         <div className="fixed inset-0 pointer-events-none z-[0] opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      )}

      {/* 🧱 PROVIDER CONTEXT ARCHITECTURE */}
      <SessionProvider>
        <SystemGate>
          <TournamentProvider>
              
             {/* 🗺️ THE MASTER NAVIGATION HUB */}
             <RouterProvider router={router} />

             {/* 💬 GLOBAL TRANSCEIVER */}
             <GlobalChatNexus />

          </TournamentProvider>
        </SystemGate>
      </SessionProvider>
    </>
  );
}

export default App;

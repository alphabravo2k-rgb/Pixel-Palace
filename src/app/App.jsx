/**
 * ⚡ PIXEL PALACE: CORE ROOT (MASTER OMNI V5.0)
 * VERSION: 2050.5.0 (MASTER OMNI)
 * STATUS: OPERATIONAL // SYSTEM_READY
 * -----------------------------------------
 * The central assembly point for all Sovereign subsystems.
 * Integrates 8D Audio, Telemetry, and Dynamic CSS DNA.
 */

import React, { useEffect, useState, Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { Wifi, WifiOff, Cpu, Activity, Zap } from 'lucide-react';

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

// 📡 1. SIGNAL INTEGRITY MONITOR
const NetworkMonitor = () => {
  useEffect(() => {
    const handleOnline = () => {
      Telemetry.log(EVENTS.SYSTEM, { action: 'SIGNAL_RESTORED' });
      toast.success("UPLINK ESTABLISHED", {
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

// 🎨 2. DNA THEME ENGINE (Dynamic Branding)
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
        console.error("Theme DNA Sync Failure - Defaulting to Sovereign Palette");
      }
    };
    syncTheme();
  }, []);
  return null;
};

// 🛑 3. SYSTEM GATE: NEURAL LINK HANDSHAKE
const SystemGate = ({ children }) => {
  const { isHydrated, syncNexus, graphicsTier } = useNexusStore();
  const [bootSequenceComplete, setBootSequenceComplete] = useState(false);

  useEffect(() => {
    // Phase 1: Store Calibration
    syncNexus();
    
    // Phase 2: Audio/Sensory Permission Unlock
    const unlockSensory = () => {
      SoundNexus.init();
      Telemetry.log(EVENTS.SYSTEM, { action: 'AUDIO_CORE_UNLOCKED' });
      window.removeEventListener('mousedown', unlockSensory);
      window.removeEventListener('keydown', unlockSensory);
    };
    window.addEventListener('mousedown', unlockSensory);
    window.addEventListener('keydown', unlockSensory);

    // Phase 3: Hardware Diagnostics & Min-Load cinematic
    const timer = setTimeout(() => {
        setBootSequenceComplete(true);
        Telemetry.log(EVENTS.SYSTEM, { action: 'CORE_BOOT_COMPLETE', tier: graphicsTier });
    }, 1500);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousedown', unlockSensory);
      window.removeEventListener('keydown', unlockSensory);
    };
  }, [syncNexus, graphicsTier]);

  if (!isHydrated || !bootSequenceComplete) {
    return (
      <div className="h-screen w-full bg-[#020202] flex flex-col items-center justify-center relative overflow-hidden font-sans">
        <div className="absolute inset-0 scanlines opacity-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center">
          {/* Mechanical Spinner */}
          <div className="w-24 h-24 bg-zinc-900 border-2 border-brand/20 border-t-brand rounded-sm animate-spin shadow-[0_0_60px_rgba(var(--color-brand),0.2)]" />
          
          <div className="mt-16 flex flex-col items-center gap-6">
            <h1 className="text-white font-display font-black text-5xl italic tracking-tighter uppercase leading-none">
                Pixel <span className="text-brand">Palace</span>
            </h1>
            <div className="flex flex-col items-center gap-3">
               <div className="flex items-center gap-5">
                  <div className="h-[1px] w-12 bg-zinc-800" />
                  <p className="text-zinc-600 font-mono text-[9px] uppercase tracking-[0.8em] animate-pulse">
                     Synchronizing_Nexus_Omni
                  </p>
                  <div className="h-[1px] w-12 bg-zinc-800" />
               </div>
               <div className="flex items-center gap-4 text-zinc-800 mt-2">
                  <Cpu size={12} />
                  <span className="text-[8px] font-mono tracking-widest uppercase">Tier: {graphicsTier?.toUpperCase() || 'STD'}</span>
                  <div className="w-1 h-1 bg-zinc-900 rounded-full" />
                  <Activity size={12} />
                  <span className="text-[8px] font-mono tracking-widest uppercase">Signal: High_Fi</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

// 🏛️ 4. THE CORE ASSEMBLY
function App() {
  const { is3DEnabled } = useNexusStore();

  return (
    <>
      {/* Background Orchestration */}
      <ThemeManager />
      <NetworkMonitor />
      
      {/* 📡 GLOBAL ATMOSPHERIC NOISE (Fallback for 2D Mode) */}
      {!is3DEnabled && (
         <div className="fixed inset-0 pointer-events-none z-[0] opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      )}

      {/* 🧩 THE SOVEREIGN PROVIDER STACK */}
      <SessionProvider>
        <SystemGate>
          <TournamentProvider>
              
             {/* 🗺️ MASTER NAVIGATION (Protected by Security Gates) */}
             <RouterProvider router={router} />

             {/* 💬 PERSISTENT GLOBAL TRANSCEIVER */}
             <GlobalChatNexus />

          </TournamentProvider>
        </SystemGate>
      </SessionProvider>
    </>
  );
}

export default App;

/**
 * 🚀 PIXEL PALACE: NEXUS IGNITION KERNEL
 * VERSION: 2050.1.0 (MASTER OMNI)
 * STATUS: SECURED // ALL SYSTEMS GO
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import { ErrorBoundary } from 'react-error-boundary';
import { registerSW } from 'virtual:pwa-register';

// ✅ CORE INTEGRATION
import App from './app/App';
// Note: Ensure './lib/soundNexus' exists or comment this out until created. 
// It is part of the 8D audio upgrade plan.
// import { SoundNexus } from './lib/soundNexus'; 
import './index.css';

// 📱 PWA: INDUSTRIAL AUTO-UPDATE PROTOCOL
const updateSW = registerSW({
  onNeedRefresh() {
    // In the future, this can trigger a custom toast for "System Update Ready"
    console.info('[NEXUS] Kernel update synchronized. Refresh required.');
  },
  onOfflineReady() {
    console.warn('[NEXUS] Network link severed. Running on local cached buffer.');
  },
});

/**
 * 🛑 TACTICAL DIAGNOSTICS (Fall-back UI)
 * Rendered only during a catastrophic react tree collapse.
 */
const GlobalErrorFallback = ({ error, resetErrorBoundary }) => (
  <div className="flex flex-col items-center justify-center h-screen bg-[#020202] text-red-500 font-mono p-6 overflow-hidden relative">
    {/* Noise Texture Overlay */}
    <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    
    <div className="z-10 border border-red-900/40 bg-zinc-950 p-8 rounded-sm max-w-2xl w-full shadow-2xl relative">
      {/* Scanline Animation */}
      <div className="absolute top-0 left-0 w-full h-0.5 bg-red-600 animate-scanline" />
      
      <div className="flex items-center gap-3 mb-6">
        <div className="w-2 h-2 bg-red-500 animate-flicker rounded-full shadow-[0_0_10px_#ef4444]" />
        <h1 className="text-lg font-black tracking-[0.4em] uppercase text-white">Kernel Panic</h1>
      </div>

      <div className="space-y-4 bg-black/50 p-6 border border-white/5 rounded-sm">
        <p className="text-[10px] text-zinc-600 uppercase font-black tracking-widest">Stack Trace Traceback:</p>
        <pre className="text-[11px] text-red-400 overflow-auto max-h-40 leading-relaxed scrollbar-thin scrollbar-thumb-red-900 whitespace-pre-wrap break-all">
          {error.message}
          {error.stack}
        </pre>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4">
        <button 
          onClick={() => window.location.reload()}
          className="bg-red-600 hover:bg-red-500 text-white py-4 font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 border border-transparent"
        >
          Cold Reboot
        </button>
        <button 
          onClick={() => window.location.href = '/'}
          className="border border-zinc-800 hover:border-white text-zinc-500 hover:text-white py-4 font-black text-[10px] uppercase tracking-widest transition-all"
        >
          Return to Hub
        </button>
      </div>
    </div>
    
    <div className="mt-8 text-[9px] text-zinc-800 font-mono tracking-widest">
      ERR_CODE: KERNEL_PANIC_0x99 // SYSTEM HALTED
    </div>
  </div>
);

// 🎬 SYSTEM RENDER
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary 
      FallbackComponent={GlobalErrorFallback}
      onReset={() => window.location.reload()}
    >
      <HelmetProvider>
        
        {/* 🔔 OMNI-NOTIFICATIONS: Styled for the OLED aesthetic */}
        <Toaster 
          position="bottom-right"
          toastOptions={{
            duration: 5000,
            style: {
              background: '#09090b',
              color: '#ffffff',
              border: '1px solid #18181b',
              borderRadius: '2px',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            },
            success: {
              style: { borderLeft: '3px solid #10b981' },
              iconTheme: { primary: '#10b981', secondary: '#09090b' }
            },
            error: {
              style: { borderLeft: '3px solid #ef4444' },
              iconTheme: { primary: '#ef4444', secondary: '#09090b' }
            },
            loading: {
              style: { borderLeft: '3px solid #c026d3' },
              iconTheme: { primary: '#c026d3', secondary: '#09090b' }
            }
          }}
        />

        {/* 🛰️ APPLICATION LOAD */}
        <App />
        
      </HelmetProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

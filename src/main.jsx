import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import { ErrorBoundary } from 'react-error-boundary';
import { registerSW } from 'virtual:pwa-register';

// ✅ CORE APPLICATION
import App from './app/App';
import './index.css';

/**
 * 🚀 PIXEL PALACE: SYSTEM IGNITION
 * -------------------------------
 * STATUS: MASTERED (BURJ KHALIFA STANDARD)
 * * PURPOSE:
 * 1. PWA REGISTRATION: Service Worker auto-updates for "App-like" feel.
 * 2. ERROR TRAPPING: "Red Screen of Death" converted to Tactical Diagnostics.
 * 3. GLOBAL CONTEXT: Injects SEO, Audio permissions, and Notification layers.
 */

// 📱 PWA: Auto-update the app when a new version is deployed
const updateSW = registerSW({
  onNeedRefresh() {
    console.log('[NEXUS] 🔄 Update Available. Refreshing Cache...');
  },
  onOfflineReady() {
    console.log('[NEXUS] 📶 Connection Lost. Running in Offline Combat Mode.');
  },
});

// 🛑 FALLBACK UI: TACTICAL TERMINAL
// Displayed if the React Tree shatters.
function GlobalErrorFallback({ error }) {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#020202] text-red-500 font-mono p-6 overflow-hidden relative selection:bg-red-900/30">
      {/* Background Noise */}
      <div className="absolute inset-0 opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
      <div className="z-10 border border-red-900/50 bg-[#09090b] p-8 rounded-sm max-w-2xl w-full shadow-[0_0_100px_rgba(220,38,38,0.15)] relative overflow-hidden">
        {/* Scanline Effect */}
        <div className="absolute top-0 left-0 w-full h-1 bg-red-600/50 animate-scanline" />
        
        <div className="flex items-center gap-4 mb-6 border-b border-red-900/30 pb-4">
          <div className="w-3 h-3 bg-red-600 animate-pulse rounded-full box-shadow-neon" />
          <h1 className="text-xl font-black tracking-[0.3em] uppercase text-white">
            System Failure
          </h1>
        </div>

        <div className="space-y-4">
          <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">
            Diagnostics Report:
          </p>
          <pre className="bg-black p-4 rounded-sm text-[11px] overflow-auto text-red-400 border-l-2 border-red-600 font-mono leading-relaxed max-h-60 custom-scrollbar">
            {error.message}
            {'\n'}
            <span className="opacity-50 mt-2 block">--- STACK TRACE TERMINATED ---</span>
          </pre>
        </div>

        <div className="mt-8 flex gap-4">
          <button 
            onClick={() => window.location.reload()}
            className="flex-1 bg-red-600 hover:bg-red-500 text-white py-3 px-6 rounded-sm text-[10px] uppercase tracking-[0.2em] font-black transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_30px_rgba(220,38,38,0.6)] active:scale-95"
          >
            Initiate Reboot
          </button>
          <button 
            onClick={() => window.location.href = '/'}
            className="flex-1 bg-transparent border border-zinc-700 hover:border-white text-zinc-400 hover:text-white py-3 px-6 rounded-sm text-[10px] uppercase tracking-[0.2em] font-black transition-all"
          >
            Emergency Exit
          </button>
        </div>
      </div>
      
      <div className="mt-8 text-[9px] text-zinc-800 font-mono tracking-widest">
        ERR_CODE: KERNEL_PANIC_0x99
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 🛡️ SAFETY NET */}
    <ErrorBoundary FallbackComponent={GlobalErrorFallback}>
      
      {/* 🧠 SEO & META CONTEXT */}
      <HelmetProvider>
        
        {/* 🔔 TACTICAL NOTIFICATIONS (Styled for OLED Black) */}
        <Toaster 
          position="bottom-right"
          reverseOrder={false}
          gutter={8}
          toastOptions={{
            duration: 5000,
            className: '!bg-[#09090b] !text-white !border !border-[#27272a] !rounded-sm !font-mono !text-xs !uppercase !tracking-widest !shadow-2xl !backdrop-blur-xl',
            style: {
              background: 'rgba(9, 9, 11, 0.95)',
              color: '#fafafa',
              border: '1px solid rgba(39, 39, 42, 1)',
              borderRadius: '2px',
              padding: '16px',
              boxShadow: '0 0 40px -10px rgba(0,0,0,0.8)',
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: '#09090b' },
              style: { borderLeft: '3px solid #10b981' }
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#09090b' },
              style: { borderLeft: '3px solid #ef4444' }
            },
            loading: {
              iconTheme: { primary: '#c026d3', secondary: '#09090b' },
              style: { borderLeft: '3px solid #c026d3' }
            }
          }} 
        />

        {/* ⚡ THE CORE */}
        <App />
        
      </HelmetProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

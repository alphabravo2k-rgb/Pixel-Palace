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
 * STATUS: MASTERED (DUBAI STANDARD)
 * * PURPOSE:
 * 1. PWA REGISTRATION: Enables offline mode and "Install App" prompt.
 * 2. ERROR TRAPPING: Catches fatal crashes prevents white-screen-of-death.
 * 3. GLOBAL CONTEXT: Injects SEO and Notification layers.
 */

// 📱 PWA: Auto-update the app when a new version is deployed
const updateSW = registerSW({
  onNeedRefresh() {
    console.log('🔄 System Update Available. Refreshing Cache...');
  },
  onOfflineReady() {
    console.log('📶 Nexus Link: Offline Mode Active.');
  },
});

// 🛑 FALLBACK UI: Displayed if the app crashes completely
// Styled to look like a "Critical System Failure" terminal
function GlobalErrorFallback({ error }) {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#050505] text-red-500 font-mono p-6">
      <div className="border border-red-900/50 bg-red-950/10 p-8 rounded max-w-lg w-full shadow-[0_0_50px_rgba(220,38,38,0.2)]">
        <h1 className="text-3xl font-black mb-4 tracking-widest uppercase flex items-center gap-3">
          <span className="animate-pulse">⚠️</span> System Failure
        </h1>
        <p className="text-zinc-500 mb-6 text-xs uppercase tracking-widest border-b border-red-900/30 pb-4">
          Critical Runtime Exception Detected
        </p>
        <pre className="bg-black/80 p-4 rounded text-[10px] overflow-auto mb-8 text-red-400 border border-red-900/30 font-mono leading-relaxed max-h-40 custom-scrollbar">
          {error.message}
        </pre>
        <button 
          onClick={() => window.location.reload()}
          className="w-full bg-red-600 hover:bg-red-500 text-white px-6 py-4 rounded-sm text-xs uppercase tracking-[0.2em] font-bold transition-all shadow-lg hover:shadow-red-500/20 active:scale-95"
        >
          Reboot System
        </button>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 🛡️ SAFETY NET */}
    <ErrorBoundary FallbackComponent={GlobalErrorFallback}>
      
      {/* 🧠 SEO CONTEXT */}
      <HelmetProvider>
        
        {/* 🔔 TACTICAL NOTIFICATIONS */}
        <Toaster 
          position="bottom-right"
          reverseOrder={false}
          gutter={8}
          toastOptions={{
            duration: 5000,
            // Force strict styling via className to override any defaults
            className: '!bg-[#09090b] !text-white !border !border-[#27272a] !rounded-sm !font-mono !text-xs !uppercase !tracking-widest !shadow-2xl',
            style: {
              background: '#09090b',
              color: '#fafafa',
              border: '1px solid #27272a',
              borderRadius: '2px',
              padding: '16px',
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

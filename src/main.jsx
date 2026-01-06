import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async'; // 🧠 SEO BRAIN
import { ErrorBoundary } from 'react-error-boundary'; // 🛡️ CRASH PROTECTION
import { registerSW } from 'virtual:pwa-register';

// ✅ CORRECT PATHING: Moving out of 'ui' folder to find the App core
import App from '../app/App';
import './index.css';

/**
 * ⚡ PIXEL PALACE: SYSTEM IGNITION
 * -------------------------------
 * STATUS: MASTERED (GLOBAL STANDARD)
 * * ARCHITECTURE:
 * 1. PWA: Registers the Service Worker for offline capability.
 * 2. HELMET: Manages document head (Titles/Meta) dynamically.
 * 3. FALLBACK: Catches catastrophic errors with a custom UI.
 */

// 📱 PWA ENGINE: Auto-update content
const updateSW = registerSW({
  onNeedRefresh() {
    // Optional: Prompt user to reload. For now, we auto-update.
    console.log('🔄 New update available. Refreshing...');
  },
  onOfflineReady() {
    console.log('📶 App is ready for offline usage.');
  },
});

// 🛑 GLOBAL CRASH SCREEN: The "Burj Khalifa" Backup Generator
// If the entire app fails, this component renders instead of a white screen.
function GlobalErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-bg text-red-500 font-mono p-4">
      <div className="border border-red-900 bg-red-950/20 p-8 rounded max-w-lg w-full">
        <h1 className="text-2xl font-bold mb-4 tracking-widest uppercase">System Failure</h1>
        <p className="text-gray-400 mb-4 text-sm">Critical runtime exception detected.</p>
        <pre className="bg-black/50 p-4 rounded text-xs overflow-auto mb-6 text-red-400">
          {error.message}
        </pre>
        <button 
          onClick={() => window.location.reload()}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded text-sm uppercase tracking-wider font-bold transition-colors"
        >
          Reboot System
        </button>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 🛡️ SAFETY NET: Catches any crash inside the App */}
    <ErrorBoundary FallbackComponent={GlobalErrorFallback}>
      
      {/* 🧠 SEO CONTEXT: Allows pages to change the browser title */}
      <HelmetProvider>
        
        {/* 🔔 NOTIFICATIONS: Tactical HUD Style */}
        <Toaster 
          position="bottom-right"
          reverseOrder={false}
          gutter={8}
          toastOptions={{
            duration: 5000,
            style: {
              background: '#09090b', // bg-panel
              color: '#fafafa',
              border: '1px solid #27272a', // tactical-border
              fontSize: '13px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontFamily: 'Rajdhani, sans-serif',
              borderRadius: '2px',
              boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.8)',
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

        {/* 🚀 THE CORE */}
        <App />
        
      </HelmetProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

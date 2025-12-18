import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("CRITICAL SYSTEM FAILURE:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#060709] flex flex-col items-center justify-center p-4 text-center font-sans">
          <div className="bg-[#0b0c0f] border border-red-900/50 p-8 max-w-md shadow-2xl relative overflow-hidden" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 95%, 95% 100%, 0 100%)' }}>
             {/* Red Warning Stripe */}
             <div className="absolute top-0 left-0 w-full h-1 bg-red-600 shadow-[0_0_15px_#dc2626]" />
             
             <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-6" />
             
             <h2 className="text-xl font-black text-white uppercase tracking-widest mb-2">
               System Critical
             </h2>
             
             <p className="text-zinc-500 font-mono text-xs mb-8 leading-relaxed uppercase tracking-wider">
               An unrecoverable error has occurred in the interface layer. Operations suspended.
             </p>
             
             <button 
               onClick={() => window.location.reload()}
               className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-sm font-black uppercase tracking-[0.2em] text-[10px] flex items-center gap-2 mx-auto transition-all active:scale-95"
             >
               <RefreshCw className="w-3 h-3" /> Reboot System
             </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

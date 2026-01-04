import React from 'react';
import { ShieldAlert, RefreshCw, Terminal } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service here
    console.error("🔥 CRITICAL UI FAILURE:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/'; // Hard Refresh to clear bad state
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-black p-4 font-sans selection:bg-red-500/30">
          <div className="max-w-md w-full bg-zinc-950 border border-red-900/50 rounded-lg p-8 text-center shadow-2xl relative overflow-hidden">
            
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
            <div className="absolute inset-0 bg-red-900/5 animate-pulse pointer-events-none" />
            
            <div className="relative z-10">
              <div className="w-20 h-20 bg-red-950/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                <ShieldAlert className="w-10 h-10 text-red-500" />
              </div>
              
              <h2 className="text-4xl font-black text-white mb-2 font-display uppercase tracking-widest leading-none">
                System Failure
              </h2>
              
              <p className="text-zinc-500 text-sm font-mono mb-8">
                CRITICAL EXCEPTION // UI RENDER PROCESS TERMINATED
              </p>

              {/* Error Code Box */}
              <div className="bg-black/80 border border-white/10 p-4 rounded mb-8 text-left relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-2 opacity-50">
                    <Terminal size={12} className="text-zinc-600" />
                 </div>
                <p className="text-red-500 text-[10px] uppercase font-bold mb-1 tracking-wider">Exception Trace:</p>
                <code className="text-zinc-400 text-xs font-mono break-all block leading-relaxed">
                  {this.state.error?.message || "Unknown Runtime Error"}
                </code>
              </div>

              <button 
                onClick={this.handleReset}
                className="w-full bg-red-600 hover:bg-red-500 text-white px-6 py-4 rounded uppercase font-bold text-sm tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-900/30 hover:scale-[1.02]"
              >
                <RefreshCw size={16} /> Reboot System
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;

import React from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("🔥 CRITICAL UI FAILURE:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/'; 
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4 font-sans">
          <div className="max-w-md w-full bg-black border border-red-900/50 rounded-lg p-6 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-red-900/10 animate-pulse pointer-events-none" />
            <div className="relative z-10">
              <ShieldAlert className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <h2 className="text-2xl font-black text-white mb-2 font-['Teko'] uppercase tracking-wide">
                System Critical Error
              </h2>
              <div className="bg-zinc-900/80 border border-white/5 p-3 rounded mb-6 text-left">
                <p className="text-red-400 text-[10px] uppercase font-bold mb-1">Error Trace:</p>
                <code className="text-zinc-500 text-xs font-mono break-all block">
                  {this.state.error?.message || "Unknown Application Failure"}
                </code>
              </div>
              <button 
                onClick={this.handleReset}
                className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-sm uppercase font-bold text-sm tracking-widest flex items-center justify-center gap-2 w-full transition-all shadow-lg shadow-red-900/50"
              >
                <RefreshCw size={16} /> System Reboot
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

import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
        hasError: false, 
        error: null,
        errorInfo: null,
        resetKey: props.resetKey // Track key to reset state
    };
  }

  // 🛡️ AUTO-RECOVERY: If the key changes (route change), reset the error.
  static getDerivedStateFromProps(props, state) {
    if (props.resetKey !== state.resetKey) {
      return { 
          hasError: false, 
          error: null, 
          errorInfo: null,
          resetKey: props.resetKey 
      };
    }
    return null;
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("❌ CRITICAL UI FAILURE:", error);
    console.error("📍 STACK TRACE:", errorInfo.componentStack);
    this.setState({ errorInfo });
  }

  handleManualReset = () => {
      this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#060709] flex flex-col items-center justify-center p-4 text-center font-sans">
          <div className="bg-[#0b0c0f] border border-red-900/50 p-8 max-w-lg shadow-2xl relative overflow-hidden">
             {/* Red Warning Stripe */}
             <div className="absolute top-0 left-0 w-full h-1 bg-red-600 shadow-[0_0_15px_#dc2626]" />
             
             <div className="flex flex-col items-center mb-6">
                <AlertTriangle className="w-12 h-12 text-red-600 mb-4" />
                <h2 className="text-xl font-black text-white uppercase tracking-widest">
                    System Critical
                </h2>
                <p className="text-red-500 font-mono text-xs mt-1">RENDER_PROCESS_TERMINATED</p>
             </div>
             
             <div className="bg-black/40 p-3 rounded border border-white/5 text-left mb-6 max-h-32 overflow-auto">
                 <code className="text-[10px] text-zinc-500 font-mono">
                     {this.state.error?.toString()}
                 </code>
             </div>
             
             <div className="flex gap-3 justify-center">
                <button 
                    onClick={() => window.location.href = '/'}
                    className="bg-zinc-800 hover:bg-zinc-700 text-white px-5 py-3 rounded-sm font-black uppercase tracking-[0.1em] text-[10px] flex items-center gap-2"
                >
                    <Home size={14} /> Base
                </button>
                <button 
                    onClick={this.handleManualReset}
                    className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-sm font-black uppercase tracking-[0.1em] text-[10px] flex items-center gap-2 shadow-lg shadow-red-900/20"
                >
                    <RefreshCw size={14} /> Reboot
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

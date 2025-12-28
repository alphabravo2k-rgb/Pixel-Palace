import React from 'react';
import { AlertTriangle, RefreshCw, Copy, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
        hasError: false, 
        error: null,
        errorInfo: null,
        resetKey: props.resetKey 
    };
  }

  static getDerivedStateFromProps(props, state) {
    // Auto-reset if the user navigates (resetKey changes)
    if (props.resetKey !== state.resetKey) {
      return { hasError: false, error: null, errorInfo: null, resetKey: props.resetKey };
    }
    return null;
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("🔥 UI FAILURE:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleManualReset = () => {
      this.setState({ hasError: false, error: null, errorInfo: null });
  };

  copyError = () => {
      if (this.state.error) {
          navigator.clipboard.writeText(this.state.error.toString());
          alert("Error copied to clipboard");
      }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center bg-black/50 backdrop-blur-sm">
          <div className="bg-[#09090b] border border-red-500/30 p-8 rounded-lg max-w-md w-full shadow-2xl relative overflow-hidden group">
             
             {/* Animated Warning Icon */}
             <div className="flex justify-center mb-6">
                <div className="p-4 bg-red-500/10 rounded-full animate-pulse">
                    <AlertTriangle className="w-10 h-10 text-red-500" />
                </div>
             </div>
             
             <h2 className="text-xl font-['Teko'] uppercase font-bold tracking-widest text-white mb-2">
                 Interface Interrupted
             </h2>
             <p className="text-zinc-500 font-mono text-xs mb-6">
                 The display layer encountered an exception. Core data is safe.
             </p>
             
             {/* Error Code */}
             <div className="bg-black p-3 rounded border border-white/5 text-left mb-6 relative group/code">
                 <code className="text-[10px] text-red-400 font-mono block overflow-hidden text-ellipsis whitespace-nowrap">
                     {this.state.error?.toString() || 'Unknown Error'}
                 </code>
                 <button 
                    onClick={this.copyError}
                    className="absolute right-2 top-2 p-1 hover:bg-white/10 rounded text-zinc-500 hover:text-white"
                    title="Copy Error"
                 >
                    <Copy size={12} />
                 </button>
             </div>
             
             {/* Actions */}
             <div className="grid grid-cols-2 gap-3">
                <button 
                    onClick={() => window.location.href = '/'}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-[10px] font-bold uppercase tracking-widest transition-colors"
                >
                    <Home size={14} /> Dashboard
                </button>
                <button 
                    onClick={this.handleManualReset}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-500 text-white rounded text-[10px] font-bold uppercase tracking-widest transition-colors shadow-[0_0_15px_rgba(220,38,38,0.4)]"
                >
                    <RefreshCw size={14} /> Reload UI
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

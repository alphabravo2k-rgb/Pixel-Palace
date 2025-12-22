import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null }; // 👈 Added fields
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }; // 👈 Capture the error object
  }

  componentDidCatch(error, errorInfo) {
    console.error("CRITICAL SYSTEM FAILURE:", error, errorInfo);
    this.setState({ errorInfo }); // 👈 Capture stack trace
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#060709] flex flex-col items-center justify-center p-4 text-center font-sans">
          <div className="bg-[#0b0c0f] border border-red-900/50 p-8 max-w-4xl w-full shadow-2xl relative overflow-hidden text-left">
             {/* Red Warning Stripe */}
             <div className="absolute top-0 left-0 w-full h-1 bg-red-600 shadow-[0_0_15px_#dc2626]" />
             
             <div className="flex items-center gap-4 mb-6">
                <AlertTriangle className="w-12 h-12 text-red-600" />
                <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-widest">
                    System Critical (DEBUG MODE)
                    </h2>
                    <p className="text-red-400 font-mono text-xs uppercase">
                        Exception Caught
                    </p>
                </div>
             </div>
             
             {/* 🔍 THE SMOKING GUN: ACTUAL ERROR MESSAGE */}
             <div className="bg-black p-4 rounded border border-red-900/30 font-mono text-xs text-red-300 overflow-auto max-h-[60vh]">
                <h3 className="text-white font-bold mb-2 text-sm">ERROR:</h3>
                <pre className="whitespace-pre-wrap mb-4 text-red-500 font-bold">
                    {this.state.error && this.state.error.toString()}
                </pre>
                
                <h3 className="text-white font-bold mb-2 text-sm">STACK TRACE:</h3>
                <pre className="whitespace-pre-wrap text-gray-500">
                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
             </div>
             
             <button 
               onClick={() => window.location.reload()}
               className="mt-6 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-sm font-black uppercase tracking-[0.2em] text-[10px] flex items-center gap-2 transition-all"
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

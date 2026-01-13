/**
 * 🛡️ ERROR BOUNDARY: SYSTEM ISOLATION PROTOCOL
 * VERSION: 2050.5.0 (MASTER OMNI)
 * STATUS: ACTIVE // FAULT-TOLERANT
 */

import React from 'react';
import { ShieldAlert, RefreshCw, Terminal, Activity } from 'lucide-react';

// MASTER INTEGRATION
import { SoundNexus, CUES } from '../../lib/soundNexus';
import { Telemetry, EVENTS } from '../../lib/telemetry';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // 🔊 Trigger Alarm Sound immediately on crash
    try { SoundNexus.play(CUES.DISPUTE_TRIGGER); } catch(e) {}
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // 🛰️ TELEMETRY: Record crash forensics for the Overseer
    Telemetry.log(EVENTS.ERROR, {
      subsystem: 'UI_KERNEL',
      message: error.message,
      componentStack: errorInfo.componentStack,
      url: window.location.href
    });

    this.setState({ errorInfo });
    console.error("🔥 CRITICAL UI FAILURE:", error, errorInfo);
  }

  handleReset = () => {
    try { SoundNexus.play(CUES.UI_CLICK); } catch(e) {}
    this.setState({ hasError: false, error: null });
    
    // ⚡ HARD REBOOT: Clear the memory heap and restart
    window.location.href = '/'; 
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#050505] p-6 selection:bg-red-500/30 font-sans">
          
          {/* 🌌 ATMOSPHERIC INTERFERENCE */}
          <div className="absolute inset-0 pointer-events-none opacity-20">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#ef444410,_transparent)]" />
             <div className="scanlines opacity-50" />
          </div>

          <div className="max-w-md w-full bg-[#09090b] border border-red-500/30 rounded-sm p-10 text-center shadow-[0_0_100px_rgba(239,68,68,0.05)] relative z-10 overflow-hidden animate-in zoom-in-95 duration-500">
            
            {/* 🧩 TACTICAL DECORATOR */}
            <div className="absolute top-0 left-0 w-full h-1 bg-red-600 animate-pulse" />
            
            <div className="relative z-20">
              <div className="w-24 h-24 bg-red-500/10 rounded-sm flex items-center justify-center mx-auto mb-8 border border-red-500/30 rotate-45 group">
                <ShieldAlert className="w-12 h-12 text-red-500 -rotate-45 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
              </div>
              
              <h2 className="text-4xl font-display font-black text-white mb-3 uppercase italic tracking-tighter leading-none">
                Containment <span className="text-red-600">Breach</span>
              </h2>
              
              <p className="text-zinc-500 text-[9px] font-mono mb-10 tracking-[0.4em] uppercase flex items-center justify-center gap-2">
                <Activity size={12} className="text-red-500 animate-pulse" /> Core Process Terminated
              </p>

              {/* 📜 ERROR FORENSICS */}
              <div className="bg-black/60 border border-white/5 p-5 rounded-sm mb-10 text-left relative group">
                 <div className="absolute top-0 right-0 p-3 opacity-20">
                    <Terminal size={14} className="text-zinc-500" />
                 </div>
                <p className="text-red-500 text-[10px] font-black uppercase mb-2 tracking-widest font-mono">Trace Identifier:</p>
                <code className="text-zinc-400 text-[11px] font-mono break-all block leading-relaxed max-h-32 overflow-y-auto custom-scrollbar">
                  {this.state.error?.toString() || "Unknown Engine Exception"}
                </code>
              </div>

              <button 
                onClick={this.handleReset}
                className="w-full bg-red-600 hover:bg-red-500 text-white px-8 py-5 rounded-sm uppercase font-black text-[11px] tracking-[0.3em] flex items-center justify-center gap-3 transition-all active:scale-95 shadow-2xl shadow-red-600/20"
              >
                <RefreshCw size={18} className="animate-spin" /> Initialize System Reboot
              </button>
              
              <p className="mt-8 text-[9px] text-zinc-700 font-mono uppercase tracking-widest">
                Session Telemetry Sent to Command Hub
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;

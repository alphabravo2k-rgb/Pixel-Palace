/**
 * 🛰️ ADMIN MATCH MODAL: FIELD INTERVENTION
 * VERSION: 2050.5.0 (MASTER OMNI)
 * STATUS: OPERATIONAL // RAPID-DEPLOY
 */

import React, { useState } from 'react';
import { X, Tv, Server, Save, AlertTriangle, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';

// MASTER CORE
import { supabase } from '../../supabase/client';
import { SoundNexus, CUES } from '../../lib/soundNexus';
import { Telemetry, EVENTS } from '../../lib/telemetry';
import { useNexus } from '../../hooks/useNexus';

export const AdminMatchModal = ({ match, isOpen, onClose, onUpdate }) => {
  const { can } = useNexus();
  const [loading, setLoading] = useState(false);
  const [streamUrl, setStreamUrl] = useState(match?.stream_url || '');
  const [serverIp, setServerIp] = useState(match?.server_ip || '');

  // 🛡️ SECURITY: Verify staff clearance before mounting
  if (!isOpen || !match || !can('CAP_MANAGE_MATCH')) return null;

  /**
   * ⚡ RAPID SAVE
   * Direct injection of connection data into the live match stream.
   */
  const handleSave = async () => {
    setLoading(true);
    SoundNexus.play(CUES.UI_CLICK);

    try {
      const { error } = await supabase
        .from('matches')
        .update({ 
            stream_url: streamUrl, 
            server_ip: serverIp,
            updated_at: new Date().toISOString() 
        })
        .eq('id', match.id);

      if (error) throw error;
      
      // Log the intervention for the Audit Trail
      Telemetry.log(EVENTS.ACTION, { 
          action: 'QUICK_EDIT', 
          match_id: match.id, 
          fields: ['server_ip', 'stream_url'] 
      });

      SoundNexus.play(CUES.UI_SUCCESS);
      toast.success("CONNECTION DATA BROADCASTED");
      
      if (onUpdate) onUpdate();
      onClose();
    } catch (err) {
      SoundNexus.play(CUES.UI_ERROR);
      toast.error("LINK FAILURE: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
      
      {/* GLOW DECORATOR */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-fuchsia-500/10 blur-[120px] pointer-events-none" />

      <div className="bg-[#09090b] w-full max-w-lg border border-zinc-800 rounded-sm shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col relative z-10">
        
        {/* HEADER */}
        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-zinc-900/30">
           <div className="flex items-center gap-2">
               <ShieldCheck className="w-4 h-4 text-fuchsia-500" />
               <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Rapid Intervention: M-{match.match_position}</h3>
           </div>
           <button onClick={onClose} className="p-1 hover:bg-white/5 rounded-sm text-zinc-500 hover:text-white transition-colors">
               <X size={18}/>
           </button>
        </div>

        {/* BODY */}
        <div className="p-8 space-y-6">
            <div className="space-y-3">
                <label className="text-[9px] font-black text-zinc-500 uppercase flex items-center gap-2 tracking-widest">
                    <Server size={12} className="text-fuchsia-500"/> Deployment: Server IP
                </label>
                <input 
                    value={serverIp} 
                    onChange={(e) => setServerIp(e.target.value)} 
                    className="w-full bg-black/50 border border-zinc-800 p-3 text-white text-xs font-mono rounded-sm focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 outline-none transition-all"
                    placeholder="connect 127.0.0.1; password..."
                />
            </div>
            
            <div className="space-y-3">
                <label className="text-[9px] font-black text-zinc-500 uppercase flex items-center gap-2 tracking-widest">
                    <Tv size={12} className="text-fuchsia-500"/> Uplink: Stream URL
                </label>
                <input 
                    value={streamUrl} 
                    onChange={(e) => setStreamUrl(e.target.value)} 
                    className="w-full bg-black/50 border border-zinc-800 p-3 text-white text-xs font-mono rounded-sm focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 outline-none transition-all"
                    placeholder="https://twitch.tv/..."
                />
            </div>

            <div className="pt-4 space-y-4">
                <div className="bg-fuchsia-500/5 border border-fuchsia-500/20 p-4 rounded-sm text-[9px] text-fuchsia-200/60 leading-relaxed font-mono uppercase">
                    <div className="flex gap-3">
                        <AlertTriangle size={16} className="shrink-0 text-fuchsia-500" />
                        <span>Warning: Updates are live and visible to all participants immediately. For score overrides, use the Master War Room.</span>
                    </div>
                </div>

                <button 
                    onClick={handleSave} 
                    disabled={loading} 
                    className="w-full py-4 bg-fuchsia-600 hover:bg-fuchsia-500 disabled:opacity-50 text-white font-black uppercase text-[10px] tracking-[0.4em] rounded-sm flex items-center justify-center gap-3 shadow-2xl shadow-fuchsia-500/20 transition-all active:scale-95 group"
                >
                    {loading ? (
                        <span className="flex items-center gap-2 animate-pulse">Syncing...</span>
                    ) : (
                        <>
                            <Save size={14} className="group-hover:scale-110 transition-transform" /> 
                            Commit Broadcast Edits
                        </>
                    )}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

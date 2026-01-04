import React, { useState } from 'react';
import { supabase } from '../../supabase/client';
import { X, Tv, Server, Save, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const AdminMatchModal = ({ match, isOpen, onClose, onUpdate }) => {
  if (!isOpen || !match) return null;

  const [loading, setLoading] = useState(false);
  const [streamUrl, setStreamUrl] = useState(match.stream_url || '');
  const [serverIp, setServerIp] = useState(match.server_ip || '');

  // Quick Save for minor details
  const handleSave = async () => {
    setLoading(true);
    try {
        const { error } = await supabase
            .from('matches')
            .update({ stream_url: streamUrl, server_ip: serverIp })
            .eq('id', match.id);

        if (error) throw error;
        
        toast.success("Connection Details Updated");
        if (onUpdate) onUpdate();
        onClose();
    } catch (err) {
        toast.error("Save Failed: " + err.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-bg-panel w-full max-w-lg border border-tactical rounded-lg shadow-2xl overflow-hidden flex flex-col">
        
        {/* HEADER */}
        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-zinc-900/50">
           <h3 className="text-sm font-bold uppercase tracking-wider text-white">Quick Edit: Match #{match.match_no}</h3>
           <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white"><X size={18}/></button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-4">
            <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase flex items-center gap-2"><Server size={12}/> Server IP</label>
                <input 
                    value={serverIp} 
                    onChange={(e) => setServerIp(e.target.value)} 
                    className="w-full bg-black border border-zinc-700 p-2 text-white text-xs font-mono rounded focus:border-brand outline-none"
                    placeholder="connect 127.0.0.1"
                />
            </div>
            
            <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase flex items-center gap-2"><Tv size={12}/> Stream URL</label>
                <input 
                    value={streamUrl} 
                    onChange={(e) => setStreamUrl(e.target.value)} 
                    className="w-full bg-black border border-zinc-700 p-2 text-white text-xs font-mono rounded focus:border-brand outline-none"
                    placeholder="https://twitch.tv/..."
                />
            </div>

            <div className="pt-2">
                <div className="bg-yellow-900/20 border border-yellow-500/20 p-3 rounded text-[10px] text-yellow-500 mb-4 flex gap-2">
                    <AlertTriangle size={14} className="shrink-0" />
                    For advanced controls (Score, Forfeit, Veto), please enter the full War Room.
                </div>

                <button 
                    onClick={handleSave} 
                    disabled={loading} 
                    className="w-full py-3 bg-brand hover:bg-brand-glow text-white font-bold uppercase text-xs rounded flex items-center justify-center gap-2 shadow-lg"
                >
                    {loading ? "Saving..." : <><Save size={14} /> Save Quick Edits</>}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

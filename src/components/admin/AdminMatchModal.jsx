import React, { useState } from 'react';
import { supabase } from '../../supabase/client';
import { 
  X, Shield, Tv, Server, AlertTriangle, 
  RotateCcw, Save, Trophy
} from 'lucide-react';

export const AdminMatchModal = ({ match, isOpen, onClose, onUpdate }) => {
  if (!isOpen || !match) return null;

  const [activeTab, setActiveTab] = useState('overview'); // overview, server, admin
  const [loading, setLoading] = useState(false);
  
  // Local state for edits
  const [score, setScore] = useState(match.score || '');
  const [streamUrl, setStreamUrl] = useState(match.stream_url || '');
  const [serverIp, setServerIp] = useState(match.server_ip || '');
  
  // --- ACTIONS ---

  const handleSaveMetadata = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('matches')
      .update({ 
        score, 
        stream_url: streamUrl, 
        server_ip: serverIp 
      })
      .eq('id', match.id);

    if (error) alert("Error saving: " + error.message);
    else {
      if (onUpdate) onUpdate();
      alert("Match Details Updated");
    }
    setLoading(false);
  };

  const handleForceWin = async (winnerId) => {
    if (!window.confirm("⚠️ DANGER: This will end the match and advance the bracket. Are you sure?")) return;
    
    setLoading(true);
    // Call the SQL function (auto-advances bracket)
    const { error } = await supabase.rpc('admin_force_match_result', {
      p_match_id: match.id,
      p_winner_id: winnerId
    });

    if (error) alert("Error: " + error.message);
    else {
      if (onUpdate) onUpdate();
      onClose();
    }
    setLoading(false);
  };

  const handleSwapSides = async () => {
     if (!window.confirm("Swap Team Sides?")) return;
     setLoading(true);
     // Call the SQL function
     const { error } = await supabase.rpc('api_swap_match_slots', {
        p_match_id: match.id,
        p_reason: "Manual Admin Swap"
     });
     
     if (error) alert("Error: " + error.message);
     else if (onUpdate) onUpdate();
     setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#0b0c0f] w-full max-w-2xl border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
           <div className="flex items-center gap-3">
              <span className="text-zinc-500 font-mono text-xs">MATCH #{match.match_no}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${match.status === 'live' ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-900' : 'bg-zinc-800 text-zinc-500'}`}>
                {match.status}
              </span>
           </div>
           <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white">
             <X size={18} />
           </button>
        </div>

        {/* TABS */}
        <div className="flex border-b border-zinc-800 bg-[#050505]">
           <button onClick={() => setActiveTab('overview')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${activeTab === 'overview' ? 'border-fuchsia-500 text-white bg-white/5' : 'border-transparent text-zinc-600 hover:text-zinc-400'}`}>
              Overview
           </button>
           <button onClick={() => setActiveTab('server')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${activeTab === 'server' ? 'border-blue-500 text-white bg-white/5' : 'border-transparent text-zinc-600 hover:text-zinc-400'}`}>
              Server & Stream
           </button>
           <button onClick={() => setActiveTab('admin')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${activeTab === 'admin' ? 'border-red-500 text-white bg-white/5' : 'border-transparent text-zinc-600 hover:text-zinc-400'}`}>
              Danger Zone
           </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
           
           {/* --- TAB: OVERVIEW --- */}
           {activeTab === 'overview' && (
             <div className="space-y-6">
                <div className="flex items-center justify-between gap-8">
                   {/* Team 1 */}
                   <div className="flex-1 flex flex-col items-center gap-3">
                      <div className="w-20 h-20 bg-zinc-900 rounded-lg flex items-center justify-center border border-zinc-800">
                         {match.team1?.logo_url ? <img src={match.team1.logo_url} className="w-16 h-16 object-contain" alt={match.team1.name}/> : <Shield className="text-zinc-700"/>}
                      </div>
                      <h3 className="font-black text-xl uppercase italic text-center">{match.team1?.name || 'TBD'}</h3>
                   </div>

                   {/* Score Input */}
                   <div className="flex flex-col items-center gap-2">
                      <span className="text-zinc-500 text-[10px] font-mono uppercase">Current Score</span>
                      <input 
                        value={score} 
                        onChange={(e) => setScore(e.target.value)} 
                        placeholder="0-0"
                        className="w-24 bg-black border border-zinc-700 text-center text-2xl font-mono font-bold text-white p-2 rounded focus:border-fuchsia-500 outline-none"
                      />
                      <button onClick={handleSaveMetadata} disabled={loading} className="text-[10px] text-fuchsia-400 hover:text-fuchsia-300 underline">
                         Update Score
                      </button>
                   </div>

                   {/* Team 2 */}
                   <div className="flex-1 flex flex-col items-center gap-3">
                      <div className="w-20 h-20 bg-zinc-900 rounded-lg flex items-center justify-center border border-zinc-800">
                         {match.team2?.logo_url ? <img src={match.team2.logo_url} className="w-16 h-16 object-contain" alt={match.team2.name}/> : <Shield className="text-zinc-700"/>}
                      </div>
                      <h3 className="font-black text-xl uppercase italic text-center">{match.team2?.name || 'TBD'}</h3>
                   </div>
                </div>
             </div>
           )}

           {/* --- TAB: SERVER --- */}
           {activeTab === 'server' && (
             <div className="space-y-4">
                <div className="space-y-2">
                   <label className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-2"><Server size={14}/> Server Connect Command</label>
                   <input 
                      value={serverIp} 
                      onChange={(e) => setServerIp(e.target.value)} 
                      placeholder="connect 127.0.0.1:27015; password..."
                      className="w-full bg-zinc-900 border border-zinc-700 p-3 rounded text-sm font-mono text-zinc-300 focus:border-blue-500 outline-none"
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-2"><Tv size={14}/> Stream URL (Twitch/YouTube)</label>
                   <input 
                      value={streamUrl} 
                      onChange={(e) => setStreamUrl(e.target.value)} 
                      placeholder="https://twitch.tv/..."
                      className="w-full bg-zinc-900 border border-zinc-700 p-3 rounded text-sm font-mono text-zinc-300 focus:border-purple-500 outline-none"
                   />
                </div>
                <button 
                  onClick={handleSaveMetadata}
                  disabled={loading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase text-xs rounded flex items-center justify-center gap-2"
                >
                  <Save size={14} /> Save Connection Details
                </button>
             </div>
           )}

           {/* --- TAB: DANGER ZONE --- */}
           {activeTab === 'admin' && (
             <div className="space-y-6">
                <div className="p-4 bg-red-900/10 border border-red-900/30 rounded-xl">
                   <h4 className="text-red-400 font-bold text-xs uppercase flex items-center gap-2 mb-4"><AlertTriangle size={14}/> Forced Action Protocol</h4>
                   
                   <div className="grid grid-cols-2 gap-4">
                      {/* Force Win Team 1 */}
                      <button 
                        onClick={() => handleForceWin(match.team1?.id)}
                        disabled={loading || !match.team1}
                        className="py-4 bg-red-950 hover:bg-red-900 border border-red-800 text-red-200 rounded font-bold uppercase text-xs flex flex-col items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                         <Trophy size={16} /> 
                         <span>Win: {match.team1?.name || 'TBD'}</span>
                      </button>

                      {/* Force Win Team 2 */}
                      <button 
                         onClick={() => handleForceWin(match.team2?.id)}
                         disabled={loading || !match.team2}
                         className="py-4 bg-red-950 hover:bg-red-900 border border-red-800 text-red-200 rounded font-bold uppercase text-xs flex flex-col items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                         <Trophy size={16} />
                         <span>Win: {match.team2?.name || 'TBD'}</span>
                      </button>
                   </div>
                </div>

                <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between">
                   <div className="text-zinc-400 text-xs font-mono uppercase">
                      <span className="block text-white font-bold mb-1">Swap Team Sides</span>
                      Reverses Team 1 and Team 2 slots.
                   </div>
                   <button 
                      onClick={handleSwapSides}
                      disabled={loading}
                      className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold uppercase rounded border border-zinc-700 flex items-center gap-2"
                   >
                      <RotateCcw size={14} /> Swap
                   </button>
                </div>
             </div>
           )}

        </div>
      </div>
    </div>
  );
};

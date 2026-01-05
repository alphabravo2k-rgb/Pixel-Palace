import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase/client';
import { X, Save, ShieldAlert, RefreshCw, Trophy, AlertTriangle, Monitor, Calendar, Server } from 'lucide-react';
import { AdminMatchControls } from './AdminMatchControls';
import { toast } from 'react-hot-toast';

// Helper for date inputs
const toLocalInputString = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
};

export const MatchWarRoom = ({ matchId, onClose }) => {
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Editable State
  const [formData, setFormData] = useState({
    server_ip: '',
    server_pass: '',
    map_name: '',
    scheduled_at: '',
    stream_url: '',
    status: 'scheduled'
  });

  // 1. Fetch Data
  const fetchMatch = async () => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select(`*, team1:team1_id(*), team2:team2_id(*)`)
        .eq('id', matchId)
        .single();

      if (error) throw error;
      setMatch(data);
      
      setFormData({
        server_ip: data.server_ip || '',
        server_pass: data.server_pass || '',
        map_name: data.map_name || '',
        scheduled_at: toLocalInputString(data.scheduled_at),
        stream_url: data.stream_url || '',
        status: data.status
      });
      
    } catch (err) {
      console.error("War Room Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMatch(); }, [matchId]);

  // 2. Save Handlers
  const handleSave = async () => {
    setSaving(true);
    const finalDate = formData.scheduled_at ? new Date(formData.scheduled_at).toISOString() : null;

    const { error } = await supabase.from('matches').update({
        server_ip: formData.server_ip,
        server_pass: formData.server_pass,
        map_name: formData.map_name || null,
        scheduled_at: finalDate,
        stream_url: formData.stream_url || null,
        status: formData.status
    }).eq('id', matchId);
    
    if (error) alert("Error saving: " + error.message);
    else {
        await fetchMatch();
        alert("Match settings saved.");
    }
    setSaving(false);
  };

  const handleForceWin = async (winnerId) => {
      if(!window.confirm("⚠️ FORCE WIN: This will end the match, lock it, and advance the winner. Proceed?")) return;
      const { error } = await supabase.rpc('admin_force_match_result', {
          p_match_id: matchId,
          p_winner_id: winnerId
      });
      if (error) alert("Error: " + error.message);
      else fetchMatch();
  };

  if (!match) return null;

  return (
    <div className="w-full max-w-6xl bg-[#0b0c0f] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
      
      {/* HEADER */}
      <div className="p-4 border-b border-white/10 flex justify-between items-center bg-zinc-900/50">
         <div className="flex items-center gap-3">
             <div className={`w-3 h-3 rounded-full ${match.status === 'live' ? 'bg-red-500 animate-pulse' : 'bg-zinc-500'}`}></div>
             <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">
                 WAR ROOM: MATCH #{match.match_no}
             </h2>
             <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-zinc-800 border border-zinc-700 text-zinc-400">
                 {match.status}
             </span>
         </div>
         <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white"><X size={20}/></button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
         
         {/* LEFT COL: TEAMS & CONFIG */}
         <div className="lg:col-span-2 space-y-6">
             
             {/* TEAM VS DISPLAY */}
             <div className="grid grid-cols-3 gap-4 items-center bg-zinc-900/30 border border-zinc-800 rounded-xl p-6">
                 <div className="text-center">
                     <h3 className="text-lg font-black text-blue-400 uppercase truncate">{match.team1?.name || 'TBD'}</h3>
                     <button onClick={() => handleForceWin(match.team1_id)} disabled={!match.team1_id} className="mt-2 text-[10px] font-bold uppercase bg-blue-900/20 text-blue-400 border border-blue-900/50 px-2 py-1 rounded hover:bg-blue-900/40 transition-colors disabled:opacity-50">Force Win</button>
                 </div>
                 <div className="text-center">
                     <span className="text-2xl font-black text-zinc-700 italic">VS</span>
                 </div>
                 <div className="text-center">
                     <h3 className="text-lg font-black text-red-400 uppercase truncate">{match.team2?.name || 'TBD'}</h3>
                     <button onClick={() => handleForceWin(match.team2_id)} disabled={!match.team2_id} className="mt-2 text-[10px] font-bold uppercase bg-red-900/20 text-red-400 border border-red-900/50 px-2 py-1 rounded hover:bg-red-900/40 transition-colors disabled:opacity-50">Force Win</button>
                 </div>
             </div>

             {/* SERVER SETTINGS */}
             <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 space-y-4">
                 <h3 className="text-xs font-bold text-zinc-400 uppercase flex items-center gap-2">
                    <Server size={14}/> Connection & Stream
                 </h3>
                 <div className="grid grid-cols-2 gap-4">
                     <div>
                         <label className="block text-[10px] uppercase text-zinc-500 mb-1">Server IP</label>
                         <input value={formData.server_ip} onChange={e=>setFormData({...formData, server_ip: e.target.value})} className="w-full bg-black border border-zinc-700 rounded p-2 text-xs font-mono text-white focus:border-blue-500 outline-none" placeholder="connect 127.0.0.1:27015" />
                     </div>
                     <div>
                         <label className="block text-[10px] uppercase text-zinc-500 mb-1">RCON / Password</label>
                         <input value={formData.server_pass} onChange={e=>setFormData({...formData, server_pass: e.target.value})} className="w-full bg-black border border-zinc-700 rounded p-2 text-xs font-mono text-white focus:border-blue-500 outline-none" placeholder="Secret123" />
                     </div>
                     <div className="col-span-2">
                         <label className="block text-[10px] uppercase text-zinc-500 mb-1">Stream URL</label>
                         <input value={formData.stream_url} onChange={e=>setFormData({...formData, stream_url: e.target.value})} className="w-full bg-black border border-zinc-700 rounded p-2 text-xs text-white focus:border-purple-500 outline-none" placeholder="https://twitch.tv/..." />
                     </div>
                 </div>
             </div>

             {/* STATUS OVERRIDES */}
             <div className="flex gap-2 p-4 bg-zinc-900/30 rounded-xl border border-zinc-800">
                 {['scheduled', 'veto', 'live', 'completed', 'disputed'].map(s => (
                     <button 
                        key={s}
                        onClick={() => setFormData({...formData, status: s})}
                        className={`flex-1 py-2 rounded text-[10px] font-bold uppercase transition-all border ${formData.status === s ? 'bg-white text-black border-white' : 'bg-black text-zinc-500 border-zinc-800 hover:border-zinc-600'}`}
                     >
                        {s}
                     </button>
                 ))}
             </div>

         </div>

         {/* RIGHT COL: TOOLS */}
         <div className="space-y-6">
             
             {/* MATCH CONTROLS (BO1/3/5 Logic) */}
             <AdminMatchControls match={match} onUpdate={fetchMatch} />

             {/* SCHEDULING */}
             <div className="bg-zinc-900 border border-white/10 rounded-xl p-5 space-y-4">
                 <h3 className="text-xs font-bold text-zinc-400 uppercase flex items-center gap-2">
                    <Calendar size={14}/> Scheduling
                 </h3>
                 <input 
                    type="datetime-local" 
                    value={formData.scheduled_at} 
                    onChange={e=>setFormData({...formData, scheduled_at: e.target.value})} 
                    className="w-full bg-black border border-zinc-700 rounded p-2 text-xs text-white outline-none focus:border-blue-500"
                 />
                 <button 
                    onClick={handleSave} 
                    disabled={saving}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase rounded text-xs flex items-center justify-center gap-2 transition-all shadow-lg"
                 >
                    <Save size={14} /> {saving ? "Saving..." : "Commit Changes"}
                 </button>
             </div>

             {/* MANUAL MAP OVERRIDE */}
             <div className="bg-zinc-900 border border-white/10 rounded-xl p-5 space-y-4">
                 <h3 className="text-xs font-bold text-zinc-400 uppercase flex items-center gap-2">
                    <Trophy size={14}/> Map Override
                 </h3>
                 <select 
                    value={formData.map_name} 
                    onChange={e=>setFormData({...formData, map_name: e.target.value})} 
                    className="w-full bg-black border border-zinc-700 rounded p-2 text-xs text-white outline-none focus:border-yellow-500"
                 >
                     <option value="">-- Let Veto Decide --</option>
                     <option value="de_mirage">Mirage</option>
                     <option value="de_inferno">Inferno</option>
                     <option value="de_nuke">Nuke</option>
                     <option value="de_ancient">Ancient</option>
                     <option value="de_anubis">Anubis</option>
                     <option value="de_vertigo">Vertigo</option>
                     <option value="de_dust2">Dust 2</option>
                 </select>
                 <p className="text-[10px] text-zinc-500 leading-tight">
                    * Selecting a map manually disables the Veto System for this match.
                 </p>
             </div>

         </div>

      </div>
    </div>
  );
};

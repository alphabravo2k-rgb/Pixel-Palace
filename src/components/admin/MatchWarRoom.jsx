import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase/client';
import { 
  Shield, RefreshCw, Server, Eye, EyeOff, Calendar, 
  Map as MapIcon, Save, AlertTriangle, X, Tv, 
  StickyNote, PauseCircle, PlayCircle, Mic2, Skull, Copy
} from 'lucide-react';
import { MAP_POOL } from '../../lib/constants'; 
import { toast } from 'react-hot-toast';
import { cn, copyToClipboard } from '../../lib/utils';

// --- FIXED TIMEZONE HELPER ---
// Browser datetime-local inputs REQUIRE YYYY-MM-DDTHH:MM format exactly.
const toLocalInputString = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';
    
    // Using Swedish locale (sv-SE) because it naturally uses ISO 8601 format
    // We slice to 16 characters to get "YYYY-MM-DDTHH:MM"
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
        .toISOString()
        .slice(0, 16);
};

export const MatchWarRoom = ({ matchId, onClose }) => {
  const [match, setMatch] = useState(null);
  const [vetoes, setVetoes] = useState([]);
  const [allTeams, setAllTeams] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    status: 'scheduled',
    team1_score: 0,
    team2_score: 0,
    server_ip: '',
    server_pass: '',
    is_server_visible: false,
    scheduled_at: '',
    team1_id: '',
    team2_id: '',
    stream_url: '',
    demo_url: '',
    admin_notes: '',
    is_paused: false,
    map_name: '',
    caster_name: ''
  });

  // 1. Fetch Data
  const fetchWarRoomData = async () => {
    setLoading(true);
    
    // Get Match, Vetoes, and Teams in parallel for speed
    const [matchRes, vetoRes, teamRes] = await Promise.all([
      supabase.from('matches').select(`*, team1:team1_id(id, name), team2:team2_id(id, name)`).eq('id', matchId).single(),
      supabase.from('match_vetoes').select('*').eq('match_id', matchId).order('pick_order', { ascending: true }),
      supabase.from('teams').select('id, name').order('name')
    ]);

    if (matchRes.data) {
      const m = matchRes.data;
      setMatch(m);
      setVetoes(vetoRes.data || []);
      setAllTeams(teamRes.data || []);
      
      setFormData({
        status: m.status,
        team1_score: m.team1_score || 0, 
        team2_score: m.team2_score || 0,
        server_ip: m.server_ip || '',
        server_pass: m.server_pass || '',
        is_server_visible: m.is_server_visible || false,
        scheduled_at: toLocalInputString(m.scheduled_at), // ✅ Use Fixed Helper
        team1_id: m.team1_id,
        team2_id: m.team2_id,
        stream_url: m.stream_url || '',
        demo_url: m.demo_url || '',
        admin_notes: m.admin_notes || '',
        is_paused: m.is_paused || false,
        map_name: m.map_name || '',
        caster_name: m.caster_name || ''
      });
    }
    setLoading(false);
  };

  useEffect(() => { fetchWarRoomData(); }, [matchId]);

  // 2. Auto Forfeit Logic
  const handleForfeit = (winner) => {
      const winnerName = winner === 1 ? match?.team1?.name || 'Team A' : match?.team2?.name || 'Team B';
      if(!window.confirm(`⚠️ DANGER: FORCE WIN\n\nAward win to ${winnerName}?\nThis sets score to 1-0 and ends match.`)) return;
      
      setFormData(prev => ({
          ...prev,
          status: 'completed',
          team1_score: winner === 1 ? 1 : 0,
          team2_score: winner === 2 ? 1 : 0
      }));
      toast("Forfeit parameters set. Click Commit to save.", { icon: '💀' });
  };

  // 3. Save Changes
  const handleSave = async () => {
    setSaving(true);
    const toastId = toast.loading("Syncing with Command Center...");
    
    // Convert local datetime-local string back to proper ISO for Database
    const finalDate = formData.scheduled_at ? new Date(formData.scheduled_at).toISOString() : null;

    const { error } = await supabase.rpc('admin_update_match_state', {
      p_match_id: matchId,
      p_status: formData.status,
      p_team1_score: parseInt(formData.team1_score),
      p_team2_score: parseInt(formData.team2_score),
      p_server_ip: formData.server_ip,
      p_server_pass: formData.server_pass,
      p_is_visible: formData.is_server_visible,
      p_scheduled_at: finalDate,
      p_team1_id: formData.team1_id,
      p_team2_id: formData.team2_id,
      p_stream_url: formData.stream_url,
      p_demo_url: formData.demo_url,
      p_admin_notes: formData.admin_notes,
      p_is_paused: formData.is_paused,
      p_map_name: formData.map_name,
      p_caster_name: formData.caster_name
    });

    if (error) {
        toast.error("Update Failed: " + error.message, { id: toastId });
    } else {
        await fetchWarRoomData();
        toast.success("Match State Updated", { id: toastId });
    }
    setSaving(false);
  };

  if (loading) return (
      <div className="flex items-center justify-center h-96 text-zinc-500 gap-2 font-mono bg-black">
          <RefreshCw className="animate-spin text-brand" /> ACCESSING WAR ROOM...
      </div>
  );

  return (
    <div className="bg-bg-panel border border-tactical rounded-lg overflow-hidden w-full max-w-7xl mx-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200 h-full flex flex-col">
      
      {/* HEADER */}
      <div className="bg-red-950/20 border-b border-red-500/30 p-4 flex justify-between items-center shrink-0">
        <h2 className="text-xl font-display font-black text-white italic uppercase tracking-tighter flex items-center gap-2">
          <Shield className="text-red-500" /> WAR ROOM: MATCH #{match.match_no}
        </h2>
        <div className="flex gap-2">
            <button onClick={fetchWarRoomData} className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded border border-zinc-700 transition-colors"><RefreshCw size={16}/></button>
            <button onClick={onClose} className="p-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded border border-zinc-700 transition-colors"><X size={16}/></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 min-h-full">
        
            {/* === LEFT COLUMN: CONTROLS === */}
            <div className="lg:col-span-2 p-6 space-y-8 border-r border-tactical bg-bg">
                
                {/* 1. SCOREBOARD & STATUS */}
                <div className={cn(
                    "grid grid-cols-3 items-center gap-4 p-6 rounded-lg border transition-all",
                    formData.is_paused ? "bg-yellow-900/10 border-yellow-500/50" : "bg-zinc-900/30 border-zinc-800"
                )}>
                    <div className="text-center">
                        <label className="text-[10px] text-brand-glow font-bold uppercase mb-2 block">Team A (Home)</label>
                        <select 
                            value={formData.team1_id || ''} 
                            onChange={e => setFormData({...formData, team1_id: e.target.value})}
                            className="w-full bg-black border border-zinc-700 text-white text-sm p-2 rounded mb-4 text-center font-bold outline-none focus:border-brand"
                        >
                            <option value="">TBD</option>
                            {allTeams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                        <input type="number" value={formData.team1_score} onChange={e => setFormData({...formData, team1_score: e.target.value})} className="w-24 bg-black border border-zinc-600 text-5xl font-display font-black text-white text-center p-2 rounded focus:border-brand outline-none"/>
                    </div>

                    <div className="flex flex-col items-center gap-4">
                        <span className="text-zinc-700 font-black text-3xl italic">VS</span>
                        <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className={cn(
                            "w-full text-center text-xs font-bold uppercase p-2 rounded border outline-none",
                            formData.status === 'live' ? "bg-red-900/50 text-red-500 border-red-500" :
                            formData.status === 'completed' ? "bg-emerald-900/50 text-emerald-500 border-emerald-500" :
                            "bg-zinc-800 text-zinc-400 border-zinc-600"
                        )}>
                            <option value="scheduled">Scheduled</option>
                            <option value="veto">Veto Phase</option>
                            <option value="live">🔴 LIVE</option>
                            <option value="completed">Completed</option>
                            <option value="disputed">⚠️ Disputed</option>
                        </select>
                        
                        <button onClick={() => setFormData({...formData, is_paused: !formData.is_paused})} className={cn(
                            "flex items-center gap-2 px-4 py-1.5 rounded text-[10px] font-bold uppercase border transition-all w-full justify-center",
                            formData.is_paused ? "bg-yellow-500 text-black border-yellow-500 animate-pulse" : "bg-black text-zinc-500 border-zinc-800 hover:text-white"
                        )}>
                            {formData.is_paused ? <><PauseCircle size={12}/> PAUSED</> : <><PlayCircle size={12}/> FLOW NORMAL</>}
                        </button>
                    </div>

                    <div className="text-center">
                        <label className="text-[10px] text-brand-glow font-bold uppercase mb-2 block">Team B (Away)</label>
                        <select 
                            value={formData.team2_id || ''} 
                            onChange={e => setFormData({...formData, team2_id: e.target.value})} 
                            className="w-full bg-black border border-zinc-700 text-white text-sm p-2 rounded mb-4 text-center font-bold outline-none focus:border-brand"
                        >
                            <option value="">TBD</option>
                            {allTeams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                        <input type="number" value={formData.team2_score} onChange={e => setFormData({...formData, team2_score: e.target.value})} className="w-24 bg-black border border-zinc-600 text-5xl font-display font-black text-white text-center p-2 rounded focus:border-brand outline-none"/>
                    </div>
                </div>

                {/* 2. SERVER & MAP */}
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2 border-b border-white/5 pb-2">
                            <Server size={14} className="text-emerald-500" /> Connection
                        </h3>
                        <div className="space-y-3">
                            <div className="relative">
                                <label className="text-[9px] text-zinc-500 uppercase font-bold mb-1 block">Server IP / Connect Command</label>
                                <input value={formData.server_ip} onChange={e => setFormData({...formData, server_ip: e.target.value})} className="w-full bg-black border border-zinc-700 text-emerald-400 font-mono text-xs p-2.5 rounded focus:border-emerald-500 outline-none" placeholder="connect 127.0.0.1:27015"/>
                                <button onClick={() => { copyToClipboard(formData.server_ip); toast.success("IP Copied"); }} className="absolute right-2 top-6 text-zinc-600 hover:text-white"><Copy size={12}/></button>
                            </div>
                            <div>
                                <label className="text-[9px] text-zinc-500 uppercase font-bold mb-1 block">RCON Password</label>
                                <input value={formData.server_pass} onChange={e => setFormData({...formData, server_pass: e.target.value})} className="w-full bg-black border border-zinc-700 text-white font-mono text-xs p-2.5 rounded focus:border-emerald-500 outline-none" placeholder="******"/>
                            </div>
                            
                            <button onClick={() => setFormData({...formData, is_server_visible: !formData.is_server_visible})} className={cn(
                                "w-full py-2 rounded text-[10px] font-bold uppercase border transition-all flex items-center justify-center gap-2",
                                formData.is_server_visible ? "bg-emerald-900/30 border-emerald-500 text-emerald-500" : "bg-zinc-900 border-zinc-800 text-zinc-500"
                            )}>
                                {formData.is_server_visible ? <><Eye size={12}/> Visible to Players</> : <><EyeOff size={12}/> Hidden from Players</>}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2 border-b border-white/5 pb-2">
                            <MapIcon size={14} className="text-yellow-500" /> Map Selection
                        </h3>
                        <div className="space-y-3">
                            <div className="w-full h-32 rounded bg-black border border-zinc-700 overflow-hidden relative group">
                                {formData.map_name ? (
                                    <img src={MAP_POOL.find(m => m.id === formData.map_name)?.image} className="w-full h-full object-cover opacity-60" />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-zinc-700 text-xs font-mono uppercase">No Map Selected</div>
                                )}
                                <div className="absolute bottom-0 w-full p-2 bg-black/80">
                                    <select value={formData.map_name} onChange={e => setFormData({...formData, map_name: e.target.value})} className="w-full bg-transparent text-white text-xs font-bold uppercase outline-none">
                                        <option value="">-- Veto Decider --</option>
                                        {MAP_POOL.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="p-2 bg-yellow-900/10 border border-yellow-900/30 rounded text-[10px] text-yellow-600/80 italic leading-tight">
                                * Manual setting overrides the Veto system results. 
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. MEDIA & SCHEDULE */}
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2"><Calendar size={14} className="text-blue-500" /> Schedule</h3>
                        <input 
                            type="datetime-local" 
                            value={formData.scheduled_at} 
                            onChange={e => setFormData({...formData, scheduled_at: e.target.value})} 
                            className="bg-black border border-zinc-700 text-white p-2.5 rounded text-xs w-full font-mono outline-none focus:border-blue-500"
                        />
                        <div className="text-[9px] text-zinc-600 italic">* Input in YOUR local time. Auto-converts to UTC for DB.</div>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2"><Tv size={14} className="text-purple-500" /> Production</h3>
                        <input value={formData.stream_url} onChange={e => setFormData({...formData, stream_url: e.target.value})} className="bg-black border border-zinc-700 text-white p-2 rounded text-xs w-full mb-1 outline-none focus:border-purple-500" placeholder="Twitch URL"/>
                        <div className="flex items-center gap-2 bg-black border border-zinc-700 rounded p-2">
                            <Mic2 size={12} className="text-zinc-500"/>
                            <input value={formData.caster_name} onChange={e => setFormData({...formData, caster_name: e.target.value})} className="bg-transparent text-white text-xs w-full outline-none" placeholder="Caster Name"/>
                        </div>
                    </div>
                </div>
            </div>

            {/* === RIGHT COLUMN: LOGS & ACTIONS === */}
            <div className="p-6 bg-zinc-950/50 flex flex-col h-full border-l border-zinc-800">
                
                <div className="mb-6 flex-1">
                    <h3 className="text-sm font-bold text-white uppercase mb-2 flex items-center gap-2"><StickyNote size={14} className="text-blue-500"/> Admin Log</h3>
                    <textarea value={formData.admin_notes} onChange={e => setFormData({...formData, admin_notes: e.target.value})} className="w-full h-full min-h-[150px] bg-yellow-900/5 border border-yellow-600/20 text-yellow-100 text-xs p-3 rounded resize-none focus:border-yellow-600 outline-none font-mono" placeholder="Internal notes (warnings, disputes, forfeit reasons)..."/>
                </div>

                <div className="mb-6 flex-1 max-h-[300px] flex flex-col">
                    <h3 className="text-sm font-bold text-white uppercase mb-2">Veto History</h3>
                    <div className="space-y-1 overflow-y-auto flex-1 pr-1 custom-scrollbar">
                        {vetoes.length === 0 ? <div className="text-center text-zinc-700 text-xs py-4 border border-dashed border-zinc-800 rounded">No veto data</div> : vetoes.map((v, i) => (
                            <div key={i} className="flex justify-between items-center text-[10px] p-2 bg-zinc-900 border border-zinc-800 rounded">
                                <span className={v.type==='BAN'?'text-red-500 font-bold':'text-emerald-500 font-bold'}>{v.type}</span>
                                <span className="text-white font-mono">{v.map_name}</span>
                                <span className="text-zinc-500">{v.team_id === match.team1_id ? match.team1?.name : match.team2?.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mb-6 p-4 bg-red-950/10 border border-red-900/30 rounded relative overflow-hidden shrink-0">
                    <div className="absolute top-0 left-0 w-1 h-full bg-red-600/50"></div>
                    <h3 className="text-[10px] font-black text-red-500 uppercase mb-2 flex items-center gap-1"><Skull size={12}/> Danger Zone: Force Win</h3>
                    <div className="flex gap-2">
                        <button onClick={() => handleForfeit(1)} className="flex-1 py-2 bg-red-950 hover:bg-red-900 text-red-500 text-[9px] font-bold uppercase rounded border border-red-900/50 transition-colors">Win Team A</button>
                        <button onClick={() => handleForfeit(2)} className="flex-1 py-2 bg-red-950 hover:bg-red-900 text-red-500 text-[9px] font-bold uppercase rounded border border-red-900/50 transition-colors">Win Team B</button>
                    </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-zinc-800 mt-auto shrink-0">
                    <button onClick={handleSave} disabled={saving} className="w-full py-4 bg-brand hover:bg-brand-glow text-white font-black uppercase text-sm rounded shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50">
                        {saving ? <RefreshCw className="animate-spin"/> : <Save size={16}/>} Commit Changes
                    </button>
                    <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-500">
                        <AlertTriangle size={12} className="text-yellow-600"/> Changes reflect instantly
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

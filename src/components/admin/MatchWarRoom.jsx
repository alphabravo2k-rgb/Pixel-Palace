import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase/client';
import { 
  Shield, RefreshCw, Server, Eye, EyeOff, Calendar, 
  Map as MapIcon, Save, AlertTriangle, X, Tv, FileCode, 
  StickyNote, PauseCircle, PlayCircle, Mic2, Skull, Copy
} from 'lucide-react';

// --- TIMEZONE HELPER ---
// Converts DB UTC (ISO) -> Local "YYYY-MM-DDTHH:MM" for input fields
const toLocalInputString = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const offset = date.getTimezoneOffset() * 60000;
    return (new Date(date - offset)).toISOString().slice(0, 16);
};

// CS2 Active Duty Pool
const MAP_POOL = ['Ancient', 'Anubis', 'Dust2', 'Inferno', 'Mirage', 'Nuke', 'Overpass', 'Vertigo', 'Train'];

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
    
    // Get Match
    const { data: matchData } = await supabase
      .from('matches')
      .select(`*, team1:team1_id(id, name), team2:team2_id(id, name)`)
      .eq('id', matchId)
      .single();

    // Get Veto History
    const { data: vetoData } = await supabase
      .from('match_veto')
      .select('*')
      .eq('match_id', matchId)
      .order('sequence_no', { ascending: true });

    // Get All Teams (For swapping)
    const { data: teamList } = await supabase
      .from('teams')
      .select('id, name')
      .order('name');

    if (matchData) {
      setMatch(matchData);
      setVetoes(vetoData || []);
      setAllTeams(teamList || []);
      
      setFormData({
        status: matchData.status,
        team1_score: matchData.team1_score,
        team2_score: matchData.team2_score,
        server_ip: matchData.server_ip || '',
        server_pass: matchData.server_pass || '',
        is_server_visible: matchData.is_server_visible || false,
        // ✅ Convert UTC to Local for Input
        scheduled_at: toLocalInputString(matchData.scheduled_at),
        team1_id: matchData.team1_id,
        team2_id: matchData.team2_id,
        stream_url: matchData.stream_url || '',
        demo_url: matchData.demo_url || '',
        admin_notes: matchData.admin_notes || '',
        is_paused: matchData.is_paused || false,
        map_name: matchData.map_name || '',
        caster_name: matchData.caster_name || ''
      });
    }
    setLoading(false);
  };

  useEffect(() => { fetchWarRoomData(); }, [matchId]);

  // 2. "The Nuclear Option" - Auto Forfeit Logic
  const handleForfeit = (winner) => {
      const winnerName = winner === 1 ? match?.team1?.name || 'Team A' : match?.team2?.name || 'Team B';
      if(!window.confirm(`⚠️ DANGER: FORCE WIN\n\nAre you sure you want to award the win to ${winnerName}?\nThis will set the score to 1-0 and end the match.`)) return;
      
      setFormData(prev => ({
          ...prev,
          status: 'completed',
          team1_score: winner === 1 ? 1 : 0,
          team2_score: winner === 2 ? 1 : 0
      }));
  };

  // 3. Save Changes
  const handleSave = async () => {
    setSaving(true);
    
    // ✅ Convert Local Input back to UTC for DB
    let finalDate = formData.scheduled_at ? new Date(formData.scheduled_at).toISOString() : null;

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

    if (error) alert("Error updating match: " + error.message);
    else await fetchWarRoomData();
    setSaving(false);
  };

  if (loading) return <div className="p-10 text-center text-white animate-pulse">Accessing War Room...</div>;

  return (
    <div className="bg-[#0b0c0f] border border-zinc-700 rounded-xl overflow-hidden w-full max-w-6xl mx-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200">
      
      {/* HEADER */}
      <div className="bg-red-900/20 border-b border-red-500/30 p-4 flex justify-between items-center">
        <h2 className="text-xl font-black text-white italic uppercase tracking-tighter flex items-center gap-2">
          <Shield className="text-red-500" /> WAR ROOM: MATCH #{match.match_no}
        </h2>
        <div className="flex gap-2">
            <button onClick={fetchWarRoomData} className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded border border-zinc-700 transition-colors"><RefreshCw size={16}/></button>
            <button onClick={onClose} className="p-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded border border-zinc-700 transition-colors"><X size={16}/></button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
        
        {/* === LEFT COLUMN: CONTROLS === */}
        <div className="lg:col-span-2 p-6 space-y-8 border-r border-zinc-800 bg-[#0b0c0f]">
            
            {/* 1. SCOREBOARD & STATUS */}
            <div className={`grid grid-cols-3 items-center gap-4 p-4 rounded-lg border transition-all ${formData.is_paused ? 'bg-yellow-900/10 border-yellow-500/50' : 'bg-zinc-900/50 border-zinc-800'}`}>
                {/* Team A */}
                <div className="text-center">
                    <label className="text-[10px] text-fuchsia-500 font-bold uppercase mb-2 block">Team A (Home)</label>
                    <select 
                        value={formData.team1_id} onChange={e => setFormData({...formData, team1_id: e.target.value})}
                        className="w-full bg-black border border-zinc-700 text-white text-sm p-2 rounded mb-4 text-center font-bold outline-none focus:border-fuchsia-500"
                    >
                        {allTeams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                    <input type="number" value={formData.team1_score} onChange={e => setFormData({...formData, team1_score: e.target.value})} className="w-24 bg-black border border-zinc-600 text-4xl font-black text-white text-center p-2 rounded focus:border-fuchsia-500 outline-none"/>
                </div>

                {/* Status & Pause */}
                <div className="flex flex-col items-center gap-2">
                    <span className="text-zinc-600 font-black text-2xl">VS</span>
                    <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className={`w-full text-center text-xs font-bold uppercase p-2 rounded border outline-none ${formData.status === 'live' ? 'bg-red-900/50 text-red-500 border-red-500' : formData.status === 'completed' ? 'bg-green-900/50 text-green-500 border-green-500' : 'bg-zinc-800 text-zinc-400 border-zinc-600'}`}>
                        <option value="scheduled">Scheduled</option>
                        <option value="veto">Veto Phase</option>
                        <option value="live">🔴 LIVE</option>
                        <option value="completed">Completed</option>
                    </select>
                    
                    <button onClick={() => setFormData({...formData, is_paused: !formData.is_paused})} className={`mt-2 flex items-center gap-1 px-3 py-1 rounded text-[10px] font-bold uppercase border transition-all ${formData.is_paused ? 'bg-yellow-500 text-black border-yellow-500 animate-pulse' : 'bg-black text-zinc-500 border-zinc-800 hover:text-white'}`}>
                        {formData.is_paused ? <><PauseCircle size={12}/> MATCH PAUSED</> : <><PlayCircle size={12}/> Normal Flow</>}
                    </button>
                </div>

                {/* Team B */}
                <div className="text-center">
                    <label className="text-[10px] text-blue-500 font-bold uppercase mb-2 block">Team B (Away)</label>
                    <select value={formData.team2_id} onChange={e => setFormData({...formData, team2_id: e.target.value})} className="w-full bg-black border border-zinc-700 text-white text-sm p-2 rounded mb-4 text-center font-bold outline-none focus:border-blue-500">
                        {allTeams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                    <input type="number" value={formData.team2_score} onChange={e => setFormData({...formData, team2_score: e.target.value})} className="w-24 bg-black border border-zinc-600 text-4xl font-black text-white text-center p-2 rounded focus:border-blue-500 outline-none"/>
                </div>
            </div>

            {/* 2. SERVER & MAP */}
            <div className="grid grid-cols-2 gap-6">
                {/* Server */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2"><Server size={14} className="text-emerald-500" /> Connection</h3>
                    <div className="space-y-2">
                        <div className="relative">
                            <input value={formData.server_ip} onChange={e => setFormData({...formData, server_ip: e.target.value})} className="w-full bg-black border border-zinc-700 text-emerald-400 font-mono text-xs p-2 pl-2 rounded focus:border-emerald-500 outline-none" placeholder="connect 123.456.78.9:27015"/>
                            <button onClick={() => navigator.clipboard.writeText(formData.server_ip)} className="absolute right-2 top-2 text-zinc-600 hover:text-white"><Copy size={12}/></button>
                        </div>
                        <input value={formData.server_pass} onChange={e => setFormData({...formData, server_pass: e.target.value})} className="w-full bg-black border border-zinc-700 text-white font-mono text-xs p-2 rounded focus:border-emerald-500 outline-none" placeholder="rcon_password"/>
                        
                        <button onClick={() => setFormData({...formData, is_server_visible: !formData.is_server_visible})} className={`w-full py-2 rounded text-[10px] font-bold uppercase border transition-all ${formData.is_server_visible ? 'bg-emerald-900/30 border-emerald-500 text-emerald-500' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}>
                            {formData.is_server_visible ? <><Eye size={12} className="inline mr-1"/> Visible to Players</> : <><EyeOff size={12} className="inline mr-1"/> Hidden from Players</>}
                        </button>
                    </div>
                </div>

                {/* Map Override */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2"><MapIcon size={14} className="text-yellow-500" /> Map Override</h3>
                    <div className="space-y-2">
                        <select value={formData.map_name} onChange={e => setFormData({...formData, map_name: e.target.value})} className="w-full bg-black border border-zinc-700 text-white text-xs p-2 rounded outline-none focus:border-yellow-500">
                            <option value="">-- Auto (Veto) --</option>
                            {MAP_POOL.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <div className="p-2 bg-zinc-900 border border-zinc-800 rounded text-[10px] text-zinc-500 italic leading-tight">
                            * Selecting a map here overrides the Veto system results. Useful for manual agreements.
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. MEDIA & SCHEDULE */}
            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                    <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2"><Calendar size={14} className="text-blue-500" /> Schedule</h3>
                    <input type="datetime-local" value={formData.scheduled_at} onChange={e => setFormData({...formData, scheduled_at: e.target.value})} className="bg-black border border-zinc-700 text-white p-2 rounded text-xs w-full font-mono outline-none focus:border-blue-500"/>
                    <div className="text-[9px] text-zinc-600 italic">* Input in YOUR local time. Auto-converts to UTC.</div>
                </div>
                <div className="space-y-2">
                    <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2"><Tv size={14} className="text-purple-500" /> Production</h3>
                    <input value={formData.stream_url} onChange={e => setFormData({...formData, stream_url: e.target.value})} className="bg-black border border-zinc-700 text-white p-2 rounded text-xs w-full mb-1 outline-none focus:border-purple-500" placeholder="Stream URL (Twitch)"/>
                    <div className="flex items-center gap-2">
                        <Mic2 size={14} className="text-zinc-500"/>
                        <input value={formData.caster_name} onChange={e => setFormData({...formData, caster_name: e.target.value})} className="bg-black border border-zinc-700 text-white p-2 rounded text-xs w-full outline-none focus:border-purple-500" placeholder="Caster Name"/>
                    </div>
                </div>
            </div>
        </div>

        {/* === RIGHT COLUMN: LOGS & ACTIONS === */}
        <div className="p-6 bg-zinc-950/50 flex flex-col h-full border-l border-zinc-800">
            
            {/* Admin Logs */}
            <div className="mb-6">
                <h3 className="text-sm font-bold text-white uppercase mb-2 flex items-center gap-2"><StickyNote size={14} className="text-blue-500"/> Admin Log</h3>
                <textarea value={formData.admin_notes} onChange={e => setFormData({...formData, admin_notes: e.target.value})} className="w-full h-24 bg-yellow-900/5 border border-yellow-600/20 text-yellow-100 text-xs p-3 rounded resize-none focus:border-yellow-600 outline-none font-mono" placeholder="Internal notes (warnings, disputes, forfeit reasons)..."/>
            </div>

            {/* DANGER ZONE (Forfeits) */}
            <div className="mb-6 p-4 bg-red-950/10 border border-red-900/30 rounded relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-red-600/50"></div>
                <h3 className="text-[10px] font-black text-red-500 uppercase mb-2 flex items-center gap-1"><Skull size={12}/> Danger Zone: Force Win</h3>
                <div className="flex gap-2">
                    <button onClick={() => handleForfeit(1)} className="flex-1 py-2 bg-red-950 hover:bg-red-900 text-red-500 text-[9px] font-bold uppercase rounded border border-red-900/50 transition-colors">Win Team A</button>
                    <button onClick={() => handleForfeit(2)} className="flex-1 py-2 bg-red-950 hover:bg-red-900 text-red-500 text-[9px] font-bold uppercase rounded border border-red-900/50 transition-colors">Win Team B</button>
                </div>
            </div>

            {/* Veto History */}
            <h3 className="text-sm font-bold text-white uppercase mb-2">Veto History</h3>
            <div className="space-y-1 mb-4 overflow-y-auto flex-1 pr-1 scrollbar-thin max-h-[200px]">
                {vetoes.length === 0 ? <div className="text-center text-zinc-700 text-xs py-4 border border-dashed border-zinc-800 rounded">No veto data</div> : vetoes.map((v, i) => (
                    <div key={i} className="flex justify-between items-center text-[10px] p-2 bg-zinc-900 border border-zinc-800 rounded">
                        <span className={v.type==='BAN'?'text-red-500 font-bold':'text-emerald-500 font-bold'}>{v.type}</span>
                        <span className="text-white font-mono">{v.map_name}</span>
                        <span className="text-zinc-500">{v.team_id === match.team1_id ? 'TEAM A' : 'TEAM B'}</span>
                    </div>
                ))}
            </div>

            {/* Save Button */}
            <div className="space-y-4 pt-4 border-t border-zinc-800 mt-auto">
                <button onClick={handleSave} disabled={saving} className="w-full py-4 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold uppercase text-sm rounded shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95">
                    {saving ? <RefreshCw className="animate-spin"/> : <Save size={16}/>} Save War Room
                </button>
                <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-500">
                    <AlertTriangle size={12} className="text-yellow-600"/> Changes update public bracket instantly
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

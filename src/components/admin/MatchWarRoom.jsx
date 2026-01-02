import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase/client';
import { 
  Shield, RefreshCw, Server, Eye, EyeOff, Calendar, 
  Map as MapIcon, Save, AlertTriangle, X, Tv, FileCode, StickyNote, PauseCircle, PlayCircle
} from 'lucide-react';

// --- TIMEZONE HELPER ---
// Converts a UTC ISO string (from DB) to a "datetime-local" string (for Input)
const toLocalInputString = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    // Create a local date string in format YYYY-MM-DDTHH:MM suitable for input
    const offset = date.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(date - offset)).toISOString().slice(0, 16);
    return localISOTime;
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
    // NEW MASTER FIELDS
    stream_url: '',
    demo_url: '',
    admin_notes: '',
    is_paused: false
  });

  // 1. Fetch Data
  const fetchWarRoomData = async () => {
    setLoading(true);
    
    const { data: matchData } = await supabase
      .from('matches')
      .select(`*, team1:team1_id(id, name, logo_url), team2:team2_id(id, name, logo_url)`)
      .eq('id', matchId)
      .single();

    const { data: vetoData } = await supabase
      .from('match_veto')
      .select('*')
      .eq('match_id', matchId)
      .order('sequence_no', { ascending: true });

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
        // ✅ CONVERT UTC DB TIME -> LOCAL INPUT TIME
        scheduled_at: toLocalInputString(matchData.scheduled_at),
        team1_id: matchData.team1_id,
        team2_id: matchData.team2_id,
        stream_url: matchData.stream_url || '',
        demo_url: matchData.demo_url || '',
        admin_notes: matchData.admin_notes || '',
        is_paused: matchData.is_paused || false
      });
    }
    setLoading(false);
  };

  useEffect(() => { fetchWarRoomData(); }, [matchId]);

  // 2. Save Changes
  const handleSave = async () => {
    setSaving(true);
    
    // ✅ CONVERT LOCAL INPUT -> UTC FOR DB
    let finalDate = null;
    if (formData.scheduled_at) {
        finalDate = new Date(formData.scheduled_at).toISOString();
    }

    const { error } = await supabase.rpc('admin_update_match_state', {
      p_match_id: matchId,
      p_status: formData.status,
      p_team1_score: parseInt(formData.team1_score),
      p_team2_score: parseInt(formData.team2_score),
      p_server_ip: formData.server_ip,
      p_server_pass: formData.server_pass,
      p_is_visible: formData.is_server_visible,
      p_scheduled_at: finalDate, // Send UTC
      p_team1_id: formData.team1_id,
      p_team2_id: formData.team2_id,
      // NEW PARAMS
      p_stream_url: formData.stream_url,
      p_demo_url: formData.demo_url,
      p_admin_notes: formData.admin_notes,
      p_is_paused: formData.is_paused
    });

    if (error) alert("Error updating match: " + error.message);
    else {
        await fetchWarRoomData();
        // Optional: Close on save? Or keep open to monitor? keeping open is better for War Room.
    }
    setSaving(false);
  };

  if (loading) return <div className="p-10 text-center text-white animate-pulse">Accessing War Room...</div>;

  return (
    <div className="bg-[#0b0c0f] border border-zinc-700 rounded-xl overflow-hidden w-full max-w-6xl mx-auto shadow-2xl">
      {/* HEADER */}
      <div className="bg-red-900/20 border-b border-red-500/30 p-4 flex justify-between items-center">
        <h2 className="text-xl font-black text-white italic uppercase tracking-tighter flex items-center gap-2">
          <Shield className="text-red-500" /> WAR ROOM: MATCH #{match.match_no}
        </h2>
        <div className="flex gap-2">
            <button onClick={fetchWarRoomData} className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded border border-zinc-700"><RefreshCw size={16}/></button>
            <button onClick={onClose} className="p-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded border border-zinc-700"><X size={16}/></button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
        
        {/* LEFT COLUMN: LIVE CONTROL */}
        <div className="lg:col-span-2 p-6 space-y-8 border-r border-zinc-800 bg-[#0b0c0f]">
            
            {/* SCOREBOARD CONTROL */}
            <div className={`grid grid-cols-3 items-center gap-4 p-4 rounded-lg border transition-all ${formData.is_paused ? 'bg-yellow-900/20 border-yellow-500/50' : 'bg-zinc-900/50 border-zinc-800'}`}>
                <div className="text-center">
                    <label className="text-[10px] text-fuchsia-500 font-bold uppercase mb-2 block">Team A (Home)</label>
                    <select 
                        value={formData.team1_id} 
                        onChange={e => setFormData({...formData, team1_id: e.target.value})}
                        className="w-full bg-black border border-zinc-700 text-white text-sm p-2 rounded mb-4 text-center font-bold"
                    >
                        {allTeams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                    <input 
                        type="number" 
                        value={formData.team1_score} 
                        onChange={e => setFormData({...formData, team1_score: e.target.value})}
                        className="w-24 bg-black border border-zinc-600 text-4xl font-black text-white text-center p-2 rounded focus:border-fuchsia-500 outline-none"
                    />
                </div>

                <div className="flex flex-col items-center gap-2">
                    <span className="text-zinc-600 font-black text-2xl">VS</span>
                    <select 
                        value={formData.status} 
                        onChange={e => setFormData({...formData, status: e.target.value})}
                        className={`w-full text-center text-xs font-bold uppercase p-2 rounded border outline-none ${
                            formData.status === 'live' ? 'bg-red-900/50 text-red-500 border-red-500' : 
                            formData.status === 'completed' ? 'bg-green-900/50 text-green-500 border-green-500' : 
                            'bg-zinc-800 text-zinc-400 border-zinc-600'
                        }`}
                    >
                        <option value="scheduled">Scheduled</option>
                        <option value="veto">Veto Phase</option>
                        <option value="live">🔴 LIVE</option>
                        <option value="completed">Completed</option>
                    </select>

                    {/* PAUSE TOGGLE */}
                    <button 
                        onClick={() => setFormData({...formData, is_paused: !formData.is_paused})}
                        className={`mt-2 flex items-center gap-1 px-3 py-1 rounded text-[10px] font-bold uppercase border ${formData.is_paused ? 'bg-yellow-500 text-black border-yellow-500 animate-pulse' : 'bg-black text-zinc-500 border-zinc-800'}`}
                    >
                        {formData.is_paused ? <><PauseCircle size={12}/> MATCH PAUSED</> : <><PlayCircle size={12}/> Normal Flow</>}
                    </button>
                </div>

                <div className="text-center">
                    <label className="text-[10px] text-blue-500 font-bold uppercase mb-2 block">Team B (Away)</label>
                    <select 
                        value={formData.team2_id} 
                        onChange={e => setFormData({...formData, team2_id: e.target.value})}
                        className="w-full bg-black border border-zinc-700 text-white text-sm p-2 rounded mb-4 text-center font-bold"
                    >
                        {allTeams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                    <input 
                        type="number" 
                        value={formData.team2_score} 
                        onChange={e => setFormData({...formData, team2_score: e.target.value})}
                        className="w-24 bg-black border border-zinc-600 text-4xl font-black text-white text-center p-2 rounded focus:border-blue-500 outline-none"
                    />
                </div>
            </div>

            {/* SERVER INTELLIGENCE */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
                    <Server size={14} className="text-emerald-500" /> Connection Protocol
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] text-zinc-500 uppercase font-bold">Server IP:Port</label>
                        <input 
                            value={formData.server_ip} 
                            onChange={e => setFormData({...formData, server_ip: e.target.value})}
                            className="w-full bg-black border border-zinc-700 text-emerald-400 font-mono text-sm p-3 rounded"
                            placeholder="e.g. 192.168.1.1:27015"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] text-zinc-500 uppercase font-bold">RCON / Password</label>
                        <input 
                            value={formData.server_pass} 
                            onChange={e => setFormData({...formData, server_pass: e.target.value})}
                            className="w-full bg-black border border-zinc-700 text-white font-mono text-sm p-3 rounded"
                            placeholder="secret_pass"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-4 bg-zinc-900 p-3 rounded border border-zinc-800">
                    <button 
                        onClick={() => setFormData({...formData, is_server_visible: !formData.is_server_visible})}
                        className={`flex items-center gap-2 px-4 py-2 rounded text-xs font-bold uppercase transition-all ${
                            formData.is_server_visible ? 'bg-emerald-600 text-white shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'bg-zinc-800 text-zinc-500'
                        }`}
                    >
                        {formData.is_server_visible ? <><Eye size={14}/> Visible to Players</> : <><EyeOff size={14}/> Hidden from Players</>}
                    </button>
                    <span className="text-[10px] text-zinc-500">
                        * Only toggle ON when match is ready.
                    </span>
                </div>
            </div>

            {/* MEDIA & SCHEDULING ROW */}
            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                    <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
                        <Calendar size={14} className="text-yellow-500" /> Reschedule
                    </h3>
                    <input 
                        type="datetime-local"
                        value={formData.scheduled_at}
                        onChange={e => setFormData({...formData, scheduled_at: e.target.value})}
                        className="bg-black border border-zinc-700 text-white p-2 rounded text-sm w-full font-mono"
                    />
                    <div className="text-[9px] text-zinc-600 italic">
                        * Set in YOUR local time. System auto-converts for players.
                    </div>
                </div>

                <div className="space-y-2">
                    <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
                        <Tv size={14} className="text-purple-500" /> Broadcast & Replay
                    </h3>
                    <input 
                        value={formData.stream_url}
                        onChange={e => setFormData({...formData, stream_url: e.target.value})}
                        className="bg-black border border-zinc-700 text-white p-2 rounded text-xs w-full mb-1"
                        placeholder="Twitch/YouTube Stream URL"
                    />
                    <input 
                        value={formData.demo_url}
                        onChange={e => setFormData({...formData, demo_url: e.target.value})}
                        className="bg-black border border-zinc-700 text-white p-2 rounded text-xs w-full"
                        placeholder="Demo Download URL (After Match)"
                    />
                </div>
            </div>

        </div>

        {/* RIGHT COLUMN: LOGS & NOTES */}
        <div className="p-6 bg-zinc-950/50 flex flex-col h-full border-l border-zinc-800">
            
            {/* PRIVATE ADMIN LOG */}
            <div className="mb-6">
                <h3 className="text-sm font-bold text-white uppercase mb-2 flex items-center gap-2">
                    <StickyNote size={14} className="text-blue-500"/> Private Admin Notes
                </h3>
                <textarea 
                    value={formData.admin_notes}
                    onChange={e => setFormData({...formData, admin_notes: e.target.value})}
                    className="w-full h-32 bg-yellow-900/5 border border-yellow-600/20 text-yellow-100 text-xs p-3 rounded resize-none focus:border-yellow-600 outline-none font-mono"
                    placeholder="Internal logs only. Players cannot see this. e.g. 'Team A warned for delaying'."
                />
            </div>

            {/* VETO LOGS */}
            <h3 className="text-sm font-bold text-white uppercase mb-4 flex items-center gap-2">
                <MapIcon size={14} className="text-fuchsia-500"/> Veto History
            </h3>
            
            <div className="space-y-2 mb-8 overflow-y-auto flex-1 pr-2 scrollbar-thin max-h-[300px]">
                {vetoes.length === 0 ? (
                    <div className="text-center text-zinc-600 text-xs py-8 border border-dashed border-zinc-800 rounded">No veto actions yet.</div>
                ) : (
                    vetoes.map((v, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs p-2 bg-zinc-900 border border-zinc-800 rounded">
                            <span className="font-bold text-zinc-400 w-6">#{idx+1}</span>
                            <span className={v.type === 'BAN' ? 'text-red-500 font-bold' : 'text-emerald-500 font-bold'}>{v.type}</span>
                            <span className="text-white font-mono">{v.map_name}</span>
                            <span className="text-[10px] text-zinc-500 uppercase">{v.team_id === match.team1_id ? 'Team A' : 'Team B'}</span>
                        </div>
                    ))
                )}
            </div>

            <div className="space-y-4 pt-6 border-t border-zinc-800 mt-auto">
                <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full py-4 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold uppercase text-sm rounded shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                    {saving ? <RefreshCw className="animate-spin"/> : <Save size={16}/>}
                    Save War Room Changes
                </button>
                
                <div className="p-3 bg-yellow-900/10 border border-yellow-600/20 rounded text-[10px] text-yellow-500 flex gap-2">
                    <AlertTriangle size={14} className="shrink-0" />
                    Changes update the bracket instantly.
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

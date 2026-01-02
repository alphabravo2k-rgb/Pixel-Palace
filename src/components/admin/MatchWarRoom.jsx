import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase/client';
import { 
  Shield, RefreshCw, Server, Eye, EyeOff, Calendar, 
  Clock, Map as MapIcon, Save, RotateCcw, AlertTriangle, Users 
} from 'lucide-react';

// Helpers
const formatDate = (dateStr) => {
  if(!dateStr) return 'Unscheduled';
  return new Date(dateStr).toLocaleString('en-US', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' });
};

export const MatchWarRoom = ({ matchId, onClose }) => {
  const [match, setMatch] = useState(null);
  const [vetoes, setVetoes] = useState([]);
  const [allTeams, setAllTeams] = useState([]); // For swapping
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
    team2_id: ''
  });

  // 1. Fetch Data
  const fetchWarRoomData = async () => {
    setLoading(true);
    
    // Get Match Data
    const { data: matchData } = await supabase
      .from('matches')
      .select(`*, team1:team1_id(id, name, logo_url), team2:team2_id(id, name, logo_url)`)
      .eq('id', matchId)
      .single();

    // Get Veto History (Admin needs to see this!)
    const { data: vetoData } = await supabase
      .from('match_veto')
      .select('*')
      .eq('match_id', matchId)
      .order('sequence_no', { ascending: true });

    // Get All Teams (For swapping/byes)
    const { data: teamList } = await supabase
      .from('teams')
      .select('id, name')
      .order('name');

    if (matchData) {
      setMatch(matchData);
      setVetoes(vetoData || []);
      setAllTeams(teamList || []);
      
      // Init Form
      setFormData({
        status: matchData.status,
        team1_score: matchData.team1_score,
        team2_score: matchData.team2_score,
        server_ip: matchData.server_ip || '',
        server_pass: matchData.server_pass || '',
        is_server_visible: matchData.is_server_visible || false,
        scheduled_at: matchData.scheduled_at || '',
        team1_id: matchData.team1_id,
        team2_id: matchData.team2_id
      });
    }
    setLoading(false);
  };

  useEffect(() => { fetchWarRoomData(); }, [matchId]);

  // 2. Save Changes
  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.rpc('admin_update_match_state', {
      p_match_id: matchId,
      p_status: formData.status,
      p_team1_score: parseInt(formData.team1_score),
      p_team2_score: parseInt(formData.team2_score),
      p_server_ip: formData.server_ip,
      p_server_pass: formData.server_pass,
      p_is_visible: formData.is_server_visible,
      p_scheduled_at: formData.scheduled_at || null,
      p_team1_id: formData.team1_id,
      p_team2_id: formData.team2_id
    });

    if (error) alert("Error updating match: " + error.message);
    else {
        await fetchWarRoomData();
        alert("War Room Updated Successfully");
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
            <button onClick={onClose} className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold uppercase rounded border border-zinc-700">Close</button>
        </div>
      </div>

      <div className="grid grid-cols-1lg:grid-cols-3 gap-0">
        
        {/* LEFT COLUMN: LIVE CONTROL */}
        <div className="col-span-2 p-6 space-y-8 border-r border-zinc-800">
            
            {/* SCOREBOARD CONTROL */}
            <div className="grid grid-cols-3 items-center gap-4 bg-zinc-900/50 p-4 rounded-lg border border-zinc-800">
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
                        * Only toggle ON when match is ready to start.
                    </span>
                </div>
            </div>

            {/* SCHEDULING */}
            <div className="space-y-2">
                <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
                    <Calendar size={14} className="text-yellow-500" /> Reschedule
                </h3>
                <input 
                    type="datetime-local"
                    value={formData.scheduled_at ? new Date(formData.scheduled_at).toISOString().slice(0, 16) : ''}
                    onChange={e => setFormData({...formData, scheduled_at: e.target.value})}
                    className="bg-black border border-zinc-700 text-white p-2 rounded text-sm w-full font-mono"
                />
            </div>

        </div>

        {/* RIGHT COLUMN: VETO LOGS & ACTIONS */}
        <div className="p-6 bg-zinc-950/50">
            <h3 className="text-sm font-bold text-white uppercase mb-4 flex items-center gap-2">
                <MapIcon size={14} className="text-fuchsia-500"/> Veto Logs
            </h3>
            
            <div className="space-y-2 mb-8 overflow-y-auto max-h-[300px] pr-2 scrollbar-thin">
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

            <div className="space-y-4 pt-6 border-t border-zinc-800">
                <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full py-4 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold uppercase text-sm rounded shadow-lg flex items-center justify-center gap-2"
                >
                    {saving ? <RefreshCw className="animate-spin"/> : <Save size={16}/>}
                    Save War Room Changes
                </button>
                
                <div className="p-3 bg-yellow-900/10 border border-yellow-600/20 rounded text-[10px] text-yellow-500 flex gap-2">
                    <AlertTriangle size={14} className="shrink-0" />
                    Changing scores or teams here updates the public bracket immediately. Use with caution.
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase/client';
import { useSession } from '../../auth/useSession';
import { Ban, CheckCircle, Clock, Check } from 'lucide-react';

const MAP_POOL = [
  { id: 'de_mirage', name: 'Mirage', img: 'https://img.youtube.com/vi/F91V3V6Qh6U/maxresdefault.jpg' },
  { id: 'de_inferno', name: 'Inferno', img: 'https://blob.faceit.com/static/img/maps/cs2/inferno_bg.jpg' },
  { id: 'de_nuke', name: 'Nuke', img: 'https://blob.faceit.com/static/img/maps/cs2/nuke_bg.jpg' },
  { id: 'de_overpass', name: 'Overpass', img: 'https://blob.faceit.com/static/img/maps/cs2/overpass_bg.jpg' },
  { id: 'de_vertigo', name: 'Vertigo', img: 'https://blob.faceit.com/static/img/maps/cs2/vertigo_bg.jpg' },
  { id: 'de_ancient', name: 'Ancient', img: 'https://blob.faceit.com/static/img/maps/cs2/ancient_bg.jpg' },
  { id: 'de_anubis', name: 'Anubis', img: 'https://blob.faceit.com/static/img/maps/cs2/anubis_bg.jpg' },
  { id: 'de_dust2', name: 'Dust 2', img: 'https://blob.faceit.com/static/img/maps/cs2/dust2_bg.jpg' }
];

export const VetoController = ({ match, onUpdate }) => {
  const { session } = useSession();
  const [vetoLog, setVetoLog] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
        const { data } = await supabase.from('match_vetoes').select('*').eq('match_id', match.id).order('pick_order');
        setVetoLog(data || []);
    };
    fetch();
    const sub = supabase.channel(`veto-${match.id}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'match_vetoes', filter: `match_id=eq.${match.id}` }, p => {
        setVetoLog(prev => [...prev, p.new]);
        if(onUpdate) onUpdate();
    }).subscribe();
    return () => supabase.removeChannel(sub);
  }, [match.id]);

  const totalSteps = match.best_of === 3 ? 6 : 6; 
  const isComplete = vetoLog.length >= totalSteps;
  const turnTeamId = vetoLog.length % 2 === 0 ? match.team1_id : match.team2_id;
  const isMyTurn = session?.identity?.team_id === turnTeamId;

  const handleVeto = async (mapId) => {
    if (!isMyTurn || loading) return;
    if(!window.confirm(`BAN ${mapId}?`)) return;
    setLoading(true);
    try {
        const { error } = await supabase.rpc('api_submit_veto', { p_match_id: match.id, p_map_name: mapId, p_type: 'BAN' });
        if(error) throw error;
    } catch(e) { alert(e.message); } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4">
       <div className={`p-4 rounded-lg border flex items-center justify-between ${isComplete ? 'bg-green-900/20 border-green-500/30' : isMyTurn ? 'bg-fuchsia-900/20 border-fuchsia-500 animate-pulse' : 'bg-zinc-900 border-zinc-800'}`}>
          <div className="flex items-center gap-3">
             {isComplete ? <CheckCircle className="text-green-500"/> : <Clock className={isMyTurn ? "text-fuchsia-500" : "text-zinc-500"}/>}
             <div>
                <h3 className="text-lg font-bold text-white uppercase leading-none">{isComplete ? "Veto Complete" : isMyTurn ? "Your Turn to BAN" : "Opponent's Turn"}</h3>
             </div>
          </div>
       </div>
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {MAP_POOL.map(map => {
             const status = vetoLog.find(v => v.map_name === map.id);
             const isBanned = status?.type === 'BAN';
             return (
               <button key={map.id} disabled={!!status || !isMyTurn || isComplete} onClick={() => handleVeto(map.id)} className={`relative h-32 rounded-xl overflow-hidden border-2 transition-all ${isBanned ? 'border-red-900 opacity-40 grayscale' : 'border-zinc-800'} ${!status && isMyTurn ? 'hover:border-fuchsia-500 hover:scale-105 cursor-pointer' : ''}`}>
                  <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${map.img})` }} />
                  <div className="absolute inset-0 bg-black/60 hover:bg-black/40 transition-colors" />
                  <div className="absolute bottom-3 left-3 text-white font-black text-lg uppercase tracking-widest font-['Teko']">{map.name}</div>
                  {isBanned && <div className="absolute inset-0 flex items-center justify-center bg-black/50"><Ban className="w-12 h-12 text-red-600 rotate-12"/></div>}
               </button>
             );
          })}
       </div>
    </div>
  );
};

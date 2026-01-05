import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase/client';
import { useSession } from '../../auth/useSession';
import { 
    Ban, CheckCircle, Clock, Lock, Trophy, Loader2, 
    Flame, Sun, Building2, Radiation, Leaf, Tornado, Skull 
} from 'lucide-react';
import { MATCH_FORMATS } from '../../lib/constants';

// ✅ SYNCHRONIZED MAP POOL (Vertigo + Anubis)
const MAP_POOL = [
  { id: 'de_mirage', name: 'Mirage', icon: Building2, color: 'text-amber-400', border: 'hover:border-amber-400', glow: 'shadow-amber-500/20' },
  { id: 'de_inferno', name: 'Inferno', icon: Flame, color: 'text-red-500', border: 'hover:border-red-500', glow: 'shadow-red-500/20' },
  { id: 'de_nuke', name: 'Nuke', icon: Radiation, color: 'text-sky-400', border: 'hover:border-sky-400', glow: 'shadow-sky-500/20' },
  { id: 'de_vertigo', name: 'Vertigo', icon: Tornado, color: 'text-zinc-300', border: 'hover:border-zinc-300', glow: 'shadow-zinc-500/20' },
  { id: 'de_ancient', name: 'Ancient', icon: Leaf, color: 'text-green-400', border: 'hover:border-green-400', glow: 'shadow-green-500/20' },
  { id: 'de_anubis', name: 'Anubis', icon: Skull, color: 'text-yellow-600', border: 'hover:border-yellow-600', glow: 'shadow-yellow-600/20' },
  { id: 'de_dust2', name: 'Dust 2', icon: Sun, color: 'text-yellow-400', border: 'hover:border-yellow-400', glow: 'shadow-yellow-500/20' }
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

  // Logic Engine
  const bestOf = match.best_of || 1; 
  // Map "1", "3", "5" to "BO1", "BO3", "BO5" keys in constants
  const formatKey = `BO${bestOf}`;
  const sequence = MATCH_FORMATS[formatKey]?.sequence || MATCH_FORMATS.BO1.sequence;
  
  const currentStepIndex = vetoLog.length;
  const isComplete = currentStepIndex >= sequence.length;
  const currentStepData = !isComplete ? sequence[currentStepIndex] : null;
  const currentAction = currentStepData?.type || 'WAIT';
  const currentActorTeamId = currentStepData ? match[`${currentStepData.team.toLowerCase() === 'team1' ? 'team1' : 'team2'}_id`] : null; // Handle 'team1'/'team2' strings safely
  
  const myTeamId = session?.identity?.team_id || session?.team_id; 
  const isMyTurn = myTeamId === currentActorTeamId && !isComplete;

  const handleAction = async (mapId) => {
    if (loading || !isMyTurn) return;
    const actionText = currentAction === 'BAN' ? "BAN" : "PICK";
    if (!window.confirm(`Confirm: ${actionText} ${MAP_POOL.find(m=>m.id===mapId)?.name}?`)) return;
    
    setLoading(true);
    try {
        const { error } = await supabase.rpc('api_submit_veto', { 
            p_match_id: match.id, p_map_name: mapId, p_type: currentAction 
        });
        if(error) throw error;
    } catch(e) { alert(e.message); } finally { setLoading(false); }
  };

  const getMapStatus = (mapId) => {
    const entry = vetoLog.find(v => v.map_name === mapId);
    if (entry) return entry.type; 
    return 'AVAILABLE';
  };

  if (isComplete) {
     const pickedMaps = vetoLog.filter(v => v.type === 'PICK').map(v => v.map_name);
     const bannedMaps = vetoLog.filter(v => v.type === 'BAN').map(v => v.map_name);
     const deciderId = MAP_POOL.find(m => !pickedMaps.includes(m.id) && !bannedMaps.includes(m.id))?.id;
     let finalMapIds = bestOf === 1 ? [deciderId] : [...pickedMaps, deciderId];
     const displayMaps = finalMapIds.filter(id=>id).map(id => MAP_POOL.find(m => m.id === id));

     return (
        <div className="text-center p-8 bg-emerald-950/20 border border-emerald-500/20 rounded-xl animate-in fade-in">
            <Trophy className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-white uppercase tracking-widest font-display">Veto Complete</h3>
            <div className="flex justify-center gap-4 flex-wrap mt-6">
                {displayMaps.map((m, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                        <div className={`w-40 h-24 rounded-lg bg-black border border-emerald-500 relative flex items-center justify-center shadow-lg`}>
                             <m.icon className={`w-10 h-10 ${m.color}`} />
                             <span className="absolute bottom-2 text-white font-black uppercase text-sm">{m?.name}</span>
                             {bestOf > 1 && <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">MAP {idx + 1}</div>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
     );
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-2">
       <div className={`p-4 rounded-xl border flex items-center justify-between transition-all duration-500 ${isMyTurn ? "bg-fuchsia-900/10 border-fuchsia-500 shadow-lg" : "bg-zinc-950 border-zinc-800 opacity-60"}`}>
          <div className="flex items-center gap-4">
             <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${isMyTurn ? "border-fuchsia-500 text-fuchsia-400 animate-pulse" : "border-zinc-700 text-zinc-600"}`}>
                {loading ? <Loader2 className="animate-spin" /> : isMyTurn ? <Clock size={24} /> : <Lock size={24} />}
             </div>
             <div>
                <h3 className={`text-xl font-black uppercase leading-none font-display ${isMyTurn ? "text-white" : "text-zinc-500"}`}>
                    {isMyTurn ? `Your Turn to ${currentAction}` : `Opponent is ${currentAction}ING...`}
                </h3>
             </div>
          </div>
       </div>
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {MAP_POOL.map(map => {
             const status = getMapStatus(map.id);
             const isBanned = status === 'BAN';
             const isPicked = status === 'PICK';
             const isAvailable = status === 'AVAILABLE';
             const Icon = map.icon;
             
             return (
               <button key={map.id} disabled={!isAvailable || !isMyTurn || loading} onClick={() => handleAction(map.id)}
                 className={`relative h-28 rounded-xl border-2 transition-all duration-300 group flex flex-col items-center justify-center gap-2 bg-black/40
                    ${isBanned ? 'border-red-900/30 opacity-30 grayscale cursor-not-allowed' : ''}
                    ${isPicked ? 'border-emerald-500 shadow-lg bg-emerald-900/10' : ''}
                    ${isAvailable ? `border-zinc-800 ${map.border}` : ''}
                    ${isAvailable && isMyTurn ? `hover:scale-[1.03] cursor-pointer hover:shadow-lg ${map.glow}` : ''}`}
               >
                 <Icon className={`w-8 h-8 ${map.color} transition-transform group-hover:scale-110 duration-300`} />
                 <span className="text-white font-black text-lg uppercase tracking-widest font-display">{map.name}</span>
                 {isBanned && <div className="absolute inset-0 flex items-center justify-center bg-black/60"><Ban className="w-10 h-10 text-red-600 rotate-12"/></div>}
                 {isPicked && <div className="absolute inset-0 flex items-center justify-center"><CheckCircle className="w-10 h-10 text-emerald-500"/></div>}
                 {isAvailable && isMyTurn && <div className={`absolute bottom-2 text-[9px] font-bold uppercase opacity-0 group-hover:opacity-100 transition-opacity ${currentAction === 'BAN' ? 'text-red-400' : 'text-emerald-400'}`}>Click to {currentAction}</div>}
               </button>
             );
          })}
       </div>
    </div>
  );
};

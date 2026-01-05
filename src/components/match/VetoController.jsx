import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase/client';
import { useSession } from '../../auth/useSession';
import { 
    Ban, CheckCircle, Clock, Lock, Trophy, Loader2, 
    Flame, Sun, Building2, Radiation, Leaf, TrainFront, Bridge 
} from 'lucide-react';

// ✅ FINAL POOL: Exactly 7 Maps (Matches your HTML Registration Form)
const MAP_POOL = [
  { id: 'de_mirage', name: 'Mirage', icon: Building2, color: 'text-amber-400', border: 'hover:border-amber-400', glow: 'shadow-amber-500/20' },
  { id: 'de_inferno', name: 'Inferno', icon: Flame, color: 'text-red-500', border: 'hover:border-red-500', glow: 'shadow-red-500/20' },
  { id: 'de_nuke', name: 'Nuke', icon: Radiation, color: 'text-sky-400', border: 'hover:border-sky-400', glow: 'shadow-sky-500/20' },
  { id: 'de_overpass', name: 'Overpass', icon: Bridge, color: 'text-gray-400', border: 'hover:border-gray-400', glow: 'shadow-gray-500/20' },
  { id: 'de_train', name: 'Train', icon: TrainFront, color: 'text-zinc-300', border: 'hover:border-zinc-300', glow: 'shadow-zinc-500/20' },
  { id: 'de_ancient', name: 'Ancient', icon: Leaf, color: 'text-green-400', border: 'hover:border-green-400', glow: 'shadow-green-500/20' },
  { id: 'de_dust2', name: 'Dust 2', icon: Sun, color: 'text-yellow-400', border: 'hover:border-yellow-400', glow: 'shadow-yellow-500/20' }
];

// ✅ LOGIC: Custom Rules for BO1 / BO3 / BO5
const VETO_SEQUENCES = {
    1: [
        { type: 'BAN', team: 'team1' }, { type: 'BAN', team: 'team1' },
        { type: 'BAN', team: 'team2' }, { type: 'BAN', team: 'team2' }, { type: 'BAN', team: 'team2' },
        { type: 'BAN', team: 'team1' }
    ],
    3: [
        { type: 'BAN', team: 'team1' }, { type: 'BAN', team: 'team2' },
        { type: 'PICK', team: 'team1' }, { type: 'PICK', team: 'team2' },
        { type: 'BAN', team: 'team2' }, { type: 'BAN', team: 'team1' }
    ],
    5: [
        { type: 'BAN', team: 'team1' }, { type: 'BAN', team: 'team2' },
        { type: 'PICK', team: 'team1' }, { type: 'PICK', team: 'team2' },
        { type: 'PICK', team: 'team1' }, { type: 'PICK', team: 'team2' }
    ]
};

export const VetoController = ({ match, onUpdate }) => {
  const { session } = useSession();
  const [vetoLog, setVetoLog] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. Subscribe to Live Data
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

  // 2. Logic Engine
  const bestOf = match.best_of || 1; 
  const sequence = VETO_SEQUENCES[bestOf] || VETO_SEQUENCES[1];
  const currentStepIndex = vetoLog.length;
  const isComplete = currentStepIndex >= sequence.length;

  const currentStepData = !isComplete ? sequence[currentStepIndex] : null;
  const currentAction = currentStepData?.type || 'WAIT';
  const currentActorTeamId = currentStepData ? match[`${currentStepData.team}_id`] : null;
  
  const myTeamId = session?.identity?.team_id || session?.team_id; 
  const isMyTurn = myTeamId === currentActorTeamId && !isComplete;

  // 3. Action Handler
  const handleAction = async (mapId) => {
    if (loading || !isMyTurn) return;
    
    const actionText = currentAction === 'BAN' ? "BAN" : "PICK";
    const mapName = MAP_POOL.find(m => m.id === mapId)?.name;
    if (!window.confirm(`Confirm: ${actionText} ${mapName}?`)) return;
    
    setLoading(true);
    try {
        const { error } = await supabase.rpc('api_submit_veto', { 
            p_match_id: match.id, 
            p_map_name: mapId, 
            p_type: currentAction 
        });
        if(error) throw error;
    } catch(e) { alert(e.message); } finally { setLoading(false); }
  };

  const getMapStatus = (mapId) => {
    const entry = vetoLog.find(v => v.map_name === mapId);
    if (entry) return entry.type; 
    return 'AVAILABLE';
  };

  // --- RENDER: COMPLETE ---
  if (isComplete) {
     const pickedMaps = vetoLog.filter(v => v.type === 'PICK').map(v => v.map_name);
     const bannedMaps = vetoLog.filter(v => v.type === 'BAN').map(v => v.map_name);
     const deciderId = MAP_POOL.find(m => !pickedMaps.includes(m.id) && !bannedMaps.includes(m.id))?.id;
     
     let finalMapIds = bestOf === 1 ? [deciderId] : [...pickedMaps, deciderId];
     const displayMaps = finalMapIds.filter(id=>id).map(id => MAP_POOL.find(m => m.id === id));

     return (
        <div className="text-center p-8 bg-emerald-950/20 border border-emerald-500/20 rounded-xl animate-in fade-in">
            <Trophy className="w-16 h-16 text-emerald-500 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
            <h3 className="text-2xl font-black text-white uppercase tracking-widest font-['Teko']">Veto Complete</h3>
            <div className="flex justify-center gap-4 flex-wrap mt-6">
                {displayMaps.map((m, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                        <div className={`w-40 h-24 rounded-lg bg-black border border-emerald-500 relative flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.2)]`}>
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

  // --- RENDER: ACTIVE ---
  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-2">
       
       <div className={`p-4 rounded-xl border flex items-center justify-between transition-all duration-500 ${isMyTurn ? "bg-fuchsia-900/10 border-fuchsia-500 shadow-[0_0_20px_rgba(192,38,211,0.15)]" : "bg-zinc-950 border-zinc-800 opacity-60 grayscale"}`}>
          <div className="flex items-center gap-4">
             <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${isMyTurn ? "bg-fuchsia-500/10 border-fuchsia-500 text-fuchsia-400 animate-pulse" : "bg-zinc-900 border-zinc-700 text-zinc-600"}`}>
                {loading ? <Loader2 className="animate-spin" /> : isMyTurn ? <Clock size={24} /> : <Lock size={24} />}
             </div>
             <div>
                <h3 className={`text-xl font-black uppercase leading-none font-['Teko'] tracking-wide ${isMyTurn ? "text-white" : "text-zinc-500"}`}>
                    {isMyTurn ? `Your Turn to ${currentAction}` : `Opponent is ${currentAction}ING...`}
                </h3>
                <p className="text-xs font-mono mt-1 uppercase tracking-wider text-zinc-400">
                    Step {currentStepIndex + 1} of {sequence.length} • {currentAction === 'BAN' ? 'Remove a map' : 'Pick a map'}
                </p>
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
                 className={`
                    relative h-28 rounded-xl border-2 transition-all duration-300 group flex flex-col items-center justify-center gap-2 bg-black/40
                    ${isBanned ? 'border-red-900/30 opacity-30 grayscale cursor-not-allowed' : ''}
                    ${isPicked ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)] bg-emerald-900/10' : ''}
                    ${isAvailable ? `border-zinc-800 ${map.border}` : ''}
                    ${isAvailable && isMyTurn ? `hover:scale-[1.03] cursor-pointer hover:shadow-lg ${map.glow}` : ''}
                 `}
               >
                 <Icon className={`w-8 h-8 ${map.color} transition-transform group-hover:scale-110 duration-300`} />
                 <span className="text-white font-black text-lg uppercase tracking-widest font-['Teko']">{map.name}</span>

                 {/* Status Overlay */}
                 {isBanned && <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[1px]"><Ban className="w-10 h-10 text-red-600 rotate-12"/></div>}
                 {isPicked && <div className="absolute inset-0 flex items-center justify-center"><CheckCircle className="w-10 h-10 text-emerald-500"/></div>}
                 
                 {/* Hover Action Text */}
                 {isAvailable && isMyTurn && (
                     <div className={`absolute bottom-2 text-[9px] font-bold uppercase opacity-0 group-hover:opacity-100 transition-opacity ${currentAction === 'BAN' ? 'text-red-400' : 'text-emerald-400'}`}>
                        Click to {currentAction}
                     </div>
                 )}
               </button>
             );
          })}
       </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase/client';
import { useSession } from '../../auth/useSession';
import { Ban, CheckCircle, Clock, Lock, Trophy, Loader2, Check } from 'lucide-react';

// ✅ RELIABLE IMAGE SOURCE (Liquipedia/Wiki) - Matches your Registration Form Pool
const MAP_POOL = [
  { id: 'de_mirage', name: 'Mirage', img: 'https://liquipedia.net/commons/images/f/f3/Csgo_mirage.jpg' },
  { id: 'de_inferno', name: 'Inferno', img: 'https://liquipedia.net/commons/images/2/2b/De_inferno_cs2.jpg' },
  { id: 'de_nuke', name: 'Nuke', img: 'https://liquipedia.net/commons/images/5/5e/Nuke_cs2.jpg' },
  { id: 'de_overpass', name: 'Overpass', img: 'https://liquipedia.net/commons/images/0/0f/Cs2_overpass.jpg' },
  { id: 'de_train', name: 'Train', img: 'https://liquipedia.net/commons/images/5/56/Train_cs2.jpg' },
  { id: 'de_ancient', name: 'Ancient', img: 'https://liquipedia.net/commons/images/d/d9/Ancient_cs2.jpg' },
  { id: 'de_dust2', name: 'Dust 2', img: 'https://liquipedia.net/commons/images/1/12/Dust2_cs2.jpg' }
];

// ✅ TOURNAMENT RULES (Custom Veto Sequences)
const VETO_SEQUENCES = {
    // BO1: A Bans 2 -> B Bans 3 -> A Bans 1 -> Leftover
    1: [
        { type: 'BAN', team: 'team1' },
        { type: 'BAN', team: 'team1' },
        { type: 'BAN', team: 'team2' },
        { type: 'BAN', team: 'team2' },
        { type: 'BAN', team: 'team2' },
        { type: 'BAN', team: 'team1' }
    ],
    // BO3: A Ban -> B Ban -> A Pick -> B Pick -> B Ban -> A Ban -> Decider
    3: [
        { type: 'BAN', team: 'team1' },
        { type: 'BAN', team: 'team2' },
        { type: 'PICK', team: 'team1' },
        { type: 'PICK', team: 'team2' },
        { type: 'BAN', team: 'team2' },
        { type: 'BAN', team: 'team1' }
    ],
    // BO5: A Ban -> B Ban -> A Pick -> B Pick -> A Pick -> B Pick -> Decider
    5: [
        { type: 'BAN', team: 'team1' },
        { type: 'BAN', team: 'team2' },
        { type: 'PICK', team: 'team1' },
        { type: 'PICK', team: 'team2' },
        { type: 'PICK', team: 'team1' },
        { type: 'PICK', team: 'team2' }
    ]
};

export const VetoController = ({ match, onUpdate }) => {
  const { session } = useSession();
  const [vetoLog, setVetoLog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hoveredMap, setHoveredMap] = useState(null);

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

  const bestOf = match.best_of || 1; 
  const sequence = VETO_SEQUENCES[bestOf] || VETO_SEQUENCES[1];
  const currentStepIndex = vetoLog.length;
  const isComplete = currentStepIndex >= sequence.length;

  // Determine Current State
  const currentStepData = !isComplete ? sequence[currentStepIndex] : null;
  const currentAction = currentStepData?.type || 'WAIT';
  const currentActorTeamId = currentStepData ? match[`${currentStepData.team}_id`] : null;
  
  const myTeamId = session?.identity?.team_id || session?.team_id; 
  const isMyTurn = myTeamId === currentActorTeamId && !isComplete;

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

  // --- RENDER COMPLETION ---
  if (isComplete) {
     const pickedMaps = vetoLog.filter(v => v.type === 'PICK').map(v => v.map_name);
     const bannedMaps = vetoLog.filter(v => v.type === 'BAN').map(v => v.map_name);
     const deciderId = MAP_POOL.find(m => !pickedMaps.includes(m.id) && !bannedMaps.includes(m.id))?.id;
     
     let finalMapIds = [];
     if (bestOf === 1) finalMapIds = [deciderId];
     else finalMapIds = [...pickedMaps, deciderId];

     const displayMaps = finalMapIds.filter(id=>id).map(id => MAP_POOL.find(m => m.id === id));

     return (
        <div className="text-center p-8 bg-emerald-950/20 border border-emerald-500/20 rounded-xl animate-in fade-in slide-in-from-bottom-4">
            <Trophy className="w-16 h-16 text-emerald-500 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
            <h3 className="text-2xl font-black text-white uppercase tracking-widest font-['Teko']">Veto Complete</h3>
            <p className="text-emerald-400/60 font-mono text-sm uppercase tracking-wider mb-6">
                {bestOf === 1 ? "Battlefield Selected" : "Map Rotation Set"}
            </p>
            <div className="flex justify-center gap-6 flex-wrap">
                {displayMaps.map((m, idx) => (
                    <div key={idx} className="flex flex-col items-center group animate-in zoom-in duration-500" style={{ animationDelay: `${idx * 150}ms` }}>
                        <div className="w-48 h-28 rounded-lg overflow-hidden border-2 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] relative transition-transform group-hover:scale-105">
                             <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${m?.img})` }} />
                             <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                             <span className="absolute bottom-2 left-0 right-0 text-center text-white font-black text-xl uppercase tracking-wider font-['Teko'] drop-shadow-md">{m?.name}</span>
                             {bestOf > 1 && <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-lg">MAP {idx + 1}</div>}
                        </div>
                        <span className="text-[10px] text-zinc-500 mt-2 font-mono uppercase">
                            {bestOf === 1 ? "Team B picks side" : "Knife for Side"}
                        </span>
                    </div>
                ))}
            </div>
        </div>
     );
  }

  // --- RENDER ACTIVE GAME ---
  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-2">
       
       {/* STATUS BAR */}
       <div className={`p-4 rounded-xl border flex items-center justify-between transition-all duration-500 ${isMyTurn ? "bg-zinc-900 border-fuchsia-500 shadow-[0_0_20px_rgba(192,38,211,0.15)]" : "bg-zinc-950 border-zinc-800 opacity-60 grayscale"}`}>
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

       {/* MAP GRID */}
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {MAP_POOL.map(map => {
             const status = getMapStatus(map.id);
             const isBanned = status === 'BAN';
             const isPicked = status === 'PICK';
             const isAvailable = status === 'AVAILABLE';
             
             let borderClass = "border-zinc-800";
             let contentClass = "opacity-100";
             
             if (isBanned) {
                 borderClass = "border-red-900/50";
                 contentClass = "opacity-20 grayscale";
             } else if (isPicked) {
                 borderClass = "border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]";
             } else if (isAvailable && isMyTurn) {
                 borderClass = currentAction === 'BAN' ? "hover:border-red-500 cursor-pointer" : "hover:border-emerald-500 cursor-pointer";
             }

             return (
               <button key={map.id} disabled={!isAvailable || !isMyTurn || loading} onClick={() => handleAction(map.id)}
                 onMouseEnter={() => setHoveredMap(map.id)} onMouseLeave={() => setHoveredMap(null)}
                 className={`relative h-32 md:h-40 rounded-xl overflow-hidden border-2 transition-all duration-300 group ${borderClass} ${contentClass} ${isAvailable && isMyTurn ? 'hover:scale-[1.02]' : ''}`}
               >
                 <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url(${map.img})` }} />
                 <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-colors" />
                 <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black via-black/80 to-transparent">
                     <span className="text-white font-black text-xl uppercase tracking-widest font-['Teko'] drop-shadow-md">{map.name}</span>
                 </div>
                 <div className="absolute inset-0 flex items-center justify-center">
                     {isBanned && <Ban className="w-14 h-14 text-red-600 rotate-12 drop-shadow-lg" />}
                     {isPicked && <CheckCircle className="w-14 h-14 text-emerald-500 drop-shadow-lg" />}
                     {isAvailable && isMyTurn && hoveredMap === map.id && (
                         <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-xl animate-in zoom-in ${currentAction === 'BAN' ? "bg-red-600 text-white" : "bg-emerald-600 text-white"}`}>
                            {currentAction}
                         </div>
                     )}
                 </div>
               </button>
             );
          })}
       </div>
    </div>
  );
};

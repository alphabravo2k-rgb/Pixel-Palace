import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase/client';
import { useSession } from '../../auth/useSession';
import { Ban, CheckCircle, Clock, AlertTriangle, Check } from 'lucide-react';

// Hardcoded Map Pool (Ideally fetch from DB/Config)
const MAP_POOL = [
  { id: 'de_mirage', name: 'Mirage', img: 'https://img.youtube.com/vi/F91V3V6Qh6U/maxresdefault.jpg' },
  { id: 'de_inferno', name: 'Inferno', img: 'https://blob.faceit.com/static/img/maps/cs2/inferno_bg.jpg' },
  { id: 'de_nuke', name: 'Nuke', img: 'https://blob.faceit.com/static/img/maps/cs2/nuke_bg.jpg' },
  { id: 'de_overpass', name: 'Overpass', img: 'https://blob.faceit.com/static/img/maps/cs2/overpass_bg.jpg' },
  { id: 'de_vertigo', name: 'Vertigo', img: 'https://blob.faceit.com/static/img/maps/cs2/vertigo_bg.jpg' },
  { id: 'de_ancient', name: 'Ancient', img: 'https://blob.faceit.com/static/img/maps/cs2/ancient_bg.jpg' },
  { id: 'de_anubis', name: 'Anubis', img: 'https://blob.faceit.com/static/img/maps/cs2/anubis_bg.jpg' },
];

export const VetoController = ({ match, onUpdate }) => {
  const { session } = useSession();
  const [vetoLog, setVetoLog] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. Fetch Existing Vetoes
  const fetchVetoes = async () => {
    const { data } = await supabase
      .from('match_vetoes')
      .select('*')
      .eq('match_id', match.id)
      .order('pick_order', { ascending: true });
    
    setVetoLog(data || []);
  };

  useEffect(() => {
    fetchVetoes();
    // Realtime subscription
    const channel = supabase
      .channel(`veto-${match.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'match_vetoes', filter: `match_id=eq.${match.id}` }, (payload) => {
         setVetoLog(prev => [...prev, payload.new]);
         if (onUpdate) onUpdate(); // Refresh parent match state
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [match.id]);

  // 2. Calculate State
  // Logic: BO1 = Ban until 1 left. BO3 = Ban, Ban, Pick, Pick, Ban, Ban, Decider.
  // We'll assume simple "Ban until 1 left" for MVP or check match.best_of
  const bestOf = match.best_of || 1;
  const totalSteps = bestOf === 1 ? 6 : 6; // Simplified flow for now (Ban-Ban-Ban...)
  
  const currentStepIndex = vetoLog.length;
  const isComplete = currentStepIndex >= totalSteps;
  
  // Who's turn is it? (A, B, A, B...)
  const turnTeamId = currentStepIndex % 2 === 0 ? match.team1_id : match.team2_id;
  const isMyTurn = session?.team_id === turnTeamId;
  
  const actionType = 'BAN'; // For simplified BO1, it's always BAN until the end.

  // 3. Action Handler
  const handleVeto = async (mapId) => {
    if (!isMyTurn || loading) return;
    
    if(!window.confirm(`${actionType} ${mapId}? This cannot be undone.`)) return;

    setLoading(true);
    try {
        // We use the secure RPC we made earlier
        const { error } = await supabase.rpc('api_submit_veto', {
            p_match_id: match.id,
            p_map_name: mapId,
            p_type: actionType
        });

        if (error) throw error;
        // Optimistic update handled by subscription
    } catch (err) {
        alert("Veto Error: " + err.message);
    } finally {
        setLoading(false);
    }
  };

  // 4. Render Map Card
  const renderMap = (map) => {
    const status = vetoLog.find(v => v.map_name === map.id);
    const isBanned = status?.type === 'BAN';
    const isPicked = status?.type === 'PICK';
    const isDisabled = !!status || !isMyTurn || isComplete;

    return (
      <button 
        key={map.id}
        disabled={isDisabled}
        onClick={() => handleVeto(map.id)}
        className={`relative group h-32 rounded-xl overflow-hidden border-2 transition-all duration-300
          ${isBanned ? 'border-red-900 opacity-40 grayscale' : 'border-zinc-800'}
          ${isPicked ? 'border-green-500 ring-2 ring-green-500/50 scale-105 z-10' : ''}
          ${!status && isMyTurn ? 'hover:border-fuchsia-500 hover:scale-105 cursor-pointer shadow-lg' : ''}
        `}
      >
        {/* Background Image */}
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${map.img})` }} />
        <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-colors" />
        
        {/* Label */}
        <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black to-transparent">
           <span className="text-white font-black text-lg uppercase tracking-widest font-['Teko']">{map.name}</span>
        </div>

        {/* Status Overlay */}
        {isBanned && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[2px]">
                <Ban className="w-12 h-12 text-red-600 rotate-12" />
            </div>
        )}
        {isPicked && (
            <div className="absolute inset-0 flex items-center justify-center bg-green-900/40 backdrop-blur-[1px]">
                <Check className="w-12 h-12 text-green-500" />
            </div>
        )}
      </button>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
       {/* Status Bar */}
       <div className={`p-4 rounded-lg border flex items-center justify-between shadow-lg
          ${isComplete ? 'bg-green-900/20 border-green-500/30' : isMyTurn ? 'bg-fuchsia-900/20 border-fuchsia-500 animate-pulse' : 'bg-zinc-900 border-zinc-800'}
       `}>
          <div className="flex items-center gap-3">
             {isComplete ? <CheckCircle className="text-green-500"/> : <Clock className={isMyTurn ? "text-fuchsia-500" : "text-zinc-500"}/>}
             <div>
                <h3 className="text-lg font-bold text-white uppercase leading-none">
                    {isComplete ? "Veto Complete" : isMyTurn ? "Your Turn" : "Opponent's Turn"}
                </h3>
                <p className="text-xs text-zinc-400 font-mono mt-1">
                    {isComplete ? "Map Decided" : `${actionType} Phase • Waiting for decision...`}
                </p>
             </div>
          </div>
          {!isComplete && (
              <div className="text-right">
                  <div className="text-[10px] uppercase text-zinc-500 font-bold">Time Remaining</div>
                  <div className="text-xl font-mono text-white">--:--</div> 
                  {/* Timer requires backend timestamp logic, placeholder for now */}
              </div>
          )}
       </div>

       {/* Map Grid */}
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {MAP_POOL.map(renderMap)}
       </div>
    </div>
  );
};

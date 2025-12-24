import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useCaptainVeto } from '../hooks/useCaptainVeto';
import { ShieldAlert, Ban, CheckCircle, Map } from 'lucide-react';
import { HudPanel, SkewButton } from '../ui/Components';

// MAP POOL CONSTANTS
const MAP_POOL = [
  { id: 'mirage', name: 'Mirage', image: 'https://img.youtube.com/vi/F91V3V6Qh6U/maxresdefault.jpg' },
  { id: 'inferno', name: 'Inferno', image: 'https://blob.faceit.com/static/img/maps/cs2/inferno_bg.jpg' },
  { id: 'nuke', name: 'Nuke', image: 'https://blob.faceit.com/static/img/maps/cs2/nuke_bg.jpg' },
  { id: 'overpass', name: 'Overpass', image: 'https://blob.faceit.com/static/img/maps/cs2/overpass_bg.jpg' },
  { id: 'vertigo', name: 'Vertigo', image: 'https://blob.faceit.com/static/img/maps/cs2/vertigo_bg.jpg' },
  { id: 'ancient', name: 'Ancient', image: 'https://blob.faceit.com/static/img/maps/cs2/ancient_bg.jpg' },
  { id: 'anubis', name: 'Anubis', image: 'https://blob.faceit.com/static/img/maps/cs2/anubis_bg.jpg' }
];

/**
 * VetoPanel Component
 * Works as both a Standalone Page (Captain) and Embedded Component (Admin Modal).
 */
export const VetoPanel = ({ matchId: propMatchId, team1: propTeam1, team2: propTeam2 }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();

  // 1. DETERMINE MODE & ID
  // If props exist, we are embedded in Modal. If not, we check URL params.
  const isEmbedded = !!propMatchId;
  const matchId = propMatchId || params.matchId;
  const activePin = location.state?.pin;

  // 2. INITIALIZE HOOK
  // If standalone captain mode, we pass the PIN to the hook for authorization
  const { vetoState, submitVeto, loading, error } = useCaptainVeto(matchId, activePin);
  const [selectedMap, setSelectedMap] = useState(null);

  // 3. SECURITY REDIRECT (Standalone only)
  useEffect(() => {
    if (!isEmbedded && !activePin) {
        // If trying to access /veto/:id without logging in first
        navigate('/admin'); // Redirect to login
    }
  }, [isEmbedded, activePin, navigate]);

  // 4. DATA NORMALIZATION
  // If embedded, we use props if available, otherwise fallback to hook state
  const team1Name = propTeam1?.name || vetoState?.team1_name || 'Team 1';
  const team2Name = propTeam2?.name || vetoState?.team2_name || 'Team 2';
  
  // Turn Logic
  const isTeam1Turn = vetoState?.current_turn_team_id === (propTeam1?.id || vetoState?.team1_id);
  const isTeam2Turn = vetoState?.current_turn_team_id === (propTeam2?.id || vetoState?.team2_id);
  
  // Interactive Check: Can this user click buttons?
  // Embedded (Admin) = Read Only (unless we add admin override logic later)
  // Standalone (Captain) = My Turn Only
  const canInteract = !isEmbedded && vetoState?.is_my_turn;

  const getMapStatus = (mapId) => {
    if (vetoState?.bans?.includes(mapId)) return 'BANNED';
    if (vetoState?.picks?.includes(mapId)) return 'PICKED';
    return 'AVAILABLE';
  };

  const handleAction = async () => {
    if (!selectedMap || !canInteract) return;
    await submitVeto(selectedMap);
    setSelectedMap(null);
  };

  if (loading && !vetoState) return <div className="p-12 text-center animate-pulse text-fuchsia-500 font-mono">ESTABLISHING SECURE UPLINK...</div>;
  
  // 5. RENDER
  return (
    <div className={`w-full h-full flex flex-col ${!isEmbedded ? 'max-w-6xl mx-auto p-4 md:p-8 min-h-screen bg-[#050505]' : ''}`}>
      
      {/* HEADER */}
      <div className={`flex justify-between items-center mb-6 bg-zinc-900/50 p-4 rounded border border-zinc-800 ${!isEmbedded ? 'mt-8' : ''}`}>
        <div className="flex items-center gap-4">
           <Map className="text-fuchsia-500 w-6 h-6" />
           <div>
              <h3 className="text-white font-bold uppercase tracking-widest font-['Teko'] text-xl">Map Veto Phase</h3>
              <div className="flex items-center gap-2 text-xs font-mono">
                 <span className={isTeam1Turn ? 'text-green-400 font-bold animate-pulse' : 'text-zinc-500'}>
                    {team1Name}
                 </span>
                 <span className="text-zinc-600">vs</span>
                 <span className={isTeam2Turn ? 'text-green-400 font-bold animate-pulse' : 'text-zinc-500'}>
                    {team2Name}
                 </span>
              </div>
           </div>
        </div>
        
        <div className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-widest border ${
            vetoState?.status === 'completed' ? 'bg-green-900/20 text-green-500 border-green-500/50' :
            'bg-yellow-900/20 text-yellow-500 border-yellow-500/50'
        }`}>
            {vetoState?.status === 'completed' ? 'VETO COMPLETE' : canInteract ? 'YOUR TURN' : 'OPPONENT TURN'}
        </div>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500/50 text-red-400 p-4 mb-6 rounded flex items-center gap-3 animate-in fade-in">
           <ShieldAlert className="w-5 h-5" />
           <span className="text-xs font-bold uppercase tracking-wide">{error}</span>
        </div>
      )}

      {/* MAP GRID */}
      <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 flex-1 overflow-y-auto p-2 ${!isEmbedded ? 'min-h-[500px]' : ''}`}>
         {MAP_POOL.map((map) => {
            const status = getMapStatus(map.id);
            const isSelected = selectedMap === map.id;
            const isDisabled = !canInteract || status !== 'AVAILABLE' || vetoState?.status === 'completed';

            return (
               <button
                  key={map.id}
                  disabled={isDisabled}
                  onClick={() => setSelectedMap(map.id)}
                  className={`
                     relative group overflow-hidden rounded border transition-all h-32 md:h-40
                     ${status === 'BANNED' ? 'opacity-30 grayscale border-red-900' : ''}
                     ${status === 'PICKED' ? 'border-green-500 ring-2 ring-green-500/50' : ''}
                     ${isSelected ? 'border-fuchsia-500 ring-2 ring-fuchsia-500/50 scale-[1.02]' : 'border-zinc-800'}
                     ${!isDisabled ? 'hover:border-zinc-500 cursor-pointer' : 'cursor-not-allowed'}
                  `}
               >
                  {/* Background Image */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                    style={{ backgroundImage: `url(${map.image})` }}
                  />
                  <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-colors" />

                  {/* Label */}
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black via-black/80 to-transparent">
                     <span className="text-white font-bold uppercase tracking-widest text-sm">{map.name}</span>
                  </div>

                  {/* Status Overlay */}
                  {status === 'BANNED' && (
                     <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                        <Ban className="text-red-500 w-8 h-8 rotate-45" />
                     </div>
                  )}
                  {status === 'PICKED' && (
                     <div className="absolute inset-0 flex items-center justify-center bg-green-900/40">
                        <CheckCircle className="text-green-400 w-8 h-8" />
                     </div>
                  )}
               </button>
            );
         })}
      </div>

      {/* ACTION FOOTER */}
      {vetoState?.status !== 'completed' && canInteract && (
         <div className="mt-4 pt-4 border-t border-zinc-800 flex justify-between items-center">
            <div className="text-zinc-500 text-xs font-mono">
               ACTION: <span className="text-white font-bold">BAN</span> phase
            </div>
            <SkewButton 
               onClick={handleAction} 
               disabled={!selectedMap || loading}
               className="bg-red-900/20 border-red-500/50 hover:bg-red-900/40"
            >
               {loading ? 'PROCESSING...' : 'CONFIRM BAN'}
            </SkewButton>
         </div>
      )}
    </div>
  );
};

// ✅ EXPORT DEFAULT for Router Compatibility
export default VetoPanel;

import React, { useEffect, useState, useCallback } from 'react';
import { X, Clock, Map as MapIcon, Shield, Trophy } from 'lucide-react';
import { supabase } from '../supabase/client';
import { useSession } from '../auth/useSession';
// Removed unused PERM_ACTIONS import

// Simple Badge Component
const ModalBadge = ({ children, color = 'gray' }) => {
  const colors = {
    red: 'bg-red-900/30 text-red-400 border-red-800',
    green: 'bg-emerald-900/30 text-emerald-400 border-emerald-800',
    gray: 'bg-zinc-800 text-zinc-400 border-zinc-700',
    orange: 'bg-orange-900/30 text-orange-400 border-orange-800',
  };
  return (
    <span className={`px-2 py-0.5 rounded-sm text-[9px] font-black uppercase tracking-widest border ${colors[color] || colors.gray}`}>
      {children}
    </span>
  );
};

const MatchModal = ({ match, onClose }) => {
  const { permissions } = useSession();
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchMatchTimeline = useCallback(async () => {
    if (!match?.id) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('match_events')
        .select('*')
        .eq('match_id', match.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTimeline(data || []);
    } catch (err) {
      console.error("Error fetching timeline:", err);
    } finally {
      setLoading(false);
    }
  }, [match?.id]);

  useEffect(() => {
    if (match?.id) {
      fetchMatchTimeline();
    }
  }, [match?.id, fetchMatchTimeline]);

  if (!match) return null;

  const isLive = match.status === 'live';
  const canViewSensitive = permissions.isAdmin || permissions.isReferee || permissions.isCaptain;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in">
      <div 
        className="w-full max-w-2xl bg-[#0b0c0f] border border-zinc-800 shadow-2xl flex flex-col max-h-[90vh]"
        style={{ clipPath: 'polygon(0 0, 100% 0, 100% 95%, 95% 100%, 0 100%)' }}
      >
        <div className="flex justify-between items-start p-6 border-b border-zinc-800 bg-[#15191f]">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">
                MATCH #{match.id.slice(0, 4)}
              </h2>
              {isLive && <ModalBadge color="red">LIVE</ModalBadge>}
              <ModalBadge color="gray">{match.map || 'TBA'}</ModalBadge>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono text-zinc-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {new Date(match.start_time).toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <MapIcon className="w-3 h-3" /> {match.server_region || 'Unknown Region'}
              </span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar space-y-8">
          <div className="grid grid-cols-2 gap-8">
            <div className="p-4 bg-zinc-900/30 border border-zinc-800 text-center">
              <h3 className="text-xl font-black text-[#ff5500] uppercase mb-1">{match.team1_name}</h3>
              <p className="text-zinc-500 font-mono text-xs">TEAM A</p>
            </div>
            <div className="p-4 bg-zinc-900/30 border border-zinc-800 text-center">
              <h3 className="text-xl font-black text-[#ff5500] uppercase mb-1">{match.team2_name}</h3>
              <p className="text-zinc-500 font-mono text-xs">TEAM B</p>
            </div>
          </div>

          {canViewSensitive && match.server_ip && (
            <div className="bg-red-900/10 border border-red-900/30 p-4">
              <div className="flex items-center gap-2 mb-2 text-red-500 text-xs font-bold uppercase tracking-widest">
                <Shield className="w-3 h-3" /> Classified Connection Data
              </div>
              <code className="block bg-black/50 p-3 rounded text-red-400 font-mono text-sm select-all">
                connect {match.server_ip}; password {match.server_password}
              </code>
            </div>
          )}

          <div>
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Trophy className="w-3 h-3" /> Match Events
            </h4>
            <div className="space-y-2">
              {loading ? (
                <div className="text-zinc-600 font-mono text-xs animate-pulse">Synchronizing feed...</div>
              ) : timeline.length > 0 ? (
                timeline.map((event) => (
                  <div key={event.id} className="flex gap-4 text-sm font-mono border-l-2 border-zinc-800 pl-4 py-1">
                    <span className="text-zinc-500">{new Date(event.created_at).toLocaleTimeString()}</span>
                    <span className="text-zinc-300">{event.description}</span>
                  </div>
                ))
              ) : (
                <div className="text-zinc-700 font-mono text-xs italic">No events recorded.</div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MatchModal;

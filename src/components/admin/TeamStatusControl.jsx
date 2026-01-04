import React, { useState } from 'react';
import { supabase } from '../../supabase/client';
import { Save, AlertTriangle, ShieldBan, CheckCircle, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '../../lib/utils';

export const TeamStatusControl = ({ team, onUpdate }) => {
  const [seed, setSeed] = useState(team.seed_number || '');
  const [loading, setLoading] = useState(false);
  const [isDQ, setIsDQ] = useState(team.is_disqualified || false);

  // LOGIC: Check Roster Health
  const playerCount = team.members?.length || 0;
  const isRosterFull = playerCount >= (team.max_players || 5);
  const hasCaptain = team.members?.some(m => m.role === 'CAPTAIN' || m.role === 'captain');

  const handleSaveSeed = async () => {
    setLoading(true);
    try {
        const { error } = await supabase
            .from('teams')
            .update({ seed_number: seed ? parseInt(seed) : null })
            .eq('id', team.id);

        if (error) throw error;
        toast.success("Seed Updated");
        if (onUpdate) onUpdate();
    } catch (err) {
        toast.error("Failed to update seed");
    } finally {
        setLoading(false);
    }
  };

  const toggleDQ = async () => {
    if (!window.confirm(isDQ ? "Re-qualify this team?" : "DISQUALIFY this team? They will be removed from matchmaking.")) return;
    
    setLoading(true);
    try {
        // Assuming 'is_disqualified' column exists, or we use metadata. 
        // For v1, we'll try updating the column directly.
        const { error } = await supabase
            .from('teams')
            .update({ is_disqualified: !isDQ })
            .eq('id', team.id);

        if (error) throw error;
        setIsDQ(!isDQ);
        toast.success(isDQ ? "Team Re-qualified" : "Team Disqualified");
        if (onUpdate) onUpdate();
    } catch (err) {
        toast.error("DQ Update Failed");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-4 bg-black/20 p-2 rounded border border-white/5">
        
        {/* 1. SEED CONTROL */}
        <div className="flex items-center gap-2">
            <span className="text-[10px] text-zinc-500 font-bold uppercase">Seed:</span>
            <input 
                type="number" 
                className="w-12 bg-black border border-zinc-700 text-white text-xs font-mono p-1 text-center focus:border-brand outline-none rounded"
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                placeholder="-"
            />
            {seed != team.seed_number && (
                <button 
                    onClick={handleSaveSeed} 
                    disabled={loading}
                    className="p-1 bg-brand/20 text-brand-glow rounded hover:bg-brand/40 transition-colors"
                >
                    <Save size={12} />
                </button>
            )}
        </div>

        <div className="w-px h-6 bg-white/10" />

        {/* 2. HEALTH STATUS */}
        <div className="flex items-center gap-3">
            {!hasCaptain ? (
                <span className="text-[10px] text-red-500 font-bold flex items-center gap-1 bg-red-950/20 px-2 py-0.5 rounded border border-red-900/30">
                    <AlertTriangle size={10} /> NO CAPTAIN
                </span>
            ) : !isRosterFull ? (
                <span className="text-[10px] text-yellow-500 font-bold flex items-center gap-1 bg-yellow-950/20 px-2 py-0.5 rounded border border-yellow-900/30">
                    <AlertTriangle size={10} /> {playerCount}/5
                </span>
            ) : (
                <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1 bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-900/30">
                    <CheckCircle size={10} /> READY
                </span>
            )}
        </div>

        <div className="w-px h-6 bg-white/10" />

        {/* 3. DQ TOGGLE */}
        <button 
            onClick={toggleDQ}
            disabled={loading}
            className={cn(
                "px-2 py-1 rounded text-[10px] font-bold uppercase transition-all flex items-center gap-1",
                isDQ 
                    ? "bg-red-500 text-white hover:bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]" 
                    : "bg-zinc-800 text-zinc-500 hover:text-red-400 hover:bg-zinc-700"
            )}
            title="Disqualify Team"
        >
            <ShieldBan size={10} />
            {isDQ ? 'DISQUALIFIED' : 'DQ'}
        </button>

    </div>
  );
};

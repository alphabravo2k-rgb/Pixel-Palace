/**
 * 🛡️ TEAM STATUS CONTROL: ELIGIBILITY & DQ
 * VERSION: 2050.5.0 (MASTER OMNI)
 * STATUS: OPERATIONAL // ATOMIC UPDATES
 */

import React, { useState } from 'react';
import { supabase } from '../../supabase/client';
import { Save, AlertTriangle, ShieldBan, CheckCircle, RefreshCw, Zap } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '../../lib/utils';

// MASTER CORE
import { SoundNexus, CUES } from '../../lib/soundNexus';
import { Telemetry, EVENTS } from '../../lib/telemetry';
import { useNexus } from '../../hooks/useNexus';

export const TeamStatusControl = ({ team, onUpdate }) => {
  const { user: admin } = useNexus();
  const [seed, setSeed] = useState(team.seed_number || '');
  const [loading, setLoading] = useState(false);
  const [isDQ, setIsDQ] = useState(team.is_disqualified || false);

  // 🧠 INTELLIGENT ROSTER ANALYSIS
  const playerCount = team.members?.length || 0;
  const isRosterFull = playerCount >= (team.max_players || 5);
  const hasCaptain = team.members?.some(m => m.role?.toLowerCase() === 'captain');

  /**
   * ⚡ SEED CONFIGURATION
   */
  const handleSaveSeed = async () => {
    setLoading(true);
    SoundNexus.play(CUES.UI_CLICK);
    
    try {
        const { error } = await supabase
            .from('teams')
            .update({ seed_number: seed ? parseInt(seed) : null })
            .eq('id', team.id);

        if (error) throw error;
        
        Telemetry.log(EVENTS.ACTION, { action: 'UPDATE_SEED', team: team.name, seed }, admin.id);
        toast.success(`UNIT SEED UPDATED: ${seed}`);
        if (onUpdate) onUpdate();
    } catch (err) {
        toast.error("DATA LINK FAILURE");
        SoundNexus.play(CUES.UI_ERROR);
    } finally {
        setLoading(false);
    }
  };

  /**
   * 🚫 DISQUALIFICATION PROTOCOL
   */
  const toggleDQ = async () => {
    const action = isDQ ? "RE-QUALIFY" : "DISQUALIFY";
    if (!window.confirm(`${action} this combat unit? Matchmaking access will be ${isDQ ? 'restored' : 'revoked'}.`)) return;
    
    setLoading(true);
    SoundNexus.play(CUES.DISPUTE_TRIGGER);
    
    try {
        const { error } = await supabase
            .from('teams')
            .update({ 
                is_disqualified: !isDQ,
                status: !isDQ ? 'DISQUALIFIED' : 'ACTIVE'
            })
            .eq('id', team.id);

        if (error) throw error;
        
        setIsDQ(!isDQ);
        Telemetry.log(EVENTS.ACTION, { action, team: team.name }, admin.id);
        toast.success(`UNIT STATUS: ${action}ED`);
        if (onUpdate) onUpdate();
    } catch (err) {
        toast.error("STATUS UPDATE FAILED");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-4 bg-zinc-950/50 p-2.5 rounded-sm border border-white/5 backdrop-blur-md">
        
        {/* 1. SEED CONTROL */}
        <div className="flex items-center gap-3">
            <span className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">Index:</span>
            <div className="relative group">
                <input 
                    type="number" 
                    className="w-14 bg-black border border-zinc-800 text-white text-[10px] font-mono p-1.5 text-center focus:border-fuchsia-500 outline-none rounded-sm transition-all"
                    value={seed}
                    onChange={(e) => setSeed(e.target.value)}
                    placeholder="-"
                />
                {seed != team.seed_number && (
                    <button 
                        onClick={handleSaveSeed} 
                        disabled={loading}
                        className="absolute -right-8 top-1/2 -translate-y-1/2 p-1.5 bg-fuchsia-600/20 text-fuchsia-400 rounded-sm hover:bg-fuchsia-600 hover:text-white transition-all shadow-lg animate-in fade-in slide-in-from-left-2"
                    >
                        <Save size={12} />
                    </button>
                )}
            </div>
        </div>

        <div className="w-px h-8 bg-white/5" />

        {/* 2. READINESS DIAGNOSTIC */}
        <div className="flex items-center gap-3">
            {!hasCaptain ? (
                <div className="flex items-center gap-2 px-3 py-1 bg-red-950/20 border border-red-500/30 rounded-sm">
                    <AlertTriangle size={12} className="text-red-500" />
                    <span className="text-[9px] text-red-400 font-black uppercase tracking-tighter">No Captain Linked</span>
                </div>
            ) : !isRosterFull ? (
                <div className="flex items-center gap-2 px-3 py-1 bg-amber-950/20 border border-amber-500/30 rounded-sm">
                    <Zap size={12} className="text-amber-500" />
                    <span className="text-[9px] text-amber-400 font-black uppercase tracking-tighter">Incomplete: {playerCount}/5</span>
                </div>
            ) : (
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-950/20 border border-emerald-500/30 rounded-sm">
                    <CheckCircle size={12} className="text-emerald-500" />
                    <span className="text-[9px] text-emerald-400 font-black uppercase tracking-tighter">Combat Ready</span>
                </div>
            )}
        </div>

        <div className="w-px h-8 bg-white/5" />

        {/* 3. DQ COMMAND */}
        <button 
            onClick={toggleDQ} 
            disabled={loading}
            className={cn(
                "px-4 py-1.5 rounded-sm text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 border",
                isDQ 
                    ? "bg-red-600 text-white border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.3)] animate-pulse" 
                    : "bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-red-500 hover:border-red-900/50"
            )}
        >
            <ShieldBan size={12} />
            {isDQ ? 'Disqualified' : 'DQ Unit'}
        </button>

    </div>
  );
};

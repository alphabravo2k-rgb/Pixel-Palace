/**
 * ⚡ PIXEL PALACE: PLAYER LEGACY
 * FILE: src/components/player/PlayerLegacy.jsx
 * -----------------------------------------
 * VERSION: 2050.5.0 (MASTER OMNI)
 * DATE: 2026-01-22
 * STATUS: OPERATIONAL // VISUAL_ARCHIVE
 * -----------------------------------------
 * DESCRIPTION:
 * Visualizes long-term player achievements and biometric stats.
 * Features a trophy cabinet, performance metrics, and duty cycle tracking.
 * * UPGRADES (V5.0):
 * - [Trophy Cabinet]: Dynamic rendering of accolades with holographic effects.
 * - [Biometrics]: Visual Headshot Efficiency bar.
 */

import React from 'react';
import { Trophy, Target, TrendingUp, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';

export const PlayerLegacy = ({ stats }) => {
  // stats = { matches_played, win_rate, hs_rate, mvps, trophies: [], peak_elo, hours_played }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
       {/* 1. THE TROPHY CABINET */}
       <div className="lg:col-span-3 bg-zinc-950 border border-amber-500/20 p-8 rounded-sm relative overflow-hidden group shadow-[0_0_30px_rgba(245,158,11,0.05)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(245,158,11,0.05),_transparent)] group-hover:bg-[radial-gradient(circle_at_center,_rgba(245,158,11,0.1),_transparent)] transition-all duration-1000" />
          <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em] mb-6 flex items-center gap-2">
             <Trophy size={12} /> Hall of Victory
          </h3>
          
          <div className="flex gap-8 overflow-x-auto pb-4 custom-scrollbar">
             {(stats?.trophies || []).length === 0 ? (
                <div className="text-zinc-700 text-xs font-mono italic p-4 border border-dashed border-zinc-800 rounded-sm w-full text-center">
                    NO HARDWARE ACQUIRED YET.
                </div>
             ) : (
                stats.trophies.map((t, i) => (
                   <div key={i} className="flex flex-col items-center gap-2 min-w-[100px] group/trophy">
                      <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)] group-hover/trophy:scale-110 transition-transform duration-500">
                         <Trophy className="text-amber-400 w-8 h-8 drop-shadow-lg" />
                      </div>
                      <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest text-center group-hover/trophy:text-white transition-colors">{t.name}</span>
                      <span className="text-[8px] font-mono text-zinc-600">{t.year}</span>
                   </div>
                ))
             )}
          </div>
       </div>

       {/* 2. BIOMETRIC PERFORMANCE */}
       <div className="bg-zinc-950 border border-white/5 p-6 rounded-sm relative group hover:border-emerald-500/20 transition-colors">
          <div className="flex items-center justify-between mb-4">
             <span className="text-[9px] text-zinc-500 uppercase tracking-widest group-hover:text-emerald-500 transition-colors">Headshot Efficiency</span>
             <Target size={14} className="text-emerald-500" />
          </div>
          <div className="text-4xl font-display font-black text-white">
             {stats?.hs_rate || 0}%
          </div>
          <div className="w-full bg-zinc-900 h-1 mt-4 rounded-full overflow-hidden">
             <div className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981]" style={{ width: `${stats?.hs_rate || 0}%` }} />
          </div>
       </div>

       {/* 3. ELO TRAJECTORY */}
       <div className="bg-zinc-950 border border-white/5 p-6 rounded-sm relative group hover:border-fuchsia-500/20 transition-colors">
          <div className="flex items-center justify-between mb-4">
             <span className="text-[9px] text-zinc-500 uppercase tracking-widest group-hover:text-fuchsia-500 transition-colors">Rating Peak</span>
             <TrendingUp size={14} className="text-fuchsia-500" />
          </div>
          <div className="text-4xl font-display font-black text-white">
             {stats?.peak_elo || 1000}
          </div>
          <p className="text-[9px] text-zinc-600 font-mono mt-2 uppercase">Global Rank: #--</p>
       </div>

        {/* 4. DUTY CYCLE */}
        <div className="bg-zinc-950 border border-white/5 p-6 rounded-sm relative group hover:border-blue-500/20 transition-colors">
          <div className="flex items-center justify-between mb-4">
             <span className="text-[9px] text-zinc-500 uppercase tracking-widest group-hover:text-blue-500 transition-colors">Hours on Duty</span>
             <Clock size={14} className="text-blue-500" />
          </div>
          <div className="text-4xl font-display font-black text-white">
             {stats?.hours_played || 0}h
          </div>
          <p className="text-[9px] text-zinc-600 font-mono mt-2 uppercase">Since 2024</p>
        </div>

    </div>
  );
};

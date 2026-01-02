import React from 'react';
import { Shield, ArrowUpRight, Minus } from 'lucide-react';

const StatsCard = ({ title, value, type }) => {
  // Logic: determine if this metric is "positive" (Green) or neutral (Gray)
  const isGood = type === 'teams' || type === 'players' || type === 'active' || type === 'good';
  
  return (
    <div className="bg-zinc-900/50 border border-white/5 rounded-lg p-4 flex flex-col justify-between h-full relative overflow-hidden group hover:border-zinc-700 transition-colors">
      {/* Background Icon Decoration */}
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
        <Shield size={64} />
      </div>

      <div className="flex justify-between items-start z-10">
        <span className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider">{title}</span>
        {isGood ? <ArrowUpRight className="w-4 h-4 text-green-500" /> : <Minus className="w-4 h-4 text-zinc-600" />}
      </div>
      
      <div className="mt-2 z-10">
        <span className="text-3xl font-bold font-['Teko'] text-white">{value}</span>
      </div>
    </div>
  );
};

export default StatsCard;

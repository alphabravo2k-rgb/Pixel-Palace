import React from 'react';
import { Trophy, Users, AlertCircle } from 'lucide-react';

const StatsCard = ({ title, value, type }) => {
  const icons = {
    teams: <Trophy className="w-8 h-8 text-yellow-400" />,
    players: <Users className="w-8 h-8 text-blue-400" />,
    pending: <AlertCircle className="w-8 h-8 text-red-400" />
  };

  const colors = {
    teams: "border-yellow-500/20 bg-yellow-500/10",
    players: "border-blue-500/20 bg-blue-500/10",
    pending: "border-red-500/20 bg-red-500/10"
  };

  return (
    <div className={`p-6 rounded-xl border ${colors[type] || colors.teams} backdrop-blur-sm flex items-center gap-4`}>
      <div className="p-3 bg-black/40 rounded-lg">
        {icons[type] || icons.teams}
      </div>
      <div>
        <p className="text-zinc-400 text-xs uppercase tracking-wider font-bold">{title}</p>
        <p className="text-3xl font-black text-white font-['Teko'] tracking-wide">{value}</p>
      </div>
    </div>
  );
};

export default StatsCard;

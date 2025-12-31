const StatsCard = ({ title, value, type }) => {
  const isGood = type === 'teams' || type === 'players';
  
  return (
    <div className="bg-zinc-900/50 border border-white/5 rounded-lg p-4 flex flex-col justify-between h-full">
      <div className="flex justify-between items-start">
        <span className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider">{title}</span>
        {isGood ? (
            <ArrowUpRight className="w-4 h-4 text-green-500" />
        ) : (
            <Minus className="w-4 h-4 text-zinc-600" />
        )}
      </div>
      <div className="mt-2">
        <span className="text-3xl font-bold font-['Teko'] text-white">{value}</span>
      </div>
    </div>
  );
};

export default StatsCard;

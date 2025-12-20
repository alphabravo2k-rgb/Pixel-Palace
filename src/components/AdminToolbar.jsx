import React, { useState } from 'react';
import { useSession } from '../auth/useSession';
import { useTournament } from '../tournament/useTournament';
import { ROLE_THEMES, ROLES } from '../lib/roles';
import { User, LogOut, Lock, RefreshCw, ShieldCheck } from 'lucide-react';

const AdminToolbar = () => {
  const { session, logout, setIsPinModalOpen, permissions } = useSession();
  const { refreshMatches } = useTournament();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleManualSync = async () => {
    setIsSyncing(true);
    await refreshMatches();
    setTimeout(() => setIsSyncing(false), 1000);
  };

  if (!session.isAuthenticated) {
    return (
      <div className="bg-[#060709] border-b border-zinc-900 p-2 flex justify-end sticky top-0 z-50">
        <button 
          onClick={() => setIsPinModalOpen(true)} 
          className="text-[9px] text-zinc-600 hover:text-[#ff5500] uppercase tracking-[0.3em] font-black transition-all flex items-center gap-2 group"
        >
          <Lock className="w-3 h-3 group-hover:animate-pulse" /> Operator_Login
        </button>
      </div>
    );
  }

  const theme = ROLE_THEMES[session.role] || ROLE_THEMES[ROLES.GUEST];
  
  // Explicit colors for Tailwind
  const badgeStyles = {
    fuchsia: "bg-fuchsia-900/50 text-fuchsia-200 border-fuchsia-700",
    purple: "bg-purple-900/50 text-purple-200 border-purple-700",
    cyan: "bg-cyan-900/50 text-cyan-200 border-cyan-700",
    yellow: "bg-yellow-900/50 text-yellow-200 border-yellow-700",
    emerald: "bg-emerald-900/50 text-emerald-200 border-emerald-700",
    zinc: "bg-zinc-800 text-zinc-400 border-zinc-600"
  };
  const currentBadge = badgeStyles[theme.color] || badgeStyles.zinc;

  return (
    <div className="bg-[#0b0c0f]/95 border-b border-zinc-800 p-3 sticky top-0 z-50 backdrop-blur-md">
      <div className="container mx-auto flex justify-between items-center px-4">
        
        <div className="flex items-center gap-4">
          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${currentBadge}`}>
            {theme.label}
          </span>
          <div className="flex items-center gap-3 text-zinc-400 font-mono text-xs uppercase tracking-tight">
            <User className="w-3 h-3" />
            <span className="text-zinc-300 font-bold">{session.identity}</span>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          {permissions.isAdmin && (
            <button 
              onClick={handleManualSync}
              disabled={isSyncing}
              className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-widest transition-colors ${isSyncing ? 'text-[#ff5500]' : 'text-zinc-500 hover:text-white'}`}
            >
              <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Force_Sync</span>
            </button>
          )}
          <button 
            onClick={() => logout()} 
            className="flex items-center gap-2 text-zinc-500 hover:text-red-500 transition-all p-1 group border border-transparent hover:border-red-900/50 rounded px-2"
            title="Terminate Session"
          >
            <span className="text-[9px] font-bold uppercase tracking-widest hidden sm:inline">Terminate</span>
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminToolbar;

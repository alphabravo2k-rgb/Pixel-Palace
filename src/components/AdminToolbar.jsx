import React, { useState } from 'react';
import { useSession } from '../auth/useSession';
import { useTournament } from '../tournament/useTournament';
import { ROLE_THEMES } from '../lib/roles';
import { Badge } from '../ui/Components';
import { User, LogOut, Lock, RefreshCw } from 'lucide-react';

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

  const theme = ROLE_THEMES[session.role] || { color: 'gray', label: 'OPERATOR' };

  return (
    <div className="bg-[#0b0c0f] border-b border-zinc-800 p-3 sticky top-0 z-50 backdrop-blur-md bg-opacity-90">
      <div className="container mx-auto flex justify-between items-center px-4">
        <div className="flex items-center gap-4">
          <Badge color={theme.color}>{theme.label}</Badge>
          <div className="flex items-center gap-3 text-zinc-400 font-mono text-xs uppercase tracking-tight">
            <User className="w-3 h-3" />
            <span className="text-zinc-300">{session.identity}</span>
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
            onClick={() => logout("USER_TERMINATED")} 
            className="text-zinc-500 hover:text-red-500 transition-all p-1 flex items-center gap-2 group"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminToolbar;

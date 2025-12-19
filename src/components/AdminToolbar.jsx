import React, { useState } from 'react';
import { useSession } from '../auth/useSession';
import { useTournament } from '../tournament/useTournament';
import { ROLE_THEMES } from '../lib/roles';
import { Badge, Button } from '../ui/Components';
import { User, LogOut, Lock, ShieldAlert, RefreshCw, database } from 'lucide-react';

const AdminToolbar = () => {
  const { session, logout, setIsPinModalOpen, permissions } = useSession();
  const { refreshMatches } = useTournament();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleManualSync = async () => {
    setIsSyncing(true);
    await refreshMatches();
    setTimeout(() => setIsSyncing(false), 1000); // Visual feedback delay
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
        
        {/* LEFT: IDENTITY & SCOPE */}
        <div className="flex items-center gap-4">
          <Badge color={theme.color}>{theme.label}</Badge>
          <div className="flex items-center gap-3 text-zinc-500 font-mono text-[10px] uppercase tracking-tighter">
            <div className="flex items-center gap-1.5">
              <User size={12} className="text-zinc-700" />
              <span className="text-zinc-300 font-bold">{session.identity}</span>
            </div>
            {session.teamId && (
              <div className="hidden md:flex items-center gap-1.5 border-l border-zinc-800 pl-3">
                <span className="text-zinc-700 font-black">UNIT_ID:</span>
                <span className="text-[#ff5500]">{session.teamId.slice(0,8)}</span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: COMMAND ACTIONS */}
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

          <div className="h-4 w-px bg-zinc-800 mx-2 hidden sm:block" />

          <button 
            onClick={() => logout("USER_TERMINATED")} 
            className="text-zinc-500 hover:text-red-500 transition-all p-1 flex items-center gap-2 group"
            title="Terminate Session"
          >
            <span className="text-[9px] font-mono uppercase opacity-0 group-hover:opacity-100 transition-opacity tracking-tighter">Disconnect</span>
            <LogOut size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default AdminToolbar;

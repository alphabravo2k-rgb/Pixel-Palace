import React from 'react';
import { useSession } from '../auth/useSession';
import { useTournament } from '../tournament/useTournament';
import { ROLE_THEMES, ROLES } from '../lib/roles';
import { User, LogOut, Lock, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ✅ MUST BE "export const" to match the router import
export const AdminToolbar = () => {
  const { session, logout } = useSession();
  const { selectedTournamentId, loading } = useTournament();
  const navigate = useNavigate();

  // Guard: Only show for authorized users
  if (![ROLES.ADMIN, ROLES.OWNER].includes(session.role)) return null;

  const theme = ROLE_THEMES[session.role] || ROLE_THEMES.GUEST;

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-14 bg-zinc-950 border-b border-white/10 flex items-center justify-between px-6 shadow-2xl">
      <div className="flex items-center gap-4">
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${theme.bg} ${theme.border} ${theme.color}`}>
          <Lock className="w-3 h-3" />
          <span className="text-[10px] font-bold uppercase tracking-widest">{theme.label} MODE</span>
        </div>
        <div className="h-4 w-px bg-white/10" />
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <User className="w-3 h-3" />
          <span className="font-mono text-zinc-300">{session.identity?.name || 'Unknown'}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {loading && (
          <div className="flex items-center gap-2 text-[10px] text-fuchsia-500 animate-pulse">
            <RefreshCw className="w-3 h-3 animate-spin" />
            SYNCING
          </div>
        )}
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-1.5 hover:bg-red-900/20 text-zinc-500 hover:text-red-400 rounded transition-colors text-xs font-bold uppercase"
        >
          <LogOut className="w-3 h-3" />
          Disconnect
        </button>
      </div>
    </div>
  );
};

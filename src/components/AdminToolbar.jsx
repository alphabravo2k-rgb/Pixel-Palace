import React from 'react';
import { useSession } from '../auth/useSession';
import { useTournament } from '../tournament/useTournament';
import { ROLE_THEMES, ROLES } from '../lib/roles';
import { User, LogOut, Lock, RefreshCw, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AdminToolbar = () => {
  const { session, logout } = useSession();
  // ✅ Connected to Global Context
  const { selectedTournamentId, setSelectedTournamentId, tournaments = [], loading } = useTournament();
  const navigate = useNavigate();

  // Hide if not admin (though Route Guard handles this mostly)
  if (![ROLES.ADMIN, ROLES.OWNER].includes(session.role)) return null;

  const theme = ROLE_THEMES[session.role] || ROLE_THEMES.GUEST;

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-14 bg-zinc-950 border-b border-white/10 flex items-center justify-between px-6 shadow-2xl">
      
      {/* LEFT: User & Mode */}
      <div className="flex items-center gap-4">
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${theme.bg} ${theme.border} ${theme.color}`}>
          <Lock className="w-3 h-3" />
          <span className="text-[10px] font-bold uppercase tracking-widest">{theme.label} MODE</span>
        </div>
        
        {/* ✅ Global Tournament Selector */}
        <div className="relative group">
          <select 
            value={selectedTournamentId || ''}
            onChange={(e) => setSelectedTournamentId(e.target.value)}
            className="appearance-none bg-black border border-white/10 text-white text-xs font-bold uppercase py-1 pl-3 pr-8 rounded focus:border-fuchsia-500 outline-none cursor-pointer hover:bg-white/5 transition-colors"
          >
            <option value="" disabled>-- SELECT EVENT --</option>
            {tournaments && tournaments.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 text-zinc-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* RIGHT: Actions */}
      <div className="flex items-center gap-4">
        {loading && (
          <div className="flex items-center gap-2 text-[10px] text-fuchsia-500 animate-pulse">
            <RefreshCw className="w-3 h-3 animate-spin" />
            SYNCING
          </div>
        )}
        <div className="h-4 w-px bg-white/10" />
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <User className="w-3 h-3" />
          <span className="font-mono text-zinc-300">{session.identity?.name || 'Unknown'}</span>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-1.5 hover:bg-red-900/20 text-zinc-500 hover:text-red-400 rounded transition-colors text-xs font-bold uppercase"
        >
          <LogOut className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

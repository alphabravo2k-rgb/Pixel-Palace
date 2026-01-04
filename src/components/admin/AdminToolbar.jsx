import React from 'react';
import { useSession } from '../../auth/useSession';
import { useTournament } from '../../tournament/useTournament';
import { ROLE_THEMES, ROLES } from '../../lib/roles';
import { User, LogOut, Lock, RefreshCw, ChevronDown, Radio } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';

export const AdminToolbar = () => {
  const { session, logout } = useSession();
  const { selectedTournamentId, setSelectedTournamentId, tournaments = [], loading, tournamentData } = useTournament();
  const navigate = useNavigate();

  // Role Check
  if (![ROLES.ADMIN, ROLES.OWNER, ROLES.REFEREE].includes(session.role)) return null;

  const theme = ROLE_THEMES[session.role] || ROLE_THEMES.GUEST;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSwitch = (e) => {
    const newId = e.target.value;
    
    // 🛡️ CONTEXT FRICTION
    if (selectedTournamentId && newId !== selectedTournamentId) {
      const confirmSwitch = window.confirm(
        "⚠️ SWITCHING ACTIVE WAR ROOM\n\nYou are changing the active tournament context.\nEnsure all critical actions in the current event are saved.\n\nProceed?"
      );
      if (!confirmSwitch) {
        e.target.value = selectedTournamentId; 
        return;
      }
    }
    
    setSelectedTournamentId(newId);
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-14 bg-zinc-950/95 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-6 shadow-2xl">
      
      {/* LEFT: Identity & Context */}
      <div className="flex items-center gap-4">
        
        {/* Role Badge */}
        <div className={cn("flex items-center gap-2 px-3 py-1 rounded-full border shadow-sm", theme.bg, theme.border, theme.color)}>
          <Lock className="w-3 h-3" />
          <span className="text-[10px] font-bold uppercase tracking-widest">{theme.label} MODE</span>
        </div>
        
        <div className="h-4 w-px bg-white/10" />

        {/* Tournament Selector */}
        <div className="relative group">
          <select 
            value={selectedTournamentId || ''}
            onChange={handleSwitch}
            className="appearance-none bg-transparent text-white text-xs font-bold uppercase py-1.5 pl-2 pr-8 rounded outline-none cursor-pointer hover:bg-white/5 transition-colors focus:bg-black focus:ring-1 focus:ring-brand"
          >
            <option value="" disabled>-- SELECT OPERATION --</option>
            {tournaments && tournaments.map(t => (
              <option key={t.id} value={t.id} className="bg-zinc-900 text-zinc-300">
                 {t.name} {t.status === 'LIVE' ? '🔴' : ''}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 text-zinc-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-white transition-colors" />
        </div>

        {/* Live Indicator */}
        {tournamentData?.status === 'live' && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded border bg-red-950/30 text-red-500 border-red-900/50 animate-pulse">
                <Radio className="w-3 h-3" />
                <span className="text-[9px] font-bold uppercase tracking-widest">LIVE</span>
            </div>
        )}
      </div>

      {/* RIGHT: User & Actions */}
      <div className="flex items-center gap-4">
        
        {/* Sync Status */}
        {loading && (
          <div className="flex items-center gap-2 text-[10px] text-brand animate-pulse">
            <RefreshCw className="w-3 h-3 animate-spin" />
            UPLINK ACTIVE
          </div>
        )}
        
        <div className="h-4 w-px bg-white/10" />
        
        {/* User Profile */}
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <div className="w-6 h-6 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center">
             <User className="w-3 h-3" />
          </div>
          <span className="font-mono text-zinc-300 hidden md:inline-block">
             {session.identity?.full_name || session.user?.email || 'Commander'}
          </span>
        </div>

        {/* Logout */}
        <button 
          onClick={handleLogout}
          className="p-2 hover:bg-red-950/30 text-zinc-500 hover:text-red-500 rounded-full border border-transparent hover:border-red-900/30 transition-all"
          title="Disconnect"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

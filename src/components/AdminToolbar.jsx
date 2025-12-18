import React from 'react';
import { useSession } from '../auth/useSession';
import { ROLE_THEMES } from '../lib/roles';
import { Badge } from '../ui/Components';
import { User, LogOut, Lock, ShieldAlert } from 'lucide-react';

const AdminToolbar = () => {
  const { session, logout, setIsPinModalOpen, permissions } = useSession();

  // 1. Guest View: Login Prompt
  if (!session.isAuthenticated) {
    return (
      <div className="bg-tactical-surface border-b border-ui-border p-2 flex justify-end relative z-50">
        <button 
          onClick={() => setIsPinModalOpen(true)} 
          className="text-[10px] text-zinc-600 hover:text-brand uppercase tracking-widest font-bold transition-colors flex items-center gap-2"
        >
          <Lock className="w-3 h-3" /> Operator Login
        </button>
      </div>
    );
  }

  const theme = ROLE_THEMES[session.role] || { color: 'gray', label: 'OPERATOR' };

  return (
    <div className="bg-tactical-surface border-b border-ui-border p-3 relative z-50">
      <div className="container mx-auto flex justify-between items-center px-4">
        
        {/* Left: Identity */}
        <div className="flex items-center gap-4">
          <Badge color={theme.color}>{theme.label}</Badge>
          <div className="flex items-center gap-2 text-zinc-400 font-mono text-xs uppercase tracking-tight">
            <User className="w-3 h-3" />
            <span className="text-zinc-300">{session.identity}</span>
            {permissions.isAdmin && (
              <ShieldAlert className="w-3 h-3 text-red-500 ml-1" title="Admin Privileges Active" />
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex gap-4 items-center">
           {/* Session Timer / Status could go here in V2 */}
          <button 
            onClick={() => logout("USER_INITIATED")} 
            className="text-zinc-500 hover:text-white transition-colors p-1 flex items-center gap-2 group"
            title="Terminate Session"
          >
            <span className="text-[9px] font-mono uppercase opacity-0 group-hover:opacity-100 transition-opacity">Disconnect</span>
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default AdminToolbar;

import { useSession } from '../auth/useSession.jsx';
import { ROLE_THEMES } from '../lib/roles.js';
import { Badge } from '../ui/Components.jsx';
import { User, LogOut, Lock } from 'lucide-react';

/**
 * ADMIN TOOLBAR Component
 * Provides operator identity visualization and session termination.
 */
const AdminToolbar = () => {
  const { session, logout, setIsPinModalOpen } = useSession();

  if (!session.isAuthenticated) {
    return (
      <div className="bg-[#0b0c0f] border-b border-zinc-900 p-2 flex justify-end">
        <button 
          onClick={() => setIsPinModalOpen(true)} 
          className="text-[10px] text-zinc-600 hover:text-[#ff5500] uppercase tracking-widest font-bold transition-colors flex items-center gap-2"
        >
          <Lock className="w-3 h-3" /> Operator Login
        </button>
      </div>
    );
  }

  const theme = ROLE_THEMES[session.role] || { color: 'gray', label: 'OPERATOR' };

  return (
    <div className="bg-[#0b0c0f] border-b border-zinc-800 p-3">
      <div className="container mx-auto flex justify-between items-center px-4">
        <div className="flex items-center gap-4">
          <Badge color={theme.color}>{theme.label}</Badge>
          <div className="flex items-center gap-2 text-zinc-400 font-mono text-xs uppercase tracking-tight">
            <User className="w-3 h-3" />
            <span>{session.identity}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={logout} 
            className="text-zinc-500 hover:text-white transition-colors p-1"
            title="Terminate Session"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminToolbar;

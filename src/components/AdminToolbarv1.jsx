import React from 'react';
import { useSession } from '../auth/useSession';
import { ROLES, ROLE_THEMES } from '../lib/roles';
import { Button, Badge } from '../ui/Components';

const AdminToolbar = () => {
  const { session, logout, setIsPinModalOpen } = useSession();

  if (!session.isAuthenticated) {
      return (
          <div className="bg-slate-950 border-b border-slate-900 p-2 flex justify-end">
              <button onClick={() => setIsPinModalOpen(true)} className="text-xs text-slate-600 hover:text-white uppercase tracking-wider font-bold transition-colors">
                  Operator Login
              </button>
          </div>
      );
  }

  if (session.role === ROLES.SPECTATOR) return null; 

  // Dynamic Theme based on Role
  const theme = ROLE_THEMES[session.role] || ROLE_THEMES[ROLES.SPECTATOR];
  const bgColor = `bg-${theme.color}-950/30`;
  const borderColor = `border-${theme.color}-900/50`;
  const textColor = `text-${theme.color}-200`;
  const badgeColor = theme.color;

  return (
    <div className={`${bgColor} border-b ${borderColor} p-3 transition-colors duration-300`}>
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
            <Badge color={badgeColor}>{theme.label}</Badge>
            <span className={`${textColor} font-mono text-sm uppercase tracking-tight`}>
                {session.identity}
                {session.teamId && <span className="opacity-50 mx-2">| TEAM ID: {session.teamId}</span>}
            </span>
        </div>
        <div className="flex gap-2">
           {/* Only Admins/Owners see force update */}
           {(session.role === ROLES.ADMIN || session.role === ROLES.OWNER) && (
              <Button variant="danger" className="text-xs py-1 px-2 h-7">Force Sync</Button>
           )}
          <Button variant="ghost" className="text-xs py-1 px-2 h-7" onClick={logout}>Logout</Button>
        </div>
      </div>
    </div>
  );
};

export default AdminToolbar;

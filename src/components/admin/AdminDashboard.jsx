import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../../auth/useSession';
import { 
  ShieldAlert, 
  Trophy, 
  ScrollText, 
  Users, 
  LogOut,
  Gamepad2 
} from 'lucide-react';

// Unified Imports
import { TournamentWarRoom } from '../TournamentWarRoom';
import { AdminAuditLog } from './AdminAuditLog';
import { StaffManagement } from './StaffManagement';
import { TeamRosterView } from './TeamRosterView'; // 👈 NEW IMPORT

export const AdminDashboard = () => {
  const { logout, session } = useSession();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('TEAMS'); // 👈 Default to TEAMS

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const renderTab = (id, label, Icon) => {
    const isActive = activeTab === id;
    return (
      <button
        onClick={() => setActiveTab(id)}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-all
          ${isActive 
            ? 'bg-fuchsia-600 text-white shadow-[0_0_15px_rgba(192,38,211,0.4)]' 
            : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300'}
        `}
      >
        <Icon className="w-4 h-4" />
        {label}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-fuchsia-500/30">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-fuchsia-600 rounded flex items-center justify-center shadow-[0_0_10px_rgba(192,38,211,0.5)]">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-['Teko'] text-2xl font-bold leading-none text-white tracking-wide">OVERWATCH</h1>
              <span className="text-[10px] font-mono text-zinc-500 uppercase flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                {session?.identity?.id ? `OP: ${session.identity.id.substring(0,8)}` : 'SYSTEM ONLINE'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-black/40 p-1 rounded-lg border border-white/5 overflow-x-auto">
            {renderTab('TEAMS', 'Roster', Users)}       {/* 👈 NEW TAB */}
            {renderTab('OPS', 'War Room', Trophy)}
            {renderTab('LOGS', 'Audit', ScrollText)}
            {renderTab('STAFF', 'Staff', Gamepad2)}
          </div>

          <button onClick={handleLogout} className="text-red-400 hover:text-red-300 text-xs font-bold uppercase flex items-center gap-2 transition-colors">
            <LogOut className="w-3 h-3" /> <span className="hidden md:inline">Disconnect</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto p-6">
        {activeTab === 'TEAMS' && <TeamRosterView />}   {/* 👈 NEW VIEW */}
        {activeTab === 'OPS' && <TournamentWarRoom />}
        {activeTab === 'LOGS' && <AdminAuditLog />}
        {activeTab === 'STAFF' && <StaffManagement />}
      </main>
    </div>
  );
};

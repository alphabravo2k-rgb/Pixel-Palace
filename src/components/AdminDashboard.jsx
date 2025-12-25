import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../auth/useSession'; // ✅ Up one level to src/auth
import { 
  ShieldAlert, 
  Trophy, 
  ScrollText, 
  Users, 
  LogOut 
} from 'lucide-react';

// ✅ SIBLING IMPORTS (Same Folder)
import { TournamentWarRoom } from './TournamentWarRoom';
import { AdminAuditLog } from './AdminAuditLog';

export const AdminDashboard = () => {
  const { logout, session } = useSession();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('OPS');

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
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
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-fuchsia-600 rounded flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-['Teko'] text-2xl font-bold leading-none text-white">OVERWATCH</h1>
              <span className="text-[10px] font-mono text-zinc-500 uppercase">
                {session?.identity?.id ? `OP: ${session.identity.id.substring(0,8)}` : 'SYSTEM OFFLINE'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-black/40 p-1 rounded-lg border border-white/5">
            {renderTab('OPS', 'War Room', Trophy)}
            {renderTab('LOGS', 'Audit Logs', ScrollText)}
            {renderTab('USERS', 'Staff', Users)}
          </div>

          <button onClick={handleLogout} className="text-red-400 hover:text-white text-xs font-bold uppercase flex items-center gap-2">
            <LogOut className="w-3 h-3" /> Disconnect
          </button>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto p-6">
        {activeTab === 'OPS' && <TournamentWarRoom />}
        {activeTab === 'LOGS' && <AdminAuditLog />}
        {activeTab === 'USERS' && (
          <div className="p-12 text-center border border-dashed border-zinc-800 rounded text-zinc-500 font-mono">
            User Management Module: Offline
          </div>
        )}
      </main>
    </div>
  );
};

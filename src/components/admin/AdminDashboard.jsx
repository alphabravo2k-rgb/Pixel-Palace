import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../../auth/useSession';
import { 
  ShieldAlert, 
  Trophy, 
  ScrollText, 
  Users, 
  LogOut,
  Lock
} from 'lucide-react';

// Components
import { TournamentWarRoom } from '../TournamentWarRoom';
import { AdminAuditLog } from '../AdminAuditLog'; 
import { StaffManagement } from '../StaffManagement'; // ✅ Now actively used

export const AdminDashboard = () => {
  const { logout, session } = useSession();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('OPS');

  // 🔒 ROLE GATING: Only OWNERS can see sensitive tabs
  // "Admins" can operate the tournament, but cannot see/add other staff.
  const isOwner = session.role === 'OWNER';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Helper to render tabs with security checks
  const renderTab = (id, label, Icon, restricted = false) => {
    // 🛡️ SECURITY: If restricted and user is not owner, return nothing (Hidden)
    if (restricted && !isOwner) return null; 

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
        {restricted && <Lock className="w-3 h-3 text-zinc-600 ml-1 opacity-50" />}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* Brand & Identity */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-fuchsia-600 rounded flex items-center justify-center shadow-lg shadow-fuchsia-900/50">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-['Teko'] text-2xl font-bold leading-none text-white tracking-wide">OVERWATCH</h1>
              <span className="text-[10px] font-mono text-zinc-500 uppercase flex items-center gap-2">
                 <span>OP: {session?.user?.id?.substring(0,8) || 'SYSTEM'}</span>
                 <span className="w-1 h-1 bg-zinc-700 rounded-full"></span>
                 <span className={isOwner ? "text-fuchsia-400 font-bold" : "text-blue-400"}>
                    {session.role || 'GUEST'}
                 </span>
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 bg-black/40 p-1 rounded-lg border border-white/5">
            {renderTab('OPS', 'War Room', Trophy)}
            {renderTab('LOGS', 'Audit Logs', ScrollText)}
            {/* 🛡️ This tab now completely disappears for non-owners */}
            {renderTab('USERS', 'Staff', Users, true)} 
          </div>

          {/* Logout */}
          <button onClick={handleLogout} className="text-red-400 hover:text-red-300 text-xs font-bold uppercase flex items-center gap-2 px-3 py-1.5 rounded hover:bg-red-900/10 transition-colors">
            <LogOut className="w-3 h-3" /> Disconnect
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto p-6">
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {activeTab === 'OPS' && <TournamentWarRoom />}
            {activeTab === 'LOGS' && <AdminAuditLog />}
            
            {/* 🛡️ DOUBLE PROTECTION: Even if they force the state, we don't render */}
            {activeTab === 'USERS' && isOwner && <StaffManagement />}
        </div>
      </main>
    </div>
  );
};

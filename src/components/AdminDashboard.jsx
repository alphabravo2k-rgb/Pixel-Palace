import React, { useState } from 'react';
import { LayoutDashboard, Users, Activity } from 'lucide-react';
import { AdminAuditLog } from './AdminAuditLog';
import { TournamentWarRoom } from './TournamentWarRoom';
import { AdminUsersPanel } from './AdminUsersPanel';

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('OPS');

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-['Teko'] uppercase text-white tracking-widest">Command Center</h1>
        <div className="flex gap-2 bg-zinc-900 p-1 rounded-lg">
          <button onClick={() => setActiveTab('OPS')} className={`flex items-center gap-2 px-4 py-2 rounded transition-all ${activeTab === 'OPS' ? 'bg-fuchsia-600 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}><LayoutDashboard className="w-4 h-4" /> OPS</button>
          <button onClick={() => setActiveTab('USERS')} className={`flex items-center gap-2 px-4 py-2 rounded transition-all ${activeTab === 'USERS' ? 'bg-fuchsia-600 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}><Users className="w-4 h-4" /> STAFF</button>
          <button onClick={() => setActiveTab('LOGS')} className={`flex items-center gap-2 px-4 py-2 rounded transition-all ${activeTab === 'LOGS' ? 'bg-fuchsia-600 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}><Activity className="w-4 h-4" /> AUDIT</button>
        </div>
      </div>
      <div className="min-h-[600px]">
        {activeTab === 'OPS' && <TournamentWarRoom />}
        {activeTab === 'USERS' && <AdminUsersPanel />}
        {activeTab === 'LOGS' && <AdminAuditLog />}
      </div>
    </div>
  );
};

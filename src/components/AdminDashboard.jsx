import React, { useState } from 'react';
import { LayoutDashboard, Users, Activity } from 'lucide-react';
import { AdminAuditLog } from './AdminAuditLog';
import { TournamentWarRoom } from './TournamentWarRoom';
import { AdminUsersPanel } from './AdminUsersPanel';

/**
 * 2️⃣ AdminDashboard — SHELL ARCHITECTURE
 * ❌ Removed Monolith: Logic is now delegated to focused panels.
 * ✅ Pure Composition: Manages layout and tab state only.
 */
export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('OPS'); // 'OPS' | 'USERS' | 'LOGS'

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-['Teko'] uppercase text-white tracking-widest">
          Command Center
        </h1>
        
        {/* Navigation Tabs */}
        <div className="flex gap-2 bg-zinc-900 p-1 rounded-lg">
          <TabButton 
            active={activeTab === 'OPS'} 
            onClick={() => setActiveTab('OPS')} 
            icon={LayoutDashboard} 
            label="War Room" 
          />
          <TabButton 
            active={activeTab === 'USERS'} 
            onClick={() => setActiveTab('USERS')} 
            icon={Users} 
            label="Staff" 
          />
          <TabButton 
            active={activeTab === 'LOGS'} 
            onClick={() => setActiveTab('LOGS')} 
            icon={Activity} 
            label="Audit" 
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="min-h-[600px]">
        {activeTab === 'OPS' && <TournamentWarRoom />}
        {activeTab === 'USERS' && <AdminUsersPanel />}
        {activeTab === 'LOGS' && <AdminAuditLog />}
      </div>
    </div>
  );
};

// UI Helper for Tabs
const TabButton = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`
      flex items-center gap-2 px-4 py-2 rounded transition-all duration-300
      ${active ? 'bg-fuchsia-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}
    `}
  >
    <Icon className="w-4 h-4" />
    <span className="uppercase font-bold text-sm tracking-wider">{label}</span>
  </button>
);

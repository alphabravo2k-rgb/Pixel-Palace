import React, { useState, useEffect } from 'react';
import { useTournament } from '../../tournament/useTournament';
import { useAdminConsole } from '../../hooks/useAdminConsole'; 
import { supabase } from '../../supabase/client';
import { AdminToolbar } from './AdminToolbar';
import { AdminRosterReview } from './AdminRosterReview';
import { StaffManagement } from './StaffManagement'; 
import { BracketView } from '../BracketView'; 
import { 
  LayoutGrid, Users, Settings, Activity, ShieldAlert, History, RefreshCw, Play, AlertTriangle 
} from 'lucide-react';

export const AdminDashboard = () => {
  const { selectedTournamentId } = useTournament();
  const [activeView, setActiveView] = useState('bracket'); 

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <AdminToolbar />

      <div className="flex flex-1 pt-14 h-[calc(100vh-3.5rem)] overflow-hidden">
        
        {/* SIDEBAR */}
        <aside className="w-64 bg-zinc-950 border-r border-white/10 flex flex-col shrink-0 z-20">
          <div className="p-6">
            <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">War Room</h2>
            <div className="space-y-2">
              <NavButton active={activeView === 'bracket'} onClick={() => setActiveView('bracket')} icon={<LayoutGrid className="w-4 h-4" />} label="Live Operations" desc="Bracket & Matches" />
              <NavButton active={activeView === 'rosters'} onClick={() => setActiveView('rosters')} icon={<Users className="w-4 h-4" />} label="Roster Integrity" desc="Audit & Roles" />
              <NavButton active={activeView === 'settings'} onClick={() => setActiveView('settings')} icon={<Settings className="w-4 h-4" />} label="Tournament Ops" desc="Sync & Generation" />
            </div>

            <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-8 mb-4">Governance</h2>
            <div className="space-y-2">
              <NavButton active={activeView === 'audit'} onClick={() => setActiveView('audit')} icon={<History className="w-4 h-4" />} label="Audit Trail" desc="Security Logs" />
              <NavButton active={activeView === 'staff'} onClick={() => setActiveView('staff')} icon={<ShieldAlert className="w-4 h-4" />} label="Staff Access" desc="Manage Admins" />
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 bg-[#060709] relative flex flex-col min-w-0">
          <div className="flex-1 overflow-y-auto custom-scrollbar bg-[url('/grid-pattern.svg')] bg-fixed relative">
            {!selectedTournamentId ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500">
                <Settings className="w-16 h-16 mb-4 opacity-20" />
                <p className="uppercase tracking-widest text-sm font-bold">Select Event in Toolbar</p>
              </div>
            ) : (
              <>
                {activeView === 'bracket' && <BracketView />}
                {activeView === 'rosters' && <div className="p-8"><AdminRosterReview tournamentId={selectedTournamentId} /></div>}
                {activeView === 'staff' && <div className="p-8"><StaffManagement /></div>}
                
                {/* ✅ RESTORED: SETTINGS / OPS VIEW */}
                {activeView === 'settings' && <TournamentOpsView tournamentId={selectedTournamentId} />}
                
                {/* ✅ RESTORED: AUDIT LOG VIEW */}
                {activeView === 'audit' && <div className="p-8"><AdminAuditLogViewer /></div>}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

// --- RESTORED SUB-COMPONENTS ---

const TournamentOpsView = ({ tournamentId }) => {
  const { execute, loading } = useAdminConsole();

  const handleSync = async () => {
    if(!window.confirm("Pull latest registration data? This may overwrite team names.")) return;
    const res = await execute('admin_sync_rosters', { p_tournament_id: tournamentId });
    alert(res.message);
  };

  const handleGenerate = async () => {
    if(!window.confirm("GENERATE BRACKET? This will wipe existing matches and re-seed.")) return;
    const res = await execute('admin_generate_bracket', { p_tournament_id: tournamentId });
    alert(res.message);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="bg-zinc-900 border border-white/10 p-6 rounded-lg">
        <h3 className="text-xl font-['Teko'] uppercase text-white mb-2">Registration Sync</h3>
        <p className="text-zinc-500 text-sm mb-6">Pulls raw registration data and normalizes it into Teams/Players tables.</p>
        <button onClick={handleSync} disabled={loading} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase text-xs rounded flex items-center gap-2">
           <RefreshCw className={loading ? 'animate-spin' : ''} size={16} /> Sync Rosters
        </button>
      </div>

      <div className="bg-zinc-900 border border-fuchsia-500/30 p-6 rounded-lg">
        <h3 className="text-xl font-['Teko'] uppercase text-fuchsia-400 mb-2">Bracket Logic</h3>
        <p className="text-zinc-500 text-sm mb-6">Generates the seeding and match nodes based on current roster. ⚠️ Destructive Action.</p>
        <button onClick={handleGenerate} disabled={loading} className="px-6 py-3 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold uppercase text-xs rounded flex items-center gap-2 shadow-[0_0_20px_rgba(192,38,211,0.3)]">
           <Play size={16} /> Generate Bracket
        </button>
      </div>
    </div>
  );
};

const AdminAuditLogViewer = () => {
  const [logs, setLogs] = useState([]);
  
  useEffect(() => {
    const fetchLogs = async () => {
      const { data } = await supabase.from('admin_audit_logs').select('*').order('created_at', { ascending: false }).limit(50);
      setLogs(data || []);
    };
    fetchLogs();
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-['Teko'] uppercase text-zinc-400">Immutable Audit Trail</h2>
      <div className="bg-zinc-900 border border-white/5 rounded overflow-hidden">
        <table className="w-full text-left text-xs font-mono text-zinc-400">
          <thead className="bg-white/5 uppercase text-zinc-500">
            <tr>
              <th className="p-3">Time</th>
              <th className="p-3">Operator</th>
              <th className="p-3">Action</th>
              <th className="p-3">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {logs.map(log => (
              <tr key={log.id} className="hover:bg-white/5">
                <td className="p-3 text-zinc-600">{new Date(log.created_at).toLocaleTimeString()}</td>
                <td className="p-3 text-fuchsia-400">{log.admin_id.substring(0,8)}</td>
                <td className="p-3 font-bold text-white">{log.action_type}</td>
                <td className="p-3 max-w-md truncate" title={JSON.stringify(log.details)}>{JSON.stringify(log.details)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && <div className="p-8 text-center text-zinc-600">No audit records found.</div>}
      </div>
    </div>
  );
};

// Sidebar Helper
const NavButton = ({ active, onClick, icon, label, desc }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all group ${active ? 'bg-fuchsia-900/20 border border-fuchsia-500/30 text-white shadow-[0_0_15px_rgba(192,38,211,0.15)]' : 'hover:bg-white/5 border border-transparent text-zinc-400 hover:text-white'}`}>
    <div className={`w-8 h-8 rounded flex items-center justify-center transition-colors shrink-0 ${active ? 'bg-fuchsia-600 text-white' : 'bg-zinc-800 group-hover:bg-zinc-700'}`}>{icon}</div>
    <div className="min-w-0"><div className={`text-sm font-bold uppercase tracking-wide truncate ${active ? 'text-fuchsia-300' : 'text-zinc-300'}`}>{label}</div><div className="text-[10px] text-zinc-600 font-mono truncate group-hover:text-zinc-500">{desc}</div></div>
  </button>
);

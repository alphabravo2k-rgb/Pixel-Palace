import React, { useState } from 'react';
import { useTournament } from '../../tournament/useTournament';
import { AdminToolbar } from './AdminToolbar';
import { AdminRosterReview } from './AdminRosterReview';
import { BracketView } from '../BracketView'; // Re-using your main bracket view
import { 
  LayoutGrid, 
  Users, 
  Settings, 
  Trophy, 
  Activity, 
  AlertCircle 
} from 'lucide-react';

export const AdminDashboard = () => {
  const { selectedTournamentId } = useTournament();
  
  // This state controls which "Screen" you see in the War Room
  const [activeView, setActiveView] = useState('bracket'); 

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      
      {/* 1. TOP BAR (Global Context Switcher) */}
      <AdminToolbar />

      <div className="flex flex-1 pt-14 h-[calc(100vh-3.5rem)] overflow-hidden">
        
        {/* 2. SIDEBAR NAVIGATION (Your "Buttons") */}
        <aside className="w-64 bg-zinc-950 border-r border-white/10 flex flex-col">
          
          <div className="p-6">
            <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">
              Command Modules
            </h2>
            <div className="space-y-2">
              <NavButton 
                active={activeView === 'bracket'} 
                onClick={() => setActiveView('bracket')} 
                icon={<LayoutGrid className="w-4 h-4" />} 
                label="Live Operations" 
                desc="Bracket & Matches"
              />
              <NavButton 
                active={activeView === 'rosters'} 
                onClick={() => setActiveView('rosters')} 
                icon={<Users className="w-4 h-4" />} 
                label="Roster Integrity" 
                desc="Audit & Roles"
              />
              <NavButton 
                active={activeView === 'settings'} 
                onClick={() => setActiveView('settings')} 
                icon={<Settings className="w-4 h-4" />} 
                label="Event Config" 
                desc="Rules & Format"
              />
            </div>
          </div>

          {/* System Status Footer */}
          <div className="mt-auto p-6 border-t border-white/5">
            <div className="bg-zinc-900/50 rounded p-3 border border-white/5">
              <div className="flex items-center gap-2 text-emerald-500 text-xs font-bold uppercase mb-1">
                <Activity className="w-3 h-3" /> System Optimal
              </div>
              <p className="text-[10px] text-zinc-500 font-mono">
                Realtime Socket: Connected<br/>
                Latency: 24ms
              </p>
            </div>
          </div>
        </aside>

        {/* 3. MAIN CONTENT AREA */}
        <main className="flex-1 bg-black/50 relative overflow-hidden flex flex-col">
          
          {/* View Header */}
          <header className="h-16 border-b border-white/5 flex items-center px-8 bg-zinc-950/30 backdrop-blur-sm shrink-0">
             <h1 className="text-2xl font-['Teko'] uppercase tracking-wide text-white">
               {activeView === 'bracket' && 'Live Tournament Operations'}
               {activeView === 'rosters' && 'Roster & Identity Management'}
               {activeView === 'settings' && 'Tournament Configuration'}
             </h1>
          </header>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar bg-[url('/grid-pattern.svg')] bg-fixed">
            {!selectedTournamentId ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-500">
                <Trophy className="w-12 h-12 mb-4 opacity-20" />
                <p className="uppercase tracking-widest text-sm">Select an Event in the Toolbar</p>
              </div>
            ) : (
              <>
                {/* --- THE VIEWS --- */}
                {activeView === 'bracket' && (
                  <div className="min-h-full">
                     {/* We render the BracketView, but we might want to hide its header since we have our own */}
                     <BracketView isAdminMode={true} /> 
                  </div>
                )}

                {activeView === 'rosters' && (
                  <div className="p-8">
                    <AdminRosterReview tournamentId={selectedTournamentId} />
                  </div>
                )}

                {activeView === 'settings' && (
                  <div className="p-8 flex flex-col items-center justify-center h-full text-zinc-600">
                    <AlertCircle className="w-10 h-10 mb-4" />
                    <p className="font-mono text-sm">CONFIGURATION MODULE COMING SOON</p>
                  </div>
                )}
              </>
            )}
          </div>
        </main>

      </div>
    </div>
  );
};

// Helper Component for the Sidebar Buttons
const NavButton = ({ active, onClick, icon, label, desc }) => (
  <button
    onClick={onClick}
    className={`
      w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all group
      ${active 
        ? 'bg-fuchsia-900/20 border border-fuchsia-500/30 text-white shadow-[0_0_15px_rgba(192,38,211,0.15)]' 
        : 'hover:bg-white/5 border border-transparent text-zinc-400 hover:text-white'}
    `}
  >
    <div className={`
      w-8 h-8 rounded flex items-center justify-center transition-colors
      ${active ? 'bg-fuchsia-600 text-white' : 'bg-zinc-800 group-hover:bg-zinc-700'}
    `}>
      {icon}
    </div>
    <div>
      <div className={`text-sm font-bold uppercase tracking-wide ${active ? 'text-fuchsia-300' : 'text-zinc-300'}`}>
        {label}
      </div>
      <div className="text-[10px] text-zinc-600 font-mono group-hover:text-zinc-500">
        {desc}
      </div>
    </div>
  </button>
);

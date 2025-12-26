import React, { useState } from 'react';
import { useSession } from '../../auth/useSession';
import { useTournament } from '../../tournament/useTournament';
import { RosterBuilder } from '../roster/RosterBuilder';
import { Shield, Swords, User, LogOut, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PlayerDashboard = () => {
  const { session, logout } = useSession();
  const { selectedTournamentId } = useTournament();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('ROSTER');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Safe check for identity data
  const identity = session?.identity || {};
  const username = identity.username || 'Unknown Player';
  const reputation = identity.reputation_score || 1000;

  return (
    <div className="min-h-screen bg-black text-white selection:bg-fuchsia-500/30">
      
      {/* 1. TOP NAV (Identity Layer) */}
      <div className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            {/* Avatar / Reputation */}
            <div className="relative group cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-zinc-800 border-2 border-fuchsia-600 flex items-center justify-center overflow-hidden">
                 {identity.avatar_url ? (
                   <img src={identity.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                 ) : (
                   <User className="w-5 h-5 text-zinc-400" />
                 )}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-black rounded-full px-1.5 py-0.5 border border-white/10 text-[10px] font-mono text-fuchsia-400 font-bold">
                {reputation}
              </div>
            </div>

            <div>
              <h1 className="font-['Teko'] text-2xl font-bold leading-none text-white tracking-wide">
                {username}
              </h1>
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"/> ONLINE
              </span>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-colors uppercase tracking-widest"
          >
            <LogOut className="w-3 h-3" /> Disconnect
          </button>
        </div>
      </div>

      {/* 2. MAIN CONTENT */}
      <main className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* LEFT COLUMN: Navigation */}
        <div className="lg:col-span-1 space-y-2">
          <NavButton 
            active={activeTab === 'ROSTER'} 
            onClick={() => setActiveTab('ROSTER')} 
            icon={Shield} 
            label="My Team" 
          />
          <NavButton 
            active={activeTab === 'MATCHES'} 
            onClick={() => setActiveTab('MATCHES')} 
            icon={Swords} 
            label="Matches" 
            badge="0"
          />
           <NavButton 
            active={activeTab === 'STATS'} 
            onClick={() => setActiveTab('STATS')} 
            icon={Trophy} 
            label="Career Stats" 
          />
        </div>

        {/* RIGHT COLUMN: The Action Area */}
        <div className="lg:col-span-3">
          
          {/* TAB: ROSTER MANAGEMENT */}
          {activeTab === 'ROSTER' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
               {!selectedTournamentId ? (
                 <div className="p-8 border border-dashed border-white/10 rounded-lg text-center text-zinc-500">
                   Select a tournament to view roster settings.
                 </div>
               ) : (
                 <RosterBuilder /> 
               )}
            </div>
          )}

          {/* TAB: MATCHES (Placeholder for next step) */}
          {activeTab === 'MATCHES' && (
            <div className="p-12 text-center bg-zinc-900 border border-white/10 rounded-lg">
              <Swords className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
              <h3 className="text-xl font-['Teko'] uppercase text-zinc-500">No Active Matches</h3>
              <p className="text-zinc-600 text-sm font-mono mt-2">
                When the bracket goes live, your games will appear here for Veto & Check-in.
              </p>
            </div>
          )}

          {/* TAB: STATS (Placeholder) */}
          {activeTab === 'STATS' && (
             <div className="p-12 text-center bg-zinc-900 border border-white/10 rounded-lg">
               <Trophy className="w-12 h-12 text-yellow-500/20 mx-auto mb-4" />
               <h3 className="text-xl font-['Teko'] uppercase text-zinc-500">Career Profile</h3>
               <p className="text-zinc-600 text-sm font-mono mt-2">
                 Global stats tracking coming in Phase 2.
               </p>
             </div>
          )}

        </div>
      </main>
    </div>
  );
};

// Simple UI Helper for the buttons
const NavButton = ({ active, onClick, icon: Icon, label, badge }) => (
  <button
    onClick={onClick}
    className={`
      w-full flex items-center justify-between p-3 rounded-lg transition-all border
      ${active 
        ? 'bg-zinc-800 border-fuchsia-600 text-white shadow-lg shadow-fuchsia-900/10' 
        : 'bg-transparent border-transparent text-zinc-500 hover:bg-white/5 hover:text-zinc-300'}
    `}
  >
    <div className="flex items-center gap-3">
      <Icon className={`w-4 h-4 ${active ? 'text-fuchsia-500' : 'text-zinc-600'}`} />
      <span className="font-bold uppercase tracking-wider text-sm">{label}</span>
    </div>
    {badge && (
      <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 rounded-full">
        {badge}
      </span>
    )}
  </button>
);

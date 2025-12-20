import React, { useState, useCallback, memo } from 'react';
import TeamRoster from '../components/TeamRoster';
import Bracket from '../components/Bracket';
import AdminToolbar from '../components/AdminToolbar';
import MatchModal from '../components/MatchModal';
import { LayoutGrid, Network, Trophy } from 'lucide-react';
import { useSession } from '../auth/useSession';

// --- CONFIGURATION ---
const APP_VERSION = import.meta.env.VITE_APP_VERSION || 'v2.5.1'; 
const VIEWS = {
  BRACKET: 'bracket',
  TEAMS: 'teams'
};

// --- SUB-COMPONENTS ---

const NavButton = memo(({ view, currentView, onClick, label, icon: Icon }) => (
  <button 
    onClick={() => onClick(view)}
    className={`
      relative px-6 py-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-200
      ${currentView === view 
        ? 'text-[#ff5500] bg-[#ff5500]/10 border-b-2 border-[#ff5500] shadow-[0_4px_20px_-10px_rgba(255,85,0,0.5)]' 
        : 'text-zinc-500 hover:text-zinc-300 border-b-2 border-transparent hover:bg-white/5'}
    `}
    type="button"
  >
    <Icon className="w-3.5 h-3.5" />
    {label}
  </button>
));
NavButton.displayName = 'NavButton';

const LayoutContainer = ({ children, className = "" }) => (
  <div className={`container mx-auto px-4 md:px-8 ${className}`}>
    {children}
  </div>
);

// --- MAIN ROUTER ---

const Router = () => {
  const { session, permissions } = useSession(); 
  const [currentView, setCurrentView] = useState(VIEWS.BRACKET); 
  const [selectedMatch, setSelectedMatch] = useState(null);

  const handleViewChange = useCallback((view) => {
    setCurrentView(view);
  }, []);

  const handleMatchClick = useCallback((match) => {
    if (!session.isAuthenticated && !permissions.isSpectator) {
        console.warn("[Router] Access Denied: User is Guest");
        return;
    }
    setSelectedMatch(match);
  }, [session.isAuthenticated, permissions]);

  return (
    <div className="min-h-screen bg-[#060709] text-zinc-300 flex flex-col font-sans selection:bg-[#ff5500] selection:text-black">
      <AdminToolbar />

      <nav className="border-b border-zinc-800 bg-[#0b0c0f]/80 backdrop-blur-md sticky top-0 z-40">
        <LayoutContainer>
          <div className="flex justify-between items-end h-16">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-[#ff5500] flex items-center justify-center shadow-[0_0_15px_rgba(255,85,0,0.3)]">
                <Trophy className="w-5 h-5 text-black fill-black" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-black text-white italic tracking-tighter uppercase leading-none">
                  PIXEL <span className="text-zinc-600">PALACE</span>
                </h1>
                <span className="text-[9px] font-mono text-[#ff5500] uppercase tracking-[0.3em]">
                  Operations Command
                </span>
              </div>
            </div>

            <div className="flex h-full items-end gap-1">
              <NavButton 
                view={VIEWS.BRACKET} 
                currentView={currentView} 
                onClick={handleViewChange} 
                label="Bracket" 
                icon={Network} 
              />
              <NavButton 
                view={VIEWS.TEAMS} 
                currentView={currentView} 
                onClick={handleViewChange} 
                label="Roster" 
                icon={LayoutGrid} 
              />
            </div>
          </div>
        </LayoutContainer>
      </nav>

      <main className="flex-grow relative py-12">
        <div className="fixed inset-0 bg-tactical-grid"></div>
        <LayoutContainer className="relative z-10">
          {currentView === VIEWS.BRACKET && <Bracket onMatchClick={handleMatchClick} />}
          {currentView === VIEWS.TEAMS && <TeamRoster />}
        </LayoutContainer>
      </main>

      <footer className="border-t border-zinc-900 bg-[#060709] py-8 mt-auto">
        <LayoutContainer className="text-center">
          <p className="text-[10px] text-zinc-700 font-mono uppercase tracking-widest group cursor-help">
            Pixel Palace {'//'} {APP_VERSION}
            <span className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 text-zinc-500">
               {'//'} ID: {session.identity} [{session.role}]
            </span>
          </p>
        </LayoutContainer>
      </footer>

      {(session.isAuthenticated || permissions.isSpectator) && (
        <MatchModal match={selectedMatch} onClose={() => setSelectedMatch(null)} />
      )}
    </div>
  );
};

export default Router;

import React, { useState, useEffect } from 'react';
import TeamRoster from '../components/TeamRoster';
import Bracket from '../components/Bracket';
import MatchModal from '../components/MatchModal';
import { LayoutGrid, Network, Zap } from 'lucide-react';
import { useSession } from '../auth/useSession';

const VIEWS = { BRACKET: 'bracket', TEAMS: 'teams' };

const NavButton = ({ view, currentView, onClick, label, icon: Icon }) => (
  <button 
    onClick={() => onClick(view)}
    className={`
      relative px-8 py-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300
      ${currentView === view 
        ? 'text-fuchsia-400 bg-fuchsia-900/10 border-b-2 border-fuchsia-500 shadow-[0_4px_20px_rgba(192,38,211,0.2)]' 
        : 'text-zinc-500 hover:text-white border-b-2 border-transparent hover:bg-white/5'}
    `}
  >
    <Icon className={`w-3.5 h-3.5 ${currentView === view ? 'animate-pulse' : ''}`} /> {label}
  </button>
);

const BracketView = ({ initialTab = VIEWS.BRACKET }) => {
  const { session } = useSession(); 
  const [currentView, setCurrentView] = useState(initialTab); 
  const [selectedMatch, setSelectedMatch] = useState(null);

  // Sync prop changes to state
  useEffect(() => {
    setCurrentView(initialTab);
  }, [initialTab]);

  return (
    <div className="flex flex-col min-h-screen bg-[#060709] font-sans">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
         <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-fuchsia-900/10 blur-[120px] rounded-full mix-blend-screen" />
         <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-900/10 blur-[120px] rounded-full mix-blend-screen" />
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />
      </div>

      {/* Navigation Header */}
      <nav className="border-b border-zinc-800 bg-[#0b0c0f]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end h-auto md:h-20 pb-0 pt-4 md:pt-0">
            <div className="flex items-center gap-4 mb-4 md:mb-5">
              <div className="w-12 h-12 bg-gradient-to-br from-fuchsia-600 to-purple-700 flex items-center justify-center shadow-lg shadow-fuchsia-900/20 rounded-sm">
                <Zap className="w-6 h-6 text-white fill-white" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">
                  PIXEL <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-400 to-zinc-600">PALACE</span>
                </h1>
                <span className="text-[10px] font-mono text-fuchsia-500 uppercase tracking-[0.4em] font-bold">
                  Operations Command
                </span>
              </div>
            </div>
            
            <div className="flex w-full md:w-auto border-t md:border-t-0 border-zinc-800 md:border-none">
              <NavButton view={VIEWS.BRACKET} currentView={currentView} onClick={setCurrentView} label="Bracket" icon={Network} />
              <NavButton view={VIEWS.TEAMS} currentView={currentView} onClick={setCurrentView} label="Roster" icon={LayoutGrid} />
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow relative z-10">
        <div className="container mx-auto px-4 md:px-8 py-12">
          {currentView === VIEWS.BRACKET && <Bracket onMatchClick={setSelectedMatch} />}
          {currentView === VIEWS.TEAMS && <TeamRoster />}
        </div>
      </main>

      <footer className="border-t border-zinc-900 bg-[#060709] py-8 mt-auto text-center relative z-10">
         <p className="text-[9px] text-zinc-700 font-mono uppercase tracking-[0.3em]">
           System v2.5.1 // Secured by Bravo.gg
         </p>
      </footer>

      {selectedMatch && <MatchModal match={selectedMatch} onClose={() => setSelectedMatch(null)} />}
    </div>
  );
};

export default BracketView;

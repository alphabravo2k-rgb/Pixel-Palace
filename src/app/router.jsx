import React, { useState } from 'react';
import TeamRoster from '../components/TeamRoster';
import Bracket from '../components/Bracket';
import AdminToolbar from '../components/AdminToolbar';
import MatchModal from '../components/MatchModal';
import { Button } from '../ui/Components';

const Router = () => {
  const [currentView, setCurrentView] = useState('bracket'); // 'bracket' | 'teams'
  const [selectedMatch, setSelectedMatch] = useState(null);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans">
      <AdminToolbar />
      
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-30">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white">TM</div>
            <span className="font-bold text-xl tracking-tight text-white">TourneyManager</span>
          </div>
          
          <div className="flex gap-1 bg-slate-800 p-1 rounded-lg">
            <button 
              onClick={() => setCurrentView('bracket')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${currentView === 'bracket' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              Bracket
            </button>
            <button 
              onClick={() => setCurrentView('teams')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${currentView === 'teams' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              Teams
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 flex-grow">
        {currentView === 'bracket' && <Bracket onMatchClick={setSelectedMatch} />}
        {currentView === 'teams' && <TeamRoster />}
      </main>

      {/* Modals */}
      <MatchModal match={selectedMatch} onClose={() => setSelectedMatch(null)} />
    </div>
  );
};

export default Router;

import React, { useState } from 'react';
import { createPortal } from 'react-dom';

// --- IMPORTS ---
// If these components are default exports in your project, keep them without { }.
// If you updated them to be named exports, add { } around them.
import VetoPanel from './VetoPanel'; 
import AdminMatchControls from './AdminMatchControls'; 

// ✅ FIX: Use Named Import for AdminAuditLog (This was the error)
import { AdminAuditLog } from './AdminAuditLog'; 

import { useSession } from '../auth/useSession'; // Assuming this hook exists
import { Server, Tv, ShieldAlert, Copy, Check, X, Activity, Download, Shield, Trophy } from 'lucide-react';

/**
 * MatchModal
 * Displays detailed match info, vetoes, and admin controls.
 */
export const MatchModal = ({ match, teams, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'veto' | 'admin' | 'logs'
  const [copied, setCopied] = useState(false);
  
  // Get Session State
  const { isAdmin } = useSession(); // Adjust based on your actual auth hook return values

  // Helper to find team data
  const team1 = teams.find(t => t.id === match.team1_id);
  const team2 = teams.find(t => t.id === match.team2_id);

  // Helper for Copy to Clipboard
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Close on Escape key
  React.useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Prevent background scrolling when modal is open
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      
      {/* MODAL CONTAINER */}
      <div className="bg-[#0a0a0a] border border-zinc-800 w-full max-w-4xl max-h-[90vh] flex flex-col rounded-lg shadow-2xl overflow-hidden relative">
        
        {/* HEADER */}
        <div className="flex justify-between items-center p-6 border-b border-zinc-800 bg-zinc-950">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-zinc-900 rounded border border-zinc-800">
                <Trophy className="w-5 h-5 text-fuchsia-500" />
            </div>
            <div>
                <h2 className="text-xl font-black text-white uppercase tracking-widest font-['Teko']">
                    Match Details
                </h2>
                <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
                    <span className="bg-zinc-900 px-1.5 py-0.5 rounded text-zinc-400">R{match.round}</span>
                    <span>•</span>
                    <span className="uppercase">{match.state}</span>
                    <span>•</span>
                    <span>BO{match.best_of}</span>
                </div>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-2 hover:bg-zinc-900 rounded-full transition-colors text-zinc-500 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* CONTENT BODY */}
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col md:flex-row">
            
            {/* LEFT SIDE: MATCHUP INFO */}
            <div className="w-full md:w-1/3 border-r border-zinc-800 bg-zinc-900/20 p-6 flex flex-col gap-6">
                
                {/* TEAMS DISPLAY */}
                <div className="flex flex-col gap-4">
                    {/* Team 1 */}
                    <div className={`p-4 rounded border ${match.winner_id === match.team1_id ? 'border-green-500/50 bg-green-900/10' : 'border-zinc-800 bg-black/40'}`}>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Team 1</span>
                            {match.winner_id === match.team1_id && <Trophy className="w-4 h-4 text-green-500" />}
                        </div>
                        <div className="font-bold text-white text-lg truncate">{team1?.name || 'TBD'}</div>
                        <div className="text-xs text-zinc-600 font-mono">Seed #{team1?.seed_number || '?'}</div>
                    </div>

                    <div className="text-center text-zinc-700 font-black italic text-xl">VS</div>

                    {/* Team 2 */}
                    <div className={`p-4 rounded border ${match.winner_id === match.team2_id ? 'border-green-500/50 bg-green-900/10' : 'border-zinc-800 bg-black/40'}`}>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Team 2</span>
                            {match.winner_id === match.team2_id && <Trophy className="w-4 h-4 text-green-500" />}
                        </div>
                        <div className="font-bold text-white text-lg truncate">{team2?.name || 'TBD'}</div>
                        <div className="text-xs text-zinc-600 font-mono">Seed #{team2?.seed_number || '?'}</div>
                    </div>
                </div>

                {/* SERVER INFO */}
                <div className="mt-auto">
                    <div className="text-[10px] uppercase font-bold text-zinc-500 mb-2 tracking-widest">Connect String</div>
                    <div className="flex gap-2">
                        <code className="flex-1 bg-black p-2 rounded border border-zinc-800 text-xs text-zinc-300 font-mono truncate">
                            {match.server_ip !== 'HIDDEN' ? `connect ${match.server_ip}` : 'SERVER HIDDEN'}
                        </code>
                        {match.server_ip !== 'HIDDEN' && (
                            <button 
                                onClick={() => handleCopy(`connect ${match.server_ip}`)}
                                className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded border border-zinc-700 text-white transition-colors"
                            >
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE: TABS & CONTROLS */}
            <div className="w-full md:w-2/3 flex flex-col bg-zinc-950/50">
                
                {/* TAB NAVIGATION */}
                <div className="flex border-b border-zinc-800">
                    <button 
                        onClick={() => setActiveTab('overview')}
                        className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'overview' ? 'bg-zinc-900 text-white border-b-2 border-fuchsia-500' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        Overview
                    </button>
                    <button 
                        onClick={() => setActiveTab('veto')}
                        className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'veto' ? 'bg-zinc-900 text-white border-b-2 border-fuchsia-500' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        Map Veto
                    </button>
                    {isAdmin && (
                        <>
                            <button 
                                onClick={() => setActiveTab('admin')}
                                className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'admin' ? 'bg-zinc-900 text-red-400 border-b-2 border-red-500' : 'text-zinc-500 hover:text-red-400'}`}
                            >
                                Admin Controls
                            </button>
                            <button 
                                onClick={() => setActiveTab('logs')}
                                className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'logs' ? 'bg-zinc-900 text-white border-b-2 border-fuchsia-500' : 'text-zinc-500 hover:text-zinc-300'}`}
                            >
                                Audit Logs
                            </button>
                        </>
                    )}
                </div>

                {/* TAB CONTENT */}
                <div className="p-6 h-full min-h-[400px]">
                    
                    {activeTab === 'overview' && (
                        <div className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-4">
                            <Activity className="w-12 h-12 opacity-20" />
                            <p className="text-sm font-mono">Match feed and stats coming soon.</p>
                        </div>
                    )}

                    {activeTab === 'veto' && (
                        <VetoPanel matchId={match.id} team1={team1} team2={team2} />
                    )}

                    {activeTab === 'admin' && isAdmin && (
                        <AdminMatchControls match={match} />
                    )}

                    {activeTab === 'logs' && isAdmin && (
                        <AdminAuditLog limit={20} />
                    )}

                </div>
            </div>
        </div>

      </div>
    </div>,
    document.body
  );
};

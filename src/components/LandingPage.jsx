import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../auth/useSession';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { session } = useSession();

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20"></div>
      
      <div className="z-10 text-center space-y-6 max-w-2xl px-4">
        <h1 className="text-6xl md:text-8xl font-['Teko'] uppercase leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-600">
          Pixel Palace
        </h1>
        <p className="text-zinc-400 text-lg font-mono">
          The Global Standard for Competitive Esports.
        </p>

        <div className="flex gap-4 justify-center mt-8">
          <button 
            onClick={() => navigate('/login')}
            className="px-8 py-3 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold uppercase tracking-widest rounded transition-all shadow-lg shadow-fuchsia-900/20"
          >
            Enter System
          </button>
          
          {session?.isAuthenticated && (
            <button 
              onClick={() => navigate('/dashboard')}
              className="px-8 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold uppercase tracking-widest rounded transition-all border border-white/10"
            >
              Go to Dashboard
            </button>
          )}
        </div>
      </div>
      
      <div className="absolute bottom-8 text-zinc-600 text-xs font-mono uppercase">
        System Status: Operational // v2.5.0
      </div>
    </div>
  );
};

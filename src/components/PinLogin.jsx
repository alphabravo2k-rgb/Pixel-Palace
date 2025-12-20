import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; 
import { supabase } from '../supabase/client';
import { MessageSquare, ShieldAlert, Eye, LogOut, ArrowRight, Network, Users } from 'lucide-react';

const PinLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // STATES
  const [isVisible, setIsVisible] = useState(!location.state?.skipLogin);
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // NEW: Welcome State
  const [loggedInUser, setLoggedInUser] = useState(null); 
  const [showWelcome, setShowWelcome] = useState(false);

  // EFFECTS
  useEffect(() => {
    if (location.state?.skipLogin) setIsVisible(false);
  }, [location.state]);

  // HANDLERS
  const handleLogin = async (e) => {
    e.preventDefault();
    if (pin.length < 3) return;
    setLoading(true);
    setError(null);

    try {
      // 1. Try Admin Login
      const { data: adminData, error: adminError } = await supabase.rpc('api_admin_login', { p_pin: pin });
      if (!adminError && adminData.status === 'SUCCESS') {
        setLoggedInUser({
          type: 'ADMIN',
          name: adminData.profile.display_name || 'Officer',
          role: adminData.profile.role,
          pin: pin
        });
        setShowWelcome(true); 
        return;
      }

      // 2. Try Captain Login
      const { data: captainData, error: captainError } = await supabase.rpc('api_get_captain_state', { p_pin: pin });
      if (!captainError && captainData) {
        setLoggedInUser({
          type: 'CAPTAIN',
          name: captainData.team_name,
          role: 'Team Captain',
          pin: pin,
          team: captainData.team_name
        });
        setShowWelcome(true); 
        return;
      }

      throw new Error("Invalid Credentials");
    } catch (err) {
      console.error(err);
      setError("ACCESS DENIED");
    } finally {
      setLoading(false);
    }
  };

  const proceedToApp = (destination) => {
    // Navigate with PIN state so destination knows we are auth'd
    if (!loggedInUser) return;
    const dest = destination || (loggedInUser.type === 'ADMIN' ? '/admin' : '/veto');
    navigate(dest, { state: { pin: loggedInUser.pin } });
  };

  // Safe navigation for non-auth pages (bracket/roster)
  const safeNavigate = (path) => {
    // If we are logged in, we pass the PIN so they don't lose session
    // If not, we just close modal
    if (loggedInUser) {
        navigate(path, { state: { skipLogin: true } });
    } else {
        navigate(path, { state: { skipLogin: true } });
        setIsVisible(false);
    }
  };

  const logout = () => {
    setLoggedInUser(null);
    setShowWelcome(false);
    setPin('');
  };

  // Logic: Show if (Visible AND on Home Page/Bracket/Roster)
  const isAuthPage = ['/', '/bracket', '/roster'].includes(window.location.pathname);
  if (!isVisible || !isAuthPage) return null;

  // --- RENDER: WELCOME HUD (The Creative Layout) ---
  if (showWelcome && loggedInUser) {
    return (
      <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4 font-sans backdrop-blur-md animate-in fade-in duration-500">
        
        {/* BACKGROUND EFFECTS */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-fuchsia-600/10 blur-[120px] rounded-full -z-10 pointer-events-none"></div>

        {/* HUD CONTAINER */}
        <div className="relative w-full max-w-lg bg-[#0a0a0c] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          
          <div className="p-8 md:p-12 text-center relative z-10 flex flex-col items-center">
            
            {/* LOGO LINK TO DISCORD */}
            <a href="https://discord.gg/pixelpalace" target="_blank" rel="noopener noreferrer" className="mb-8 group relative inline-block cursor-pointer transition-transform hover:scale-105 active:scale-95">
               <img 
                 src="https://raw.githubusercontent.com/alphabravo2k-rgb/pixel-palace-registration/1a7d90c43796fd037316bdaf4f3b4de9a485d615/image_4379f9.png" 
                 alt="Logo" 
                 className="w-28 h-28 mx-auto object-contain drop-shadow-[0_0_25px_rgba(192,38,211,0.4)] group-hover:drop-shadow-[0_0_40px_rgba(192,38,211,0.8)] transition-all duration-500"
               />
            </a>

            {/* WELCOME TEXT */}
            <div className="mb-2 flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                <div className={`w-2 h-2 rounded-full ${loggedInUser.type === 'ADMIN' ? 'bg-cyan-400 animate-pulse' : 'bg-yellow-400'}`}></div>
                <span className="text-[10px] text-zinc-300 font-bold uppercase tracking-widest">Identity Verified</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter mb-1 leading-none">
              WELCOME, <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-purple-500">{loggedInUser.name.toUpperCase()}</span>
            </h1>
            
            <p className="text-zinc-500 text-[10px] uppercase tracking-[0.3em] font-bold mb-10">
              {loggedInUser.role} ACCESS GRANTED
            </p>

            {/* MANIFESTO - RE-ALIGNED */}
            <div className="mb-10 w-full relative">
               <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-gradient-to-r from-transparent via-zinc-800 to-transparent -z-10"></div>
               
               <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">The goal isn't participation</p>
               
               <h2 className="text-2xl md:text-3xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)] mb-2">
                  THE GOAL IS <span className="text-fuchsia-500">EXCELLENCE</span>
               </h2>
               
               <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em]">Welcome to the standard</p>
            </div>

            {/* ACTION GRID */}
            <div className="w-full space-y-3">
               {/* PRIMARY ACTION */}
               <button 
                 onClick={() => proceedToApp()}
                 className="w-full py-4 bg-gradient-to-r from-fuchsia-700 to-purple-800 hover:from-fuchsia-600 hover:to-purple-700 text-white font-bold uppercase tracking-[0.2em] rounded border border-white/10 shadow-lg shadow-purple-900/20 transform transition-all hover:-translate-y-1 group"
               >
                 <span className="flex items-center justify-center gap-2">
                   {loggedInUser.type === 'ADMIN' ? 'Open Command Console' : 'Enter Captain\'s Veto'} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                 </span>
               </button>

               <div className="grid grid-cols-2 gap-3">
                   <button onClick={() => safeNavigate('/bracket')} className="py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all rounded">
                      <Network className="w-3 h-3" /> View Bracket
                   </button>

                   <button onClick={() => safeNavigate('/roster')} className="py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all rounded">
                      <Users className="w-3 h-3" /> View Roster
                   </button>
               </div>
            </div>

            {/* FOOTER */}
            <div className="mt-8">
              <button onClick={logout} className="text-zinc-600 hover:text-red-400 text-[10px] uppercase tracking-widest flex items-center gap-2 transition-colors group">
                 <LogOut className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> Terminate Session
              </button>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // --- RENDER: LOGIN FORM (Standard) ---
  return (
    <div className="fixed inset-0 bg-slate-950/90 flex items-center justify-center z-50 p-4 font-mono backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-xl shadow-2xl overflow-hidden relative">
        <div className="bg-slate-800 p-4 border-b border-slate-700 text-center">
           <h2 className="text-slate-400 text-[10px] tracking-[0.3em] uppercase mb-1">Pixel Palace Authority</h2>
           <h1 className="text-white font-bold tracking-widest">SECURE ACCESS</h1>
        </div>

        <form onSubmit={handleLogin} className="p-8 pb-4">
          <div className="mb-8">
             <label className="block text-slate-500 text-[10px] uppercase mb-4 tracking-widest text-center">Enter Command Key</label>
            <input 
              type="password" 
              autoFocus
              className="w-full bg-slate-950 border border-slate-700 text-white text-center text-2xl p-4 rounded-lg focus:border-[#ff5500] focus:ring-1 focus:ring-[#ff5500] outline-none tracking-[0.5em] transition-all placeholder-slate-800"
              placeholder="••••" 
              value={pin} onChange={(e) => setPin(e.target.value)} maxLength={20}
            />
          </div>

          <button disabled={loading || pin.length < 3} className="w-full bg-[#ff5500] hover:bg-[#ff5500]/90 text-black font-bold py-4 rounded-lg uppercase tracking-widest text-xs transition-all shadow-lg hover:shadow-orange-500/20">
            {loading ? 'Verifying...' : 'Authorize'}
          </button>
        </form>

        {error && (
          <div className="px-8 pb-4 animate-in slide-in-from-bottom-2 fade-in duration-300 text-center">
             <span className="text-red-500 font-bold tracking-widest text-[10px] uppercase border border-red-900/50 bg-red-900/10 px-3 py-1 rounded">
                {error}
             </span>
             <div className="grid grid-cols-2 gap-3 mt-4">
               <a href="https://discord.com/users/bravo.gg" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center gap-2 bg-indigo-900/30 hover:bg-indigo-900/50 border border-indigo-500/30 p-3 rounded text-center group transition-all">
                  <MessageSquare className="w-4 h-4 text-indigo-400" />
                  <span className="text-[9px] text-indigo-200 uppercase tracking-widest font-bold">Help</span>
               </a>
               <a href="https://discord.gg/pixelpalace" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 p-3 rounded text-center group transition-all">
                  <ShieldAlert className="w-4 h-4 text-zinc-400" />
                  <span className="text-[9px] text-zinc-300 uppercase tracking-widest font-bold">Support</span>
               </a>
             </div>
          </div>
        )}

        {!error && (
          <div className="px-8 pb-6">
            <button onClick={() => setIsVisible(false)} className="w-full border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white py-3 rounded-lg flex items-center justify-center gap-2 transition-all group">
              <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" /> 
              <span className="text-[10px] uppercase tracking-widest font-bold">Proceed as Spectator</span>
            </button>
          </div>
        )}
        
        <div className="bg-slate-950 p-3 text-center border-t border-slate-800">
           <p className="text-slate-700 text-[9px] uppercase tracking-widest">v7.2 | System Stable</p>
        </div>
      </div>
    </div>
  );
};

export default PinLogin;

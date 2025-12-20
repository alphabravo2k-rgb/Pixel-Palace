import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; 
import { supabase } from '../supabase/client';
import { MessageSquare, ShieldAlert, Eye, LayoutGrid, Network, ShieldCheck, LogOut, ArrowRight, User, Settings } from 'lucide-react';

const PinLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // STATES
  const [isVisible, setIsVisible] = useState(!location.state?.skipLogin);
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // NEW: Welcome State
  const [loggedInUser, setLoggedInUser] = useState(null); // Stores profile data
  const [showWelcome, setShowWelcome] = useState(false);

  // EFFECTS
  useEffect(() => {
    // If we receive a skip signal, ensure hidden
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
        setShowWelcome(true); // Trigger Welcome Screen
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
        setShowWelcome(true); // Trigger Welcome Screen
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
    if (!loggedInUser) return;
    const dest = destination || (loggedInUser.type === 'ADMIN' ? '/admin' : '/veto');
    navigate(dest, { state: { pin: loggedInUser.pin } });
  };

  const logout = () => {
    setLoggedInUser(null);
    setShowWelcome(false);
    setPin('');
  };

  // Logic: Show if (Visible AND on Home Page)
  if (!isVisible || window.location.pathname !== '/') return null;

  // --- RENDER: WELCOME HUD (The "Beautiful Pop Up") ---
  if (showWelcome && loggedInUser) {
    return (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 font-['Rajdhani',sans-serif] backdrop-blur-md animate-in fade-in duration-500">
        
        {/* BACKGROUND EFFECTS */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 pointer-events-none"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-fuchsia-600/20 blur-[100px] rounded-full -z-10 pointer-events-none"></div>

        {/* HUD CONTAINER */}
        <div className="relative w-full max-w-lg bg-[#141419]/90 border border-white/10 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl">
          
          {/* DECORATIVE SIDE BAR */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-fuchsia-500 to-purple-600"></div>

          <div className="p-8 md:p-10 text-center relative z-10">
            
            {/* LOGO */}
            <div className="mb-6 relative inline-block">
               <img 
                 src="https://raw.githubusercontent.com/alphabravo2k-rgb/pixel-palace-registration/1a7d90c43796fd037316bdaf4f3b4de9a485d615/image_4379f9.png" 
                 alt="Logo" 
                 className="w-24 h-24 mx-auto object-contain drop-shadow-[0_0_15px_rgba(192,38,211,0.6)]"
               />
               <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-fuchsia-500 to-transparent opacity-50 blur-sm"></div>
            </div>

            {/* WELCOME TEXT */}
            <h2 className="text-zinc-400 text-sm font-bold uppercase tracking-[0.3em] mb-1">Identity Verified</h2>
            <h1 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter mb-2 leading-none">
              WELCOME, <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-purple-400">{loggedInUser.name.toUpperCase()}</span>
            </h1>
            <p className="text-zinc-500 text-xs uppercase tracking-widest font-bold mb-8 flex items-center justify-center gap-2">
              <span className={`w-2 h-2 rounded-full ${loggedInUser.type === 'ADMIN' ? 'bg-blue-500' : 'bg-yellow-500'}`}></span>
              {loggedInUser.role} ACCESS GRANTED
            </p>

            {/* MANIFESTO SNIPPET */}
            <div className="mb-8 p-4 bg-white/5 border border-white/5 rounded-lg text-left relative overflow-hidden group hover:border-fuchsia-500/30 transition-colors">
               <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                  <LayoutGrid className="w-12 h-12" />
               </div>
               <p className="text-zinc-300 text-sm italic relative z-10">
                 "The goal isn’t participation. The goal is excellence. Welcome to the standard."
               </p>
            </div>

            {/* ACTION GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
               {/* PRIMARY ACTION */}
               <button 
                 onClick={() => proceedToApp()}
                 className="md:col-span-2 py-4 bg-gradient-to-r from-fuchsia-600 to-purple-700 hover:from-fuchsia-500 hover:to-purple-600 text-white font-bold uppercase tracking-widest skew-x-[-6deg] shadow-lg shadow-purple-900/20 transform transition-all hover:-translate-y-1"
               >
                 <span className="skew-x-[6deg] flex items-center justify-center gap-2">
                   {loggedInUser.type === 'ADMIN' ? 'Open Command Console' : 'Enter Captain\'s Veto'} <ArrowRight className="w-4 h-4" />
                 </span>
               </button>

               {/* SECONDARY ACTIONS */}
               <button onClick={() => navigate('/bracket')} className="py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all">
                  <Network className="w-4 h-4" /> View Bracket
               </button>

               <button onClick={() => navigate('/roster')} className="py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all">
                  <User className="w-4 h-4" /> View Roster
               </button>
            </div>

            {/* FOOTER */}
            <div className="flex justify-center">
              <button onClick={logout} className="text-zinc-500 hover:text-red-400 text-[10px] uppercase tracking-widest flex items-center gap-2 transition-colors">
                 <LogOut className="w-3 h-3" /> Terminate Session
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
          <h2 className="text-slate-400 text-xs tracking-[0.2em] uppercase">Pixel Palace Authority</h2>
          <h1 className="text-white font-bold mt-1">SECURE ACCESS</h1>
        </div>

        <form onSubmit={handleLogin} className="p-8 pb-4">
          <div className="mb-8">
            <label className="block text-slate-500 text-xs uppercase mb-4 tracking-widest text-center">Enter Command Key</label>
            <input 
              type="password" 
              autoFocus
              className="w-full bg-slate-950 border border-slate-700 text-white text-center text-xl p-4 rounded-lg focus:border-[#ff5500] focus:ring-1 focus:ring-[#ff5500] outline-none tracking-widest transition-all placeholder-slate-800"
              placeholder="••••••••" 
              value={pin} 
              onChange={(e) => setPin(e.target.value)} 
              maxLength={20}
            />
          </div>

          <button disabled={loading || pin.length < 3} className="w-full bg-[#ff5500] hover:bg-[#ff5500]/90 text-black font-bold py-4 rounded-lg uppercase tracking-widest text-sm transition-all shadow-lg hover:shadow-orange-500/20">
            {loading ? 'Verifying...' : 'Authorize'}
          </button>
        </form>

        {/* ERROR STATE */}
        {error && (
          <div className="px-8 pb-4 animate-in slide-in-from-bottom-2 fade-in duration-300 text-center">
             <span className="text-red-500 font-bold tracking-widest text-xs uppercase border border-red-900/50 bg-red-900/10 px-3 py-1 rounded">
                {error}
             </span>
             <div className="grid grid-cols-2 gap-3 mt-4">
               <a href="https://discord.com/users/bravo.gg" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center gap-2 bg-indigo-900/30 hover:bg-indigo-900/50 border border-indigo-500/30 p-3 rounded text-center group transition-all">
                  <MessageSquare className="w-5 h-5 text-indigo-400" />
                  <span className="text-[9px] text-indigo-200 uppercase tracking-widest font-bold">Contact Bravo</span>
               </a>
               <a href="https://discord.gg/pixelpalace" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 p-3 rounded text-center group transition-all">
                  <ShieldAlert className="w-5 h-5 text-zinc-400" />
                  <span className="text-[9px] text-zinc-300 uppercase tracking-widest font-bold">Support Unit</span>
               </a>
             </div>
          </div>
        )}

        {/* SPECTATOR BUTTON */}
        {!error && (
          <div className="px-8 pb-6">
            <button 
              onClick={() => setIsVisible(false)} 
              className="w-full border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white py-3 rounded-lg flex items-center justify-center gap-2 transition-all group"
            >
              <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] uppercase tracking-widest font-bold">Proceed as Spectator</span>
            </button>
          </div>
        )}

        <div className="bg-slate-950 p-4 text-center border-t border-slate-800">
          <p className="text-slate-600 text-[10px] uppercase tracking-widest">Pixel Palace | v7.1 Secure</p>
        </div>
      </div>
    </div>
  );
};

export default PinLogin;

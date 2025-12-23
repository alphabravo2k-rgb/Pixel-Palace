import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; 
import { supabase } from '../supabase/client';
import { BreathingLogo, HudPanel, SkewButton } from '../ui/Components'; 
import { Eye, LogOut, ArrowRight, Network, Users, Trophy, ShieldCheck, Tv, MessageCircle, Code } from 'lucide-react';

const PinLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isVisible, setIsVisible] = useState(!location.state?.skipLogin);
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(null); 
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (location.state?.skipLogin) setIsVisible(false);
  }, [location.state]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (pin.length < 3) return;
    setLoading(true);
    setError(null);

    try {
      const { data: adminData, error: adminError } = await supabase.rpc('api_admin_login', { p_pin: pin });
      if (!adminError && adminData?.status === 'SUCCESS') {
        setLoggedInUser({ type: 'ADMIN', name: adminData.profile.display_name, role: adminData.profile.role, pin: pin });
        setShowWelcome(true); 
        return;
      }

      const { data: captainData, error: captainError } = await supabase.rpc('api_get_captain_state', { p_pin: pin });
      if (!captainError && captainData?.team_name) {
        setLoggedInUser({ type: 'CAPTAIN', name: captainData.team_name, role: 'Team Captain', pin: pin });
        setShowWelcome(true); 
        return;
      }

      throw new Error("Invalid Credentials");
    } catch (err) {
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

  const safeNavigate = (path) => {
    navigate(path, { state: { skipLogin: true } });
    setIsVisible(false);
  };

  const logout = () => {
    setLoggedInUser(null);
    setShowWelcome(false);
    setPin('');
  };

  const isAuthPage = ['/', '/bracket', '/roster'].includes(window.location.pathname);
  if (!isVisible || !isAuthPage) return null;

  // --- WELCOME SCREEN ---
  if (showWelcome && loggedInUser) {
    return (
      <div className="fixed inset-0 bg-[#050505]/95 flex items-center justify-center z-50 p-4 font-sans backdrop-blur-xl animate-in fade-in duration-500">
        <HudPanel className="w-full max-w-lg">
          <div className="text-center flex flex-col items-center">
            
            {/* Clickable Logo leading to Developer/Owner */}
            <a href="https://discord.gg/2AVFBjff" target="_blank" rel="noreferrer" className="mb-6 hover:scale-105 transition-transform">
                <BreathingLogo size="w-32 h-32" />
            </a>

            <div className="mb-4 flex items-center gap-2 bg-black/40 px-4 py-1 rounded border border-white/10">
                <div className={`w-2 h-2 rounded-full ${loggedInUser.type === 'ADMIN' ? 'bg-cyan-400 animate-pulse' : 'bg-yellow-400'}`}></div>
                <span className="text-[12px] text-zinc-300 font-bold uppercase tracking-widest font-['Teko']">{loggedInUser.role} Verified</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter mb-8 font-['Teko'] leading-none">
              WELCOME, <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-purple-600">{loggedInUser.name.toUpperCase()}</span>
            </h1>

            <div className="w-full grid gap-4">
               <SkewButton onClick={() => proceedToApp()}>
                 <div className="flex items-center justify-center gap-3">
                    {loggedInUser.type === 'ADMIN' ? <ShieldCheck className="w-5 h-5"/> : <Trophy className="w-5 h-5"/>}
                    {loggedInUser.type === 'ADMIN' ? 'COMMAND CONSOLE' : 'CAPTAIN VETO'}
                    <ArrowRight className="w-5 h-5" />
                 </div>
               </SkewButton>

               <div className="grid grid-cols-2 gap-3 mt-2">
                   <button onClick={() => safeNavigate('/bracket')} className="py-4 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-500 text-white font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
                      <Network className="w-4 h-4 text-cyan-400" /> Bracket
                   </button>
                   <button onClick={() => safeNavigate('/roster')} className="py-4 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-500 text-white font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
                      <Users className="w-4 h-4 text-purple-400" /> Roster
                   </button>
               </div>
            </div>

            <button onClick={logout} className="mt-8 text-zinc-500 hover:text-red-500 text-xs uppercase tracking-widest flex items-center gap-2 transition-colors font-bold">
                 <LogOut className="w-4 h-4" /> Terminate Session
            </button>
          </div>
        </HudPanel>
      </div>
    );
  }

  // --- LOGIN SCREEN ---
  return (
    <div className="fixed inset-0 bg-[#050505]/98 flex items-center justify-center z-50 p-4 backdrop-blur-md">
      <div className="w-full max-w-2xl flex flex-col items-center">
        
        {/* HEADER */}
        <div className="text-center mb-8 relative">
           <div className="hidden sm:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-fuchsia-600/20 blur-[100px] rounded-full -z-10 pointer-events-none"></div>
           
           <a href="https://discord.gg/2AVFBjff" target="_blank" rel="noreferrer" className="inline-block mb-4 hover:scale-105 transition-transform cursor-pointer">
             <BreathingLogo size="w-32 h-32 md:w-48 md:h-48" />
           </a>
           
           <h1 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter font-['Teko'] leading-none drop-shadow-[0_0_15px_rgba(192,38,211,0.5)]">
              PIXEL <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-pink-500 to-purple-600">PALACE</span>
           </h1>
           <p className="text-zinc-400 text-lg uppercase tracking-[0.4em] font-['Teko'] mt-1">Operations Command</p>
           
           <div className="flex items-center justify-center gap-4 mt-6">
              <a href="https://discord.gg/2AVFBjff" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold uppercase tracking-widest text-xs rounded transition-all">
                 <MessageCircle className="w-4 h-4" /> Community
              </a>
              <a href="https://www.twitch.tv/pXpLgg" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-purple-900/50 border border-purple-500/50 hover:bg-purple-900/80 text-purple-200 font-bold uppercase tracking-widest text-xs rounded transition-all">
                 <Tv className="w-4 h-4" /> Stream
              </a>
           </div>
        </div>

        {/* LOGIN FORM */}
        <HudPanel className="w-full max-w-md">
           <h2 className="text-center text-xl text-white font-['Teko'] uppercase mb-6 flex items-center justify-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-400" /> Secure Access
           </h2>

           <form onSubmit={handleLogin} className="space-y-6">
             <div>
                <input 
                  type="password" 
                  autoFocus
                  className="w-full bg-black/50 border border-zinc-700 text-white text-center text-3xl p-4 focus:border-fuchsia-500 focus:bg-black/80 outline-none tracking-[0.5em] transition-all placeholder-zinc-800 font-mono font-['Teko']"
                  placeholder="••••" 
                  value={pin} onChange={(e) => setPin(e.target.value)} maxLength={20}
                />
             </div>

             <SkewButton type="submit" disabled={loading || pin.length < 3} className="w-full">
               {loading ? 'VERIFYING...' : 'AUTHORIZE'}
             </SkewButton>
           </form>

           {error && (
             <div className="mt-6 text-center animate-in fade-in">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-900/20 border border-red-500/50 text-red-400 font-bold uppercase tracking-widest text-xs">
                   <ShieldAlert className="w-4 h-4" /> {error}
                </div>
             </div>
           )}

           {!error && (
             <button onClick={() => setIsVisible(false)} className="mt-6 w-full py-3 border border-white/5 hover:bg-white/5 text-zinc-500 hover:text-white flex items-center justify-center gap-2 transition-all group">
               <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" /> 
               <span className="text-xs uppercase tracking-widest font-bold">Spectator Mode</span>
             </button>
           )}
        </HudPanel>

        <div className="mt-8 flex flex-col items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
           <p className="text-zinc-600 text-[10px] uppercase tracking-[0.3em]">System v2.5.1</p>
           <a href="https://discord.gg/2AVFBjff" target="_blank" rel="noreferrer" className="text-[10px] uppercase tracking-widest text-fuchsia-600 hover:text-fuchsia-400 font-bold flex items-center gap-1">
             <Code className="w-3 h-3" /> Secured by Bravo.gg
           </a>
        </div>
      </div>
    </div>
  );
};

export default PinLogin;

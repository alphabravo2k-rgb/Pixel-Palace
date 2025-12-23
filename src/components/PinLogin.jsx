import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; 
import { supabase } from '../supabase/client';
import { BreathingLogo } from '../ui/Components'; 
import { MessageSquare, ShieldAlert, Eye, LogOut, ArrowRight, Network, Users, Trophy, ShieldCheck } from 'lucide-react';

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

  if (showWelcome && loggedInUser) {
    return (
      <div className="fixed inset-0 bg-[#050505]/95 flex items-center justify-center z-50 p-4 font-sans backdrop-blur-xl animate-in fade-in duration-500">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
        
        <div className="relative w-full max-w-lg bg-[#0a0a0c] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-fuchsia-600 to-purple-600"></div>
          
          <div className="p-8 md:p-12 text-center flex flex-col items-center">
            <BreathingLogo size="w-24 h-24" className="mb-6" />

            <div className="mb-4 flex items-center gap-2 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-700">
                <div className={`w-2 h-2 rounded-full ${loggedInUser.type === 'ADMIN' ? 'bg-cyan-400 animate-pulse' : 'bg-yellow-400'}`}></div>
                <span className="text-[10px] text-zinc-300 font-bold uppercase tracking-widest">{loggedInUser.role} Verified</span>
            </div>

            <h1 className="text-3xl font-black text-white italic tracking-tighter mb-8 leading-none">
              WELCOME, <span className="text-fuchsia-500">{loggedInUser.name.toUpperCase()}</span>
            </h1>

            <div className="w-full grid gap-3">
               <button onClick={() => proceedToApp()} className="w-full py-4 bg-fuchsia-700 hover:bg-fuchsia-600 text-white font-bold uppercase tracking-[0.2em] rounded flex items-center justify-center gap-3 transition-all shadow-lg shadow-fuchsia-900/20 group">
                 {loggedInUser.type === 'ADMIN' ? <ShieldCheck className="w-5 h-5"/> : <Trophy className="w-5 h-5"/>}
                 <span>{loggedInUser.type === 'ADMIN' ? 'Command Console' : 'Captain Veto'}</span>
                 <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
               </button>

               <div className="grid grid-cols-2 gap-3">
                   <button onClick={() => safeNavigate('/bracket')} className="py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 rounded transition-all">
                      <Network className="w-3 h-3" /> Bracket
                   </button>
                   <button onClick={() => safeNavigate('/roster')} className="py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 rounded transition-all">
                      <Users className="w-3 h-3" /> Roster
                   </button>
               </div>
            </div>

            <button onClick={logout} className="mt-8 text-zinc-600 hover:text-red-500 text-[10px] uppercase tracking-widest flex items-center gap-2 transition-colors">
                 <LogOut className="w-3 h-3" /> Terminate Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#050505]/95 flex items-center justify-center z-50 p-4 font-sans backdrop-blur-md">
      <div className="w-full max-w-md bg-[#0a0a0c] border border-zinc-800 rounded-xl shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-zinc-800"></div>
        
        <div className="p-8 text-center">
           <BreathingLogo size="w-16 h-16" className="mx-auto mb-6" />
           <h2 className="text-zinc-500 text-[10px] tracking-[0.3em] uppercase mb-1">Pixel Palace Authority</h2>
           <h1 className="text-white font-black tracking-widest text-xl mb-8">SECURE ACCESS</h1>

           <form onSubmit={handleLogin}>
             <input 
               type="password" 
               autoFocus
               className="w-full bg-black border border-zinc-700 text-white text-center text-3xl p-4 rounded focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 outline-none tracking-[0.5em] transition-all placeholder-zinc-800 font-mono mb-4"
               placeholder="••••" 
               value={pin} onChange={(e) => setPin(e.target.value)} maxLength={20}
             />
             <button disabled={loading || pin.length < 3} className="w-full bg-zinc-100 hover:bg-white text-black font-black py-4 rounded uppercase tracking-widest text-xs transition-all shadow-lg">
               {loading ? 'Verifying...' : 'Authorize'}
             </button>
           </form>

           {error && (
             <div className="mt-6 animate-in slide-in-from-top-2 fade-in">
                <span className="text-red-500 font-bold tracking-widest text-[10px] uppercase border border-red-900/30 bg-red-900/10 px-3 py-1 rounded">
                   {error}
                </span>
             </div>
           )}

           {!error && (
             <button onClick={() => setIsVisible(false)} className="mt-6 w-full border border-zinc-800 hover:border-zinc-600 text-zinc-500 hover:text-white py-3 rounded flex items-center justify-center gap-2 transition-all group">
               <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" /> 
               <span className="text-[10px] uppercase tracking-widest font-bold">Spectator View</span>
             </button>
           )}
        </div>
      </div>
    </div>
  );
};

export default PinLogin;

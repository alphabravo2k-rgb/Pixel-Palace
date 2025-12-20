import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/client';
import { MessageSquare, ShieldAlert } from 'lucide-react'; // Import icons

const PinLogin = () => {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (pin.length < 4) return;
    setLoading(true);
    setError(null);

    try {
      const { data: adminData, error: adminError } = await supabase.rpc('api_admin_login', { p_pin: pin });
      if (!adminError && adminData.status === 'SUCCESS') {
        navigate('/admin', { state: { pin } });
        return;
      }
      const { data: captainData, error: captainError } = await supabase.rpc('api_get_captain_state', { p_pin: pin });
      if (!captainError && captainData) {
        navigate('/veto', { state: { pin } });
        return;
      }
      throw new Error("Invalid PIN");
    } catch (err) {
      console.error(err);
      setError("ACCESS DENIED");
    } finally {
      setLoading(false);
    }
  };

  if (window.location.pathname !== '/') return null;

  return (
    <div className="fixed inset-0 bg-slate-950/90 flex items-center justify-center z-50 p-4 font-mono backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-xl shadow-2xl overflow-hidden relative">
        
        <div className="bg-slate-800 p-4 border-b border-slate-700 text-center">
          <h2 className="text-slate-400 text-xs tracking-[0.2em] uppercase">Pixel Palace Authority</h2>
          <h1 className="text-white font-bold mt-1">SECURE ACCESS</h1>
        </div>

        <form onSubmit={handleLogin} className="p-8 pb-4">
          <div className="mb-8 text-center">
            <label className="block text-slate-500 text-xs uppercase mb-4 tracking-widest">Authentication Required</label>
            <input 
              type="password" autoFocus
              className="w-full bg-slate-950 border border-slate-700 text-white text-center text-3xl p-4 rounded-lg focus:border-[#ff5500] focus:ring-1 focus:ring-[#ff5500] outline-none tracking-[0.5em] transition-all placeholder-slate-800"
              placeholder="••••" value={pin} onChange={(e) => setPin(e.target.value)} maxLength={4}
            />
          </div>

          <button disabled={loading || pin.length < 4} className="w-full bg-[#ff5500] hover:bg-[#ff5500]/90 text-black font-bold py-4 rounded-lg uppercase tracking-widest text-sm transition-all shadow-lg hover:shadow-orange-500/20">
            {loading ? 'Verifying...' : 'Authorize'}
          </button>
        </form>

        {/* ERROR STATE ACTIONS */}
        {error && (
          <div className="px-8 pb-8 pt-2 animate-in slide-in-from-bottom-2 fade-in duration-300">
             <div className="text-center mb-4">
                <span className="text-red-500 font-bold tracking-widest text-xs uppercase border border-red-900/50 bg-red-900/10 px-3 py-1 rounded">
                   {error}
                </span>
             </div>
             
             <div className="grid grid-cols-2 gap-3">
               <a href="https://discord.com/users/bravo.gg" target="_blank" rel="noopener noreferrer" 
                  className="flex flex-col items-center justify-center gap-2 bg-indigo-900/30 hover:bg-indigo-900/50 border border-indigo-500/30 p-3 rounded text-center group transition-all">
                  <MessageSquare className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[9px] text-indigo-200 uppercase tracking-widest font-bold">Contact Bravo</span>
               </a>

               <a href="https://discord.gg/pixelpalace" target="_blank" rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 p-3 rounded text-center group transition-all">
                  <ShieldAlert className="w-5 h-5 text-zinc-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[9px] text-zinc-300 uppercase tracking-widest font-bold">Support Unit</span>
               </a>
             </div>
          </div>
        )}

        <div className="bg-slate-950 p-4 text-center border-t border-slate-800">
          <p className="text-slate-600 text-[10px] uppercase tracking-widest">Support Unit | v7.0 Secure</p>
        </div>
      </div>
    </div>
  );
};

export default PinLogin;

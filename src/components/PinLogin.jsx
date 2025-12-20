import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/client';

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
      console.log("Attempting login with PIN:", pin);

      // 1. Try Admin Login
      const { data: adminData, error: adminError } = await supabase.rpc('api_admin_login', { p_pin: pin });
      
      if (adminError) {
        console.error("Admin RPC Error:", adminError);
        // Don't throw yet, try Captain
      } else if (adminData && adminData.status === 'SUCCESS') {
        console.log("Admin Login Success:", adminData);
        navigate('/admin', { state: { pin } });
        return;
      }

      // 2. Try Captain Login
      const { data: captainData, error: captainError } = await supabase.rpc('api_get_captain_state', { p_pin: pin });
      
      if (captainError) {
        console.error("Captain RPC Error:", captainError);
        // Throw the specific error to see it on screen
        throw new Error(captainError.message || captainError.details || "RPC Failed");
      } 
      
      if (captainData) {
        console.log("Captain Login Success:", captainData);
        navigate('/veto', { state: { pin } });
        return;
      }

      // If we get here, no error occurred but no data returned (Invalid PIN)
      throw new Error("PIN not found in database.");

    } catch (err) {
      console.error("Login Logic Error:", err);
      // SHOW THE REAL ERROR
      setError(err.message); 
    } finally {
      setLoading(false);
    }
  };

  // Only show on Home Page
  if (window.location.pathname !== '/') return null;

  return (
    <div className="fixed inset-0 bg-slate-950/90 flex items-center justify-center z-50 p-4 font-mono backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-xl shadow-2xl overflow-hidden">
        
        {/* HEADER */}
        <div className="bg-slate-800 p-4 border-b border-slate-700 text-center">
          <h2 className="text-slate-400 text-xs tracking-[0.2em] uppercase">Pixel Palace Authority</h2>
          <h1 className="text-white font-bold mt-1">SECURE ACCESS</h1>
        </div>

        {/* FORM */}
        <form onSubmit={handleLogin} className="p-8">
          <div className="mb-8 text-center">
            <label className="block text-slate-500 text-xs uppercase mb-4 tracking-widest">Authentication Required</label>
            <input 
              type="password" 
              autoFocus
              className="w-full bg-slate-950 border border-slate-700 text-white text-center text-3xl p-4 rounded-lg focus:border-[#ff5500] focus:ring-1 focus:ring-[#ff5500] outline-none tracking-[0.5em] transition-all placeholder-slate-800"
              placeholder="••••"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              maxLength={4}
            />
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-900/30 border border-red-500/50 rounded text-center">
              <p className="text-red-400 text-xs font-bold uppercase tracking-wide break-words">{error}</p>
            </div>
          )}

          <button 
            disabled={loading || pin.length < 4}
            className="w-full bg-[#ff5500] hover:bg-[#ff5500]/90 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-4 rounded-lg uppercase tracking-widest text-sm transition-all shadow-lg hover:shadow-orange-500/20"
          >
            {loading ? 'Verifying Identity...' : 'Authorize'}
          </button>
        </form>

        {/* FOOTER */}
        <div className="bg-slate-950 p-4 text-center border-t border-slate-800">
          <p className="text-slate-600 text-[10px] uppercase tracking-widest">
            Support Unit | v7.0 Secure
          </p>
        </div>
      </div>
    </div>
  );
};

export default PinLogin;

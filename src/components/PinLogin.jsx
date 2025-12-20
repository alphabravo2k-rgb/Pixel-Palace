import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/client';

const PinLogin = ({ onLogin }) => { 
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
      // ---------------------------------------------------------
      // 1. ATTEMPT ADMIN LOGIN FIRST
      // ---------------------------------------------------------
      const { data: adminData, error: adminError } = await supabase.rpc('api_admin_login', { p_pin: pin });
      
      if (!adminError && adminData.status === 'SUCCESS') {
        // SUCCESS: It's an Admin
        if (onLogin) {
          onLogin(pin, 'ADMIN');
        } else {
          navigate('/admin'); // Fallback to router navigation
        }
        return;
      }

      // ---------------------------------------------------------
      // 2. ATTEMPT CAPTAIN LOGIN NEXT
      // ---------------------------------------------------------
      const { data: captainData, error: captainError } = await supabase.rpc('api_get_captain_state', { p_pin: pin });
      
      if (!captainError && captainData) {
        // SUCCESS: It's a Captain
        if (onLogin) {
          onLogin(pin, 'CAPTAIN');
        } else {
          navigate('/veto'); // Fallback to router navigation
        }
        return;
      }

      // If we get here, neither worked
      throw new Error("Invalid PIN");

    } catch (err) {
      console.error("Login Error:", err);
      // Check if it's a missing env var issue
      if (err.message && err.message.includes("supabaseUrl")) {
        setError("Configuration Error: Missing API Keys");
      } else {
        setError("Access Denied: Invalid Credentials");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 flex items-center justify-center z-50 p-4 font-mono">
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
              className="w-full bg-slate-950 border border-slate-700 text-white text-center text-3xl p-4 rounded-lg focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none tracking-[0.5em] transition-all placeholder-slate-800"
              placeholder="••••"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              maxLength={4}
            />
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-900/30 border border-red-500/50 rounded text-center">
              <p className="text-red-400 text-xs font-bold uppercase tracking-wide">Error: {error}</p>
            </div>
          )}

          <button 
            disabled={loading || pin.length < 4}
            className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg uppercase tracking-widest text-sm transition-all shadow-lg hover:shadow-red-900/20"
          >
            {loading ? 'Verifying...' : 'Authorize'}
          </button>
        </form>

        {/* FOOTER */}
        <div className="bg-slate-950 p-4 text-center border-t border-slate-800">
          <p className="text-slate-600 text-[10px] uppercase tracking-widest">
            Contact Bravo | Support Unit
          </p>
        </div>
      </div>
    </div>
  );
};

export default PinLogin;

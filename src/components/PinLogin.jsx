import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/client';

const PinLogin = ({ onLogin }) => {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Now works because we added RouterProvider!

  const handleLogin = async (e) => {
    e.preventDefault();
    if (pin.length < 4) return;
    
    setLoading(true);
    setError(null);

    try {
      // 1. Admin Login
      const { data: adminData, error: adminError } = await supabase.rpc('api_admin_login', { p_pin: pin });
      if (!adminError && adminData.status === 'SUCCESS') {
        navigate('/admin');
        return;
      }

      // 2. Captain Login
      const { data: captainData, error: captainError } = await supabase.rpc('api_get_captain_state', { p_pin: pin });
      if (!captainError && captainData) {
        navigate('/veto');
        return;
      }

      throw new Error("Invalid PIN");
    } catch (err) {
      console.error(err);
      if (err.message.includes("supabaseUrl")) {
        setError("Missing API Keys");
      } else {
        setError("Invalid Credentials");
      }
    } finally {
      setLoading(false);
    }
  };

  // Only show this overlay if we are on the Home Page ("/")
  if (window.location.pathname !== '/') return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Floating Action Button Style Login */}
      <form onSubmit={handleLogin} className="bg-zinc-900 border border-zinc-800 p-2 rounded-lg shadow-2xl flex gap-2 items-center">
        <input 
          type="password" 
          placeholder="PIN" 
          className="bg-black/50 text-white w-16 text-center p-2 rounded text-sm font-mono tracking-widest outline-none focus:border-[#ff5500] border border-transparent"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          maxLength={4}
        />
        <button 
          disabled={loading || pin.length < 4}
          className="bg-[#ff5500] hover:bg-[#ff5500]/80 text-black font-bold px-3 py-2 rounded text-xs uppercase tracking-wide transition-all"
        >
          {loading ? '...' : 'GO'}
        </button>
      </form>
      {error && <div className="absolute bottom-full right-0 mb-2 bg-red-900/90 text-red-200 text-[10px] px-2 py-1 rounded whitespace-nowrap">{error}</div>}
    </div>
  );
};

export default PinLogin;

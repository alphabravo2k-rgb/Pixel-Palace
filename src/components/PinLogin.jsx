import React, { useState } from 'react';
import { Lock, ArrowRight, AlertTriangle } from 'lucide-react';
import { useSession } from '../auth/useSession';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/client'; // ✅ Direct access for verification
import { ROLES } from '../lib/roles';

export const PinLogin = () => {
  const [pin, setPin] = useState('');
  const { login, loading } = useSession();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (pin.length < 4) {
      setError("PIN must be at least 4 digits");
      return;
    }

    // 1. Attempt Session Login
    const success = await login(pin);
    
    if (success) {
      // 2. DOUBLE CHECK: Who is this?
      // We manually fetch the profile to guarantee we send them to the right place.
      const { data: adminUser } = await supabase
        .from('admin_profiles')
        .select('role')
        .eq('pin_code', pin) // Assuming pin_code is unique enough for this check
        .single();

      // If they exist in admin_profiles, they are ADMIN or OWNER
      if (adminUser) {
        console.log("Admin Identified, routing to Dashboard...");
        navigate('/admin/dashboard');
      } else {
        // Otherwise, they must be a Captain
        console.log("Captain Identified, routing to Bracket...");
        navigate('/'); 
      }
    } else {
      setError("Invalid Access PIN");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-fuchsia-600 to-blue-600" />
      <div className="w-full max-w-md bg-zinc-900/80 backdrop-blur-md border border-white/10 p-8 rounded-2xl shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-800 mb-4 border border-white/5">
            <Lock className="w-8 h-8 text-fuchsia-500" />
          </div>
          <h1 className="font-['Teko'] text-4xl uppercase text-white tracking-widest">Restricted Access</h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="ENTER PIN CODE"
            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-4 text-center text-2xl tracking-[0.5em] text-white focus:border-fuchsia-500 focus:outline-none font-mono"
            autoFocus
          />
          {error && <div className="text-red-400 text-sm text-center">{error}</div>}
          <button type="submit" disabled={loading} className="w-full bg-white text-black font-bold uppercase py-4 rounded-lg hover:bg-zinc-200 transition-all disabled:opacity-50">
            {loading ? "Authenticating..." : "Access Terminal"}
          </button>
        </form>
      </div>
    </div>
  );
};

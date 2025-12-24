import React, { useState } from 'react';
import { Lock, ArrowRight, AlertTriangle } from 'lucide-react';
import { useSession } from '../auth/useSession';
import { useNavigate } from 'react-router-dom';
import { ROLES } from '../lib/roles'; // ✅ Import ROLES

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

    // ✅ LOGIN RETURNS THE ROLE OBJECT (We updated useSession to return this previously)
    // If your useSession only returns true/false, we might need to check state differently.
    // Assuming login returns the session object or role string:
    const result = await login(pin);
    
    if (result) {
      // 🚦 TRAFFIC CONTROL
      // We check the role derived from the login result
      // Note: If result is just 'true', we might need to rely on the hook's state updating.
      // But for safety, we can default to Home for non-admins.
      
      const role = result.role || result; // Handle if it returns object or string

      if ([ROLES.ADMIN, ROLES.OWNER].includes(role)) {
        navigate('/admin/dashboard');
      } else {
        // Captains go to the Bracket to do Vetoes
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
          <p className="text-zinc-500 text-sm mt-2">Enter Admin or Captain PIN</p>
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

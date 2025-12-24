import React, { useState } from 'react';
import { Lock, ArrowRight, AlertTriangle } from 'lucide-react';
import { useSession } from '../auth/useSession';
import { useNavigate } from 'react-router-dom';

/**
 * 🔐 PinLogin Component
 * Entry point for Admins and Captains.
 * * ✅ FIX: Uses Named Export (export const) to match router.jsx
 * ✅ FIX: Delegates auth logic to useSession hook
 */
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

    // 🧠 Logic: The hook handles the RPC call and state update
    const success = await login(pin);
    
    if (success) {
      // 🔀 Redirect: If successful, go to dashboard
      // (Future improvement: Check role to redirect Captains to /veto)
      navigate('/admin/dashboard'); 
    } else {
      setError("Invalid Access PIN");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-fuchsia-600 to-blue-600" />
      <div className="absolute -top-20 -left-20 w-96 h-96 bg-fuchsia-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-zinc-900/80 backdrop-blur-md border border-white/10 p-8 rounded-2xl shadow-2xl relative z-10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-800 mb-4 border border-white/5">
            <Lock className="w-8 h-8 text-fuchsia-500" />
          </div>
          <h1 className="font-['Teko'] text-4xl uppercase text-white tracking-widest">
            Restricted Access
          </h1>
          <p className="text-zinc-500 text-sm mt-2">
            Enter your tournament credentials to proceed.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="ENTER PIN CODE"
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-4 text-center text-2xl tracking-[0.5em] text-white focus:border-fuchsia-500 focus:outline-none transition-colors placeholder:text-zinc-700 placeholder:tracking-normal font-mono"
              autoFocus
            />
          </div>

          {error && (
            <div className="flex items-center justify-center gap-2 text-red-400 text-sm bg-red-900/10 p-2 rounded border border-red-900/20">
              <AlertTriangle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group w-full bg-white text-black font-bold uppercase py-4 rounded-lg hover:bg-zinc-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="animate-pulse">Authenticating...</span>
            ) : (
              <>
                <span>Access Terminal</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <a href="/" className="text-xs text-zinc-600 hover:text-white transition-colors uppercase tracking-widest">
            ← Return to Bracket
          </a>
        </div>
      </div>
    </div>
  );
};

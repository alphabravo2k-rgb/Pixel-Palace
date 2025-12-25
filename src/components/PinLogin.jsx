import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../auth/useSession';
import { ROLES } from '../lib/roles';
import { Lock, ChevronRight, AlertCircle, Loader2 } from 'lucide-react';

export const PinLogin = () => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useSession();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // 🛑 1. STRICT AUTH CHECK
      // We do NOT guess based on PIN length anymore.
      // We wait for the backend RPC to return an explicit success + role.
      const result = await login(pin);

      if (result && result.success) {
        // 🛑 2. ROLE-BASED ROUTING
        // Only Admins/Owners go to dashboard.
        if ([ROLES.ADMIN, ROLES.OWNER].includes(result.role)) {
          navigate('/admin/dashboard', { replace: true });
        } else if (result.role === ROLES.CAPTAIN) {
           // Captains usually go to their Veto view or Home
           // For now, we route them home or to a specific captain landing
           navigate('/', { replace: true });
        } else {
           setError("Access Denied: Unauthorized Role");
        }
      } else {
        setError("Invalid Access Code");
      }
    } catch (err) {
      console.error("Login Critical Failure:", err);
      setError("System Error. Check Console.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-sm">
        
        {/* Header */}
        <div className="text-center mb-10 space-y-2">
          <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center mx-auto border border-zinc-800 mb-6">
            <Lock className="w-5 h-5 text-zinc-500" />
          </div>
          <h1 className="text-2xl font-bold text-white font-['Teko'] uppercase tracking-wider">
            Restricted Access
          </h1>
          <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest">
            Authorization Required
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative group">
            <input
              type="password"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setError('');
              }}
              placeholder="ENTER SECURITY PIN"
              className={`
                w-full bg-zinc-900/50 border text-center text-lg font-mono tracking-[0.5em] py-4 rounded-lg outline-none transition-all
                placeholder:text-zinc-700 placeholder:tracking-normal placeholder:font-sans placeholder:text-xs
                ${error ? 'border-red-900/50 text-red-500 focus:border-red-500' : 'border-zinc-800 text-white focus:border-fuchsia-500/50 focus:bg-zinc-900'}
              `}
              maxLength={6}
              autoFocus
            />
            
            {/* Status Indicator */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
               {isSubmitting ? (
                 <Loader2 className="w-4 h-4 text-fuchsia-500 animate-spin" />
               ) : (
                 <div className={`w-2 h-2 rounded-full ${pin.length >= 4 ? 'bg-fuchsia-500' : 'bg-zinc-800'}`} />
               )}
            </div>
          </div>

          {error && (
            <div className="flex items-center justify-center gap-2 text-red-500 text-xs font-bold bg-red-950/20 py-2 rounded border border-red-900/30 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-3 h-3" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!pin || isSubmitting}
            className={`
              w-full py-3 rounded-lg font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2
              ${!pin || isSubmitting 
                ? 'bg-zinc-900 text-zinc-600 cursor-not-allowed' 
                : 'bg-white text-black hover:bg-fuchsia-500 hover:text-white hover:shadow-[0_0_20px_rgba(217,70,239,0.3)]'}
            `}
          >
            {isSubmitting ? 'Authenticating...' : 'Authenticate'}
            {!isSubmitting && <ChevronRight className="w-3 h-3" />}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-[9px] text-zinc-700 uppercase tracking-widest font-mono">
            Secure Environment v2.0
          </p>
        </div>
      </div>
    </div>
  );
};

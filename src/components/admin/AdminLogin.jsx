import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../../auth/useSession';
import { Shield, Key, User } from 'lucide-react';

export const AdminLogin = () => {
  const navigate = useNavigate();
  const { login, loading } = useSession();
  
  // Generic fields to handle both methods
  const [identity, setIdentity] = useState(''); // Email OR Discord Name
  const [secret, setSecret] = useState('');     // Password OR PIN
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const result = await login(identity, secret);

    if (result.success) {
      if (result.role === 'ADMIN' || result.role === 'OWNER') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(result.message || 'Access Denied. Check your code.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-zinc-900/50 border border-white/10 rounded-lg p-8 backdrop-blur-sm">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-fuchsia-500/20">
            <Shield className="w-8 h-8 text-fuchsia-500" />
          </div>
          <h1 className="text-3xl font-['Teko'] uppercase text-white tracking-wide">System Access</h1>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-900/20 border border-red-500/30 rounded text-red-400 text-xs font-bold uppercase text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          
          {/* Identity Field */}
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
              Username / Email
            </label>
            <div className="relative">
              <input
                type="text"
                value={identity}
                onChange={(e) => setIdentity(e.target.value)}
                className="w-full bg-black border border-white/10 rounded px-4 py-3 text-white focus:border-fuchsia-500 outline-none pl-10 font-mono"
                placeholder="Discord Name..."
                required
                autoFocus
              />
              <User className="w-4 h-4 text-zinc-600 absolute left-3 top-3.5" />
            </div>
          </div>

          {/* Secret Field */}
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
              Access Code / PIN
            </label>
            <div className="relative">
              <input
                type="password"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                className="w-full bg-black border border-white/10 rounded px-4 py-3 text-white focus:border-fuchsia-500 outline-none pl-10 font-mono"
                placeholder="••••••••"
                required
              />
              <Key className="w-4 h-4 text-zinc-600 absolute left-3 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || loading}
            className={`w-full py-3 rounded font-bold uppercase tracking-widest transition-all mt-6 ${
              isSubmitting ? 'bg-zinc-800 text-zinc-500' : 'bg-fuchsia-600 hover:bg-fuchsia-500 text-white'
            }`}
          >
            {isSubmitting ? 'Verifying...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

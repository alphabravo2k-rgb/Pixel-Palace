import React, { useState } from 'react';
import { useSession } from '../../auth/useSession';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, AlertTriangle, Loader2 } from 'lucide-react';

export const AdminLogin = () => {
  const { login } = useSession();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({ id: '', pin: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cooldown, setCooldown] = useState(0);

  const handleInput = (field, value) => {
    // 🛡️ SECURITY: Strip emojis/spaces immediately
    const sanitized = value.replace(/[^a-zA-Z0-9@._-]/g, '');
    setFormData(prev => ({ ...prev, [field]: sanitized }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cooldown > 0) return;

    setLoading(true);
    setError(null);

    const result = await login(formData.id, formData.pin);

    if (result.success) {
      const target = ['ADMIN', 'OWNER'].includes(result.role) ? '/admin/dashboard' : '/dashboard';
      navigate(target);
    } else {
      setError(result.message || "Access Denied");
      // 🛡️ SECURITY: Rate Limit Simulation
      setCooldown(prev => (prev === 0 ? 3 : prev * 2)); 
      setTimeout(() => setCooldown(0), (cooldown || 3) * 1000);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-950 border border-white/10 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-fuchsia-900/20 text-fuchsia-500 mb-4 border border-fuchsia-500/20">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-white font-['Teko'] uppercase tracking-wider">Pixel Palace // Secure Gate</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-1 block">Identity / Team Name</label>
            <input 
              type="text" autoFocus
              className="w-full bg-black border border-white/10 rounded px-4 py-3 text-white focus:border-fuchsia-500 outline-none transition-colors"
              placeholder="Enter ID..."
              value={formData.id}
              onChange={(e) => handleInput('id', e.target.value)}
            />
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-1 block">Access Credentials</label>
            <div className="relative">
              <input 
                type="password" 
                className="w-full bg-black border border-white/10 rounded px-4 py-3 text-white focus:border-fuchsia-500 outline-none transition-colors font-mono tracking-widest"
                placeholder="••••••"
                maxLength={20}
                value={formData.pin}
                onChange={(e) => handleInput('pin', e.target.value)}
              />
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-900/10 border border-red-500/20 rounded flex items-center gap-2 text-red-400 text-xs">
              <AlertTriangle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <button 
            type="submit" disabled={loading || cooldown > 0}
            className={`w-full py-3 rounded font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 ${cooldown > 0 ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-fuchsia-600 hover:bg-fuchsia-500 text-white'}`}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : cooldown > 0 ? `LOCKED (${cooldown}s)` : 'AUTHENTICATE'}
          </button>
        </form>
      </div>
    </div>
  );
};

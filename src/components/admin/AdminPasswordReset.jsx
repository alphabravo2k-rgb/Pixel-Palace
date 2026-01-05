import React, { useState } from 'react';
import { supabase } from '../../supabase/client';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Key, Mail, ArrowRight, CheckCircle, Loader2, Terminal } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const AdminPasswordReset = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=Email, 2=PIN, 3=NewPass
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    pin: '',
    newPassword: ''
  });

  // STEP 1: SEND OTP
  const handleSendPin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Ensure we are logged out first to avoid session conflicts
    await supabase.auth.signOut();

    const { error } = await supabase.auth.signInWithOtp({
      email: formData.email,
      options: { shouldCreateUser: false } 
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      toast.error(error.message);
    } else {
      setStep(2); 
      toast.success("Recovery Code Sent");
    }
  };

  // STEP 2: VERIFY PIN
  const handleVerifyPin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error } = await supabase.auth.verifyOtp({
      email: formData.email,
      token: formData.pin,
      type: 'email'
    });

    setLoading(false);

    if (error) {
      setError("Invalid PIN code.");
      toast.error("Invalid Code");
    } else if (data.session) {
      setStep(3); 
      toast.success("Identity Verified");
    }
  };

  // STEP 3: UPDATE PASSWORD
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: formData.newPassword
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      toast.error("Update Failed");
    } else {
      toast.success("Credentials Updated");
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl p-8 relative z-10 overflow-hidden">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-800">
            <Shield className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-display font-black text-white uppercase italic tracking-tighter">
            {step === 1 && 'Recovery Protocol'}
            {step === 2 && 'Verify Identity'}
            {step === 3 && 'New Credentials'}
          </h1>
          <p className="text-zinc-500 text-xs font-mono mt-2 flex items-center justify-center gap-2 uppercase tracking-wide">
            <Terminal size={12} /> SECURE CHANNEL
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-950/30 border border-red-500/30 rounded text-red-400 text-xs font-bold text-center uppercase animate-pulse">
            ⚠️ {error}
          </div>
        )}

        {/* --- STEP 1: EMAIL --- */}
        {step === 1 && (
          <form onSubmit={handleSendPin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-zinc-500">Admin Email</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-zinc-500 group-focus-within:text-white transition-colors" />
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-black border border-zinc-800 rounded p-3 pl-10 text-white focus:border-white outline-none text-sm transition-all"
                  placeholder="admin@pixelpalace.gg"
                  required
                  autoFocus
                />
              </div>
            </div>
            <button disabled={loading} className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold uppercase text-xs tracking-widest rounded transition-all flex items-center justify-center gap-2">
              {loading ? <Loader2 className="animate-spin w-4 h-4"/> : 'Send Access Code'}
            </button>
          </form>
        )}

        {/* --- STEP 2: PIN --- */}
        {step === 2 && (
          <form onSubmit={handleVerifyPin} className="space-y-4">
             <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-zinc-500">6-Digit Code</label>
              <div className="relative group">
                <Key className="absolute left-3 top-3 w-4 h-4 text-zinc-500 group-focus-within:text-white transition-colors" />
                <input 
                  type="text" 
                  value={formData.pin}
                  onChange={e => setFormData({...formData, pin: e.target.value})}
                  className="w-full bg-black border border-zinc-800 rounded p-3 pl-10 text-white focus:border-white outline-none text-xl font-mono tracking-widest text-center transition-all"
                  placeholder="000000"
                  maxLength={6}
                  required
                  autoFocus
                />
              </div>
            </div>
            <button disabled={loading} className="w-full py-4 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold uppercase text-xs tracking-widest rounded shadow-lg transition-all flex items-center justify-center gap-2">
              {loading ? <Loader2 className="animate-spin w-4 h-4"/> : 'Verify Identity'}
            </button>
            <button type="button" onClick={() => setStep(1)} className="w-full py-2 text-zinc-500 text-xs hover:text-white transition-colors">Try different email</button>
          </form>
        )}

        {/* --- STEP 3: NEW PASSWORD --- */}
        {step === 3 && (
          <form onSubmit={handleUpdatePassword} className="space-y-4">
             <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-zinc-500">New Password</label>
              <div className="relative group">
                <Shield className="absolute left-3 top-3 w-4 h-4 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
                <input 
                  type="password" 
                  value={formData.newPassword}
                  onChange={e => setFormData({...formData, newPassword: e.target.value})}
                  className="w-full bg-black border border-zinc-800 rounded p-3 pl-10 text-white focus:border-emerald-500 outline-none transition-all"
                  placeholder="••••••••"
                  minLength={6}
                  required
                  autoFocus
                />
              </div>
            </div>
            <button disabled={loading} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase text-xs tracking-widest rounded shadow-lg transition-all flex items-center justify-center gap-2">
              {loading ? <Loader2 className="animate-spin w-4 h-4"/> : <><CheckCircle className="w-4 h-4" /> Save Credentials</>}
            </button>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <Link to="/login" className="text-xs text-zinc-500 hover:text-white flex items-center justify-center gap-1 transition-colors">
             <ArrowRight className="w-3 h-3 rotate-180" /> RETURN TO LOGIN
          </Link>
        </div>

      </div>
    </div>
  );
};

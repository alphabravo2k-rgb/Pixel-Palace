import React, { useState } from 'react';
import { supabase } from '../../supabase/client';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Key, Mail, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';

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

    // Send OTP (Sign in with OTP)
    const { error } = await supabase.auth.signInWithOtp({
      email: formData.email,
      options: { shouldCreateUser: false } // Only allow existing admins
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setStep(2); // Move to PIN entry
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
    } else if (data.session) {
      // PIN Correct - User is now technically logged in
      setStep(3); // Move to Password Update
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
    } else {
      alert("Password Updated Successfully! Please login.");
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0b0c0f] border border-zinc-800 rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-800">
            <Shield className="text-fuchsia-500 w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter">
            {step === 1 && 'Recovery Protocol'}
            {step === 2 && 'Verify Identity'}
            {step === 3 && 'New Credentials'}
          </h1>
          <p className="text-zinc-500 text-xs font-mono mt-2">
            {step === 1 && 'Enter your registered admin email.'}
            {step === 2 && 'Enter the 6-digit PIN sent to your email.'}
            {step === 3 && 'Secure your account with a new password.'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-900/20 border border-red-900/50 rounded text-red-400 text-xs font-bold text-center uppercase">
            {error}
          </div>
        )}

        {/* --- STEP 1: EMAIL --- */}
        {step === 1 && (
          <form onSubmit={handleSendPin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-zinc-500">Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-black border border-zinc-800 rounded p-3 pl-10 text-white focus:border-fuchsia-500 outline-none text-sm"
                  placeholder="admin@pixelpalace.com"
                  required
                />
              </div>
            </div>
            <button disabled={loading} className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold uppercase text-xs rounded">
              {loading ? 'Sending...' : 'Send Access PIN'}
            </button>
          </form>
        )}

        {/* --- STEP 2: PIN --- */}
        {step === 2 && (
          <form onSubmit={handleVerifyPin} className="space-y-4">
             <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-zinc-500">6-Digit PIN</label>
              <div className="relative">
                <Key className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                <input 
                  type="text" 
                  value={formData.pin}
                  onChange={e => setFormData({...formData, pin: e.target.value})}
                  className="w-full bg-black border border-zinc-800 rounded p-3 pl-10 text-white focus:border-fuchsia-500 outline-none text-xl font-mono tracking-widest text-center"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
              </div>
            </div>
            <button disabled={loading} className="w-full py-4 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold uppercase text-xs rounded">
              {loading ? 'Verifying...' : 'Verify PIN'}
            </button>
            <button type="button" onClick={() => setStep(1)} className="w-full py-2 text-zinc-500 text-xs hover:text-white">Try different email</button>
          </form>
        )}

        {/* --- STEP 3: NEW PASSWORD --- */}
        {step === 3 && (
          <form onSubmit={handleUpdatePassword} className="space-y-4">
             <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-zinc-500">New Password</label>
              <div className="relative">
                <Shield className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                <input 
                  type="password" 
                  value={formData.newPassword}
                  onChange={e => setFormData({...formData, newPassword: e.target.value})}
                  className="w-full bg-black border border-zinc-800 rounded p-3 pl-10 text-white focus:border-fuchsia-500 outline-none"
                  placeholder="••••••••"
                  minLength={6}
                  required
                />
              </div>
            </div>
            <button disabled={loading} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase text-xs rounded flex items-center justify-center gap-2">
              {loading ? <Loader2 className="animate-spin w-4 h-4"/> : <><CheckCircle className="w-4 h-4" /> Save New Password</>}
            </button>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-zinc-800 text-center">
          <Link to="/login" className="text-xs text-zinc-500 hover:text-white flex items-center justify-center gap-1">
             <ArrowRight className="w-3 h-3 rotate-180" /> Back to Login
          </Link>
        </div>

      </div>
    </div>
  );
};

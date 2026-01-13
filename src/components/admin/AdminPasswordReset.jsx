/**
 * 🛡️ ADMIN PASSWORD RESET: RECOVERY PROTOCOL
 * VERSION: 2050.5.0 (MASTER OMNI)
 * STATUS: SECURED // ENCRYPTED CHANNEL
 */

import React, { useState } from 'react';
import { supabase } from '../../supabase/client';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Key, Mail, ArrowRight, CheckCircle, Loader2, Terminal, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';

// MASTER CORE
import { SoundNexus, CUES } from '../../lib/soundNexus';
import { Telemetry, EVENTS } from '../../lib/telemetry';

export const AdminPasswordReset = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=Email, 2=OTP, 3=NewPass
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    pin: '',
    newPassword: ''
  });

  // 🛰️ TELEMETRY: Trace recovery attempts
  const logRecoveryEvent = (action, details = {}) => {
    Telemetry.log(EVENTS.AUTH, { 
        subsystem: 'RECOVERY_PROTOCOL', 
        action, 
        email: formData.email,
        ...details 
    });
  };

  // STEP 1: INITIALIZE OTP (Send Code)
  const handleSendPin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    SoundNexus.play(CUES.UI_CLICK);

    // Conflict Avoidance: Wipe existing local sessions
    await supabase.auth.signOut();

    const { error } = await supabase.auth.signInWithOtp({
      email: formData.email,
      options: { shouldCreateUser: false } 
    });

    setLoading(false);

    if (error) {
      setError(error.message.toUpperCase());
      SoundNexus.play(CUES.UI_ERROR);
    } else {
      setStep(2); 
      logRecoveryEvent('OTP_SENT');
      SoundNexus.play(CUES.UI_SUCCESS);
      toast.success("RECOVERY CODE DISPATCHED");
    }
  };

  // STEP 2: IDENTITY CHALLENGE (Verify PIN)
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
      setError("INVALID ACCESS CODE");
      SoundNexus.play(CUES.UI_ERROR);
    } else if (data.session) {
      setStep(3); 
      logRecoveryEvent('OTP_VERIFIED');
      SoundNexus.play(CUES.UI_SUCCESS);
      toast.success("IDENTITY CONFIRMED");
    }
  };

  // STEP 3: CREDENTIAL REWRITE (New Password)
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.newPassword.length < 8) {
      setError("PASSWORD MUST BE 8+ CHARACTERS");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: formData.newPassword
    });

    setLoading(false);

    if (error) {
      setError(error.message.toUpperCase());
      SoundNexus.play(CUES.UI_ERROR);
    } else {
      logRecoveryEvent('CREDENTIALS_REWRITTEN');
      SoundNexus.play(CUES.UI_SUCCESS);
      toast.success("MASTER CREDENTIALS UPDATED");
      navigate('/admin/login');
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* 🌌 ATMOSPHERIC OVERLAY */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-fuchsia-600/5 blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-md bg-[#09090b] border border-white/5 rounded-sm shadow-2xl relative z-10 overflow-hidden">
        
        {/* TACTICAL PROGRESS BAR */}
        <div className="h-1 w-full bg-zinc-900 flex">
            <div className={`h-full transition-all duration-500 bg-fuchsia-600 ${step >= 1 ? 'w-1/3' : 'w-0'}`} />
            <div className={`h-full transition-all duration-500 bg-fuchsia-600 ${step >= 2 ? 'w-1/3' : 'w-0'}`} />
            <div className={`h-full transition-all duration-500 bg-emerald-500 ${step >= 3 ? 'w-1/3' : 'w-0'}`} />
        </div>

        <div className="p-10">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="w-20 h-20 bg-zinc-900/50 rounded-sm flex items-center justify-center mx-auto mb-6 border border-white/5 group">
                <Shield className="text-white w-10 h-10 group-hover:text-fuchsia-500 transition-colors duration-500" />
              </div>
              <h1 className="text-3xl font-display font-black text-white uppercase italic tracking-tighter leading-none">
                {step === 1 && 'Restoration'}
                {step === 2 && 'Challenge'}
                {step === 3 && 'Overwrite'}
              </h1>
              <p className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.5em] mt-3 flex items-center justify-center gap-2">
                <Terminal size={12} className="text-fuchsia-500" /> Secure Terminal
              </p>
            </div>

            {error && (
              <div className="mb-8 p-4 bg-red-900/10 border border-red-500/30 rounded-sm text-red-500 text-[10px] font-black text-center uppercase flex items-center justify-center gap-3">
                <AlertTriangle size={14} /> {error}
              </div>
            )}

            {/* --- STEP 1: EMAIL --- */}
            {step === 1 && (
              <form onSubmit={handleSendPin} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px] uppercase font-black text-zinc-500 tracking-widest">Admin Identifier</label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700 group-focus-within:text-white transition-colors" />
                    <input 
                      type="email" 
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-black border border-zinc-800 rounded-sm p-4 pl-10 text-white focus:border-fuchsia-500 outline-none text-sm font-mono transition-all"
                      placeholder="IDENT_USER@NODE"
                      required
                    />
                  </div>
                </div>
                <button disabled={loading} className="w-full py-5 bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white font-black uppercase text-[10px] tracking-[0.4em] rounded-sm transition-all flex items-center justify-center gap-2 active:scale-95">
                  {loading ? <Loader2 className="animate-spin w-5 h-5"/> : 'Initialize Recovery'}
                </button>
              </form>
            )}

            {/* --- STEP 2: PIN --- */}
            {step === 2 && (
              <form onSubmit={handleVerifyPin} className="space-y-6">
                 <div className="space-y-2 text-center">
                  <label className="text-[9px] uppercase font-black text-zinc-500 tracking-widest block mb-4">Verification PIN</label>
                  <input 
                    type="text" 
                    value={formData.pin}
                    onChange={e => setFormData({...formData, pin: e.target.value})}
                    className="w-full bg-black/50 border border-zinc-800 rounded-sm p-5 text-white focus:border-fuchsia-500 outline-none text-3xl font-mono tracking-[1em] text-center transition-all"
                    placeholder="000000"
                    maxLength={6}
                    required
                    autoFocus
                  />
                </div>
                <button disabled={loading} className="w-full py-5 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-black uppercase text-[10px] tracking-[0.4em] rounded-sm shadow-2xl shadow-fuchsia-500/20 transition-all flex items-center justify-center gap-2">
                  {loading ? <Loader2 className="animate-spin w-5 h-5"/> : 'Authenticate Access'}
                </button>
                <button type="button" onClick={() => setStep(1)} className="w-full py-2 text-zinc-600 text-[9px] font-black uppercase tracking-widest hover:text-white transition-colors">Abort & Change ID</button>
              </form>
            )}

            {/* --- STEP 3: NEW PASSWORD --- */}
            {step === 3 && (
              <form onSubmit={handleUpdatePassword} className="space-y-6">
                 <div className="space-y-2">
                  <label className="text-[9px] uppercase font-black text-zinc-500 tracking-widest">New Master Cypher</label>
                  <div className="relative group">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700 group-focus-within:text-emerald-500 transition-colors" />
                    <input 
                      type="password" 
                      value={formData.newPassword}
                      onChange={e => setFormData({...formData, newPassword: e.target.value})}
                      className="w-full bg-black border border-zinc-800 rounded-sm p-4 pl-10 text-white focus:border-emerald-500 outline-none transition-all font-mono"
                      placeholder="••••••••"
                      minLength={8}
                      required
                      autoFocus
                    />
                  </div>
                </div>
                <button disabled={loading} className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-[10px] tracking-[0.4em] rounded-sm shadow-2xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2">
                  {loading ? <Loader2 className="animate-spin w-5 h-5"/> : <><CheckCircle className="w-5 h-5" /> Commit Credentials</>}
                </button>
              </form>
            )}

            <div className="mt-10 pt-8 border-t border-white/5 text-center">
              <Link to="/admin/login" className="text-[9px] font-black uppercase tracking-widest text-zinc-600 hover:text-white flex items-center justify-center gap-2 transition-colors">
                  <ArrowRight className="w-3 h-3 rotate-180" /> Back to Bridge
              </Link>
            </div>
        </div>
      </div>
    </div>
  );
};

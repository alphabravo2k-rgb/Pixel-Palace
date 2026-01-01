import React, { useState } from 'react';
import { supabase } from '../../supabase/client';
import { Shield, User, Mail, Lock, Gamepad, Link as LinkIcon, Save, AlertTriangle, CheckCircle } from 'lucide-react';

/**
 * PIXEL PALACE - STAFF ENLISTMENT COMPONENT
 * Handles secure Auth creation, Admin Profile sync, and Audit Logging.
 */
export const StaffRegistration = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    discord: '',
    faceit: '',
    steam: ''
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', msg: '' });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', msg: '' });

    try {
      // 1. Create Auth User in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: { full_name: formData.fullName } 
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Registration failed. Please check your email for verification.");

      // 2. Create Admin Profile in public.app_admins
      const { error: profileError } = await supabase
        .from('app_admins')
        .insert({
          auth_user_id: authData.user.id,
          email: formData.email,      
          full_name: formData.fullName, 
          role: 'CREW', // Default role pending manual promotion
          discord_handle: formData.discord,
          faceit_link: formData.faceit,
          steam_link: formData.steam
        });

      if (profileError) throw profileError;

      // 3. Log to Audit Trail 
      // Ensures "details" is sent as a clean JS Object to satisfy JSONB requirement
      await supabase.from('admin_audit_logs').insert({
        operator_id: authData.user.id,
        action_type: 'STAFF_REGISTRATION',
        target: formData.fullName,
        target_resource: 'app_admins',
        details: {
          email: formData.email,
          registration_date: new Date().toISOString(),
          status: 'PENDING_ACTIVATION'
        }
      });

      setStatus({ type: 'success', msg: 'Enlistment Successful! Access pending manual clearance.' });
      setFormData({ email: '', password: '', fullName: '', discord: '', faceit: '', steam: '' });

    } catch (err) {
      console.error("Registration Error:", err);
      setStatus({ type: 'error', msg: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-[#0b0c0f] border border-zinc-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        {/* Visual Brand Header */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-fuchsia-600 to-purple-600"></div>
        <div className="mb-8 text-center">
          <Shield className="w-12 h-12 text-fuchsia-500 mx-auto mb-4" />
          <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">
            STAFF <span className="text-fuchsia-500">ENLISTMENT</span>
          </h1>
          <p className="text-zinc-500 text-[10px] font-mono mt-2 tracking-widest uppercase">
            Secure Channel // Authorized Personnel Only
          </p>
        </div>

        {/* Feedback Alerts */}
        {status.msg && (
          <div className={`mb-6 p-4 rounded border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${
            status.type === 'success' 
              ? 'bg-green-900/20 border-green-800 text-green-400' 
              : 'bg-red-900/20 border-red-800 text-red-400'
          }`}>
            {status.type === 'success' ? <CheckCircle size={20}/> : <AlertTriangle size={20}/>}
            <span className="text-xs font-bold uppercase tracking-tight">{status.msg}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">
          {/* Full Name Input */}
          <div>
            <label className="text-[10px] font-bold text-zinc-500 uppercase mb-1 block">Legal Identity</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 w-4 h-4 text-zinc-600" />
              <input 
                required 
                name="fullName" 
                value={formData.fullName} 
                onChange={handleChange} 
                className="w-full bg-zinc-900 border border-zinc-700 text-white text-sm rounded pl-10 pr-4 py-2 focus:border-fuchsia-500 outline-none transition-all" 
                placeholder="Full Name" 
              />
            </div>
          </div>

          {/* Credentials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase mb-1 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-zinc-600" />
                <input 
                  required 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  className="w-full bg-zinc-900 border border-zinc-700 text-white text-sm rounded pl-10 pr-4 py-2 focus:border-fuchsia-500 outline-none transition-all" 
                  placeholder="agent@pixelpalace.gg" 
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase mb-1 block">Security Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-zinc-600" />
                <input 
                  required 
                  type="password" 
                  name="password" 
                  value={formData.password} 
                  onChange={handleChange} 
                  className="w-full bg-zinc-900 border border-zinc-700 text-white text-sm rounded pl-10 pr-4 py-2 focus:border-fuchsia-500 outline-none transition-all" 
                  placeholder="••••••••" 
                />
              </div>
            </div>
          </div>

          {/* Platform Identifiers Section */}
          <div className="space-y-4 pt-4 border-t border-zinc-800">
            <h3 className="text-[10px] font-bold text-fuchsia-500 uppercase tracking-widest">Digital Identifiers</h3>
            <div className="space-y-4">
               <div className="relative">
                  <Gamepad className="absolute left-3 top-2.5 w-4 h-4 text-zinc-600" />
                  <input 
                    required 
                    name="discord" 
                    value={formData.discord} 
                    onChange={handleChange} 
                    className="w-full bg-zinc-900 border border-zinc-700 text-white text-sm rounded pl-10 pr-4 py-2 focus:border-fuchsia-500 outline-none" 
                    placeholder="Discord Handle (e.g. user#1234)" 
                  />
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="relative">
                    <LinkIcon className="absolute left-3 top-2.5 w-4 h-4 text-zinc-600" />
                    <input 
                      name="faceit" 
                      value={formData.faceit} 
                      onChange={handleChange} 
                      className="w-full bg-zinc-900 border border-zinc-700 text-white text-sm rounded pl-10 pr-4 py-2 focus:border-fuchsia-500 outline-none" 
                      placeholder="Faceit Profile URL" 
                    />
                 </div>
                 <div className="relative">
                    <LinkIcon className="absolute left-3 top-2.5 w-4 h-4 text-zinc-600" />
                    <input 
                      name="steam" 
                      value={formData.steam} 
                      onChange={handleChange} 
                      className="w-full bg-zinc-900 border border-zinc-700 text-white text-sm rounded pl-10 pr-4 py-2 focus:border-fuchsia-500 outline-none" 
                      placeholder="Steam Profile URL" 
                    />
                 </div>
               </div>
            </div>
          </div>

          {/* Submit Button */}
          <button 
            disabled={loading} 
            type="submit" 
            className="w-full py-4 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-black uppercase tracking-widest rounded transition-all shadow-[0_0_20px_rgba(192,38,211,0.3)] disabled:opacity-50 flex items-center justify-center gap-2 group"
          >
            {loading ? (
              <Loader2 className="animate-spin w-5 h-5" />
            ) : (
              <>
                <Save size={18} className="group-hover:scale-110 transition-transform" /> 
                Submit Enlistment
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

/** * Local Loader Component to prevent missing import issues
 */
const Loader2 = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

/**
 * 🆔 ADMIN PROFILE: OPERATOR DOSSIER
 * VERSION: 2050.5.0 (MASTER OMNI)
 * STATUS: SECURED // SYNCED
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase/client';
import { useNexus } from '../../hooks/useNexus';
import { Shield, MessageSquare, Globe, Save, User, Swords, Loader2, Cpu } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { SoundNexus, CUES } from '../../lib/soundNexus';
import { Telemetry, EVENTS } from '../../lib/telemetry';

const AdminProfile = () => {
  const { user, theme } = useNexus();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    discord_handle: '',
    steam_link: '',
    faceit_link: '',
    bio: ''
  });

  useEffect(() => {
    if (user?.id) fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('app_admins')
        .select('*')
        .eq('auth_user_id', user.id)
        .single();
      
      // PGRST116 is 'No rows found' - perfectly normal for a new admin
      if (error && error.code !== 'PGRST116') throw error; 
      if (data) setProfile(data);
    } catch (err) {
      console.error("Profile Fetch Error:", err);
      Telemetry.log(EVENTS.ERROR, { subsystem: 'PROFILE', error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    SoundNexus.play(CUES.UI_CLICK);
    
    try {
      // Upsert handles both Insert (New) and Update (Existing) logic
      const { error } = await supabase
        .from('app_admins')
        .upsert({
          auth_user_id: user.id,
          full_name: profile.full_name,
          discord_handle: profile.discord_handle,
          steam_link: profile.steam_link,
          faceit_link: profile.faceit_link,
          bio: profile.bio,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      
      SoundNexus.play(CUES.UI_SUCCESS);
      toast.success("COMMAND DOSSIER UPDATED");
      Telemetry.log(EVENTS.ACTION, { action: 'profile_update' }, user.id);
    } catch (err) {
      SoundNexus.play(CUES.UI_ERROR);
      toast.error("COMMIT FAILED: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="h-96 flex flex-col items-center justify-center gap-4">
      <Cpu className="animate-spin text-fuchsia-500 w-12 h-12 opacity-20" />
      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.5em]">Synchronizing Dossier...</span>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-[#09090b] border border-zinc-800 rounded-sm overflow-hidden shadow-2xl relative">
        
        {/* DECORATIVE SCANLINES */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,118,0.06))] bg-[length:100%_2px,3px_100%] z-20" />

        {/* HEADER AREA */}
        <div className="p-10 bg-zinc-900/20 border-b border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 translate-x-10 -translate-y-10">
             <Shield size={200} className={theme.color} />
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className={`w-24 h-24 ${theme.bg} rounded-sm flex items-center justify-center border-2 ${theme.border} shadow-2xl rotate-3`}>
              <User size={48} className={theme.color} />
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-4xl font-display font-black text-white italic uppercase tracking-tighter">
                {profile.full_name || user?.username || 'New Operative'}
              </h2>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-3">
                <span className={`px-3 py-1 ${theme.bg} ${theme.color} text-[10px] font-black uppercase rounded-sm border ${theme.border} tracking-widest`}>
                   {user?.role || 'Staff'}
                </span>
                <span className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest bg-black/40 px-2 py-1 rounded-sm border border-white/5">
                  Clearance: {user?.clearance || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* FORM GRID */}
        <div className="p-10 space-y-10 bg-black/20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em]">Operational Name</label>
              <input 
                value={profile.full_name} 
                onChange={e => setProfile({...profile, full_name: e.target.value})}
                className="w-full bg-black border border-zinc-800 rounded-sm p-4 text-white text-xs font-mono focus:border-fuchsia-500 outline-none transition-all placeholder:text-zinc-800"
                placeholder="Full Tactical Alias"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[9px] font-black text-[#5865F2] uppercase tracking-[0.3em] flex items-center gap-2">
                <MessageSquare size={14} /> Discord Uplink
              </label>
              <input 
                value={profile.discord_handle} 
                onChange={e => setProfile({...profile, discord_handle: e.target.value})}
                className="w-full bg-black border border-zinc-800 rounded-sm p-4 text-white text-xs font-mono focus:border-[#5865F2] outline-none transition-all placeholder:text-zinc-800"
                placeholder="alias#0000"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[9px] font-black text-blue-400 uppercase tracking-[0.3em] flex items-center gap-2">
                <Globe size={14} /> Steam Signal
              </label>
              <input 
                value={profile.steam_link} 
                onChange={e => setProfile({...profile, steam_link: e.target.value})}
                className="w-full bg-black border border-zinc-800 rounded-sm p-4 text-white text-xs font-mono focus:border-blue-500 outline-none transition-all placeholder:text-zinc-800"
                placeholder="steamcommunity.com/id/..."
              />
            </div>

            <div className="space-y-3">
              <label className="text-[9px] font-black text-orange-500 uppercase tracking-[0.3em] flex items-center gap-2">
                <Swords size={14} /> Faceit Frequency
              </label>
              <input 
                value={profile.faceit_link} 
                onChange={e => setProfile({...profile, faceit_link: e.target.value})}
                className="w-full bg-black border border-zinc-800 rounded-sm p-4 text-white text-xs font-mono focus:border-orange-500 outline-none transition-all placeholder:text-zinc-800"
                placeholder="faceit.com/en/players/..."
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em]">Operational Background</label>
            <textarea 
              value={profile.bio} 
              onChange={e => setProfile({...profile, bio: e.target.value})}
              className="w-full bg-black border border-zinc-800 rounded-sm p-5 text-white text-xs font-mono focus:border-fuchsia-500 outline-none h-40 resize-none transition-all placeholder:text-zinc-800"
              placeholder="Record operational experience, primary titles, or combat roles..."
            />
          </div>

          <div className="pt-6">
            <button 
              onClick={handleSave}
              disabled={saving}
              className={`w-full py-5 ${theme.bg} ${theme.color} font-black uppercase text-[11px] tracking-[0.4em] rounded-sm shadow-2xl transition-all flex items-center justify-center gap-4 disabled:opacity-50 hover:brightness-110 active:scale-[0.98] border ${theme.border}`}
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Commit Profile to Nexus
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;

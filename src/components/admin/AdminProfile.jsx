import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase/client';
import { useSession } from '../../auth/useSession';
import { Shield, MessageSquare, Globe, Save, User, Swords, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdminProfile = () => {
  const { session } = useSession();
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
    if (session?.user?.id) fetchProfile();
  }, [session]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('app_admins')
        .select('*')
        .eq('auth_user_id', session.user.id)
        .single();
      
      if (error) throw error;
      if (data) setProfile(data);
    } catch (err) {
      console.error("Profile Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const toastId = toast.loading("Syncing Command Profile...");
    
    try {
      const { error } = await supabase
        .from('app_admins')
        .update({
          full_name: profile.full_name,
          discord_handle: profile.discord_handle,
          steam_link: profile.steam_link,
          faceit_link: profile.faceit_link,
          bio: profile.bio,
          updated_at: new Date()
        })
        .eq('auth_user_id', session.user.id);

      if (error) throw error;
      toast.success("Profile Updated Successfully", { id: toastId });
    } catch (err) {
      toast.error("Update Failed: " + err.message, { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="h-96 flex items-center justify-center">
      <Loader2 className="animate-spin text-brand" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-zinc-900/50 border border-white/10 rounded-lg overflow-hidden shadow-2xl">
        {/* HEADER AREA */}
        <div className="p-8 bg-gradient-to-br from-zinc-900 to-black border-b border-white/5 relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
             <Shield size={120} />
          </div>
          
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-20 h-20 bg-brand/10 rounded-full flex items-center justify-center border-2 border-brand/50 shadow-[0_0_20px_rgba(var(--color-brand)/0.2)]">
              <User size={40} className="text-brand" />
            </div>
            <div>
              <h2 className="text-3xl font-display font-black text-white italic uppercase tracking-tighter">
                {profile.full_name || 'Operator Profile'}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 bg-brand/20 text-brand-glow text-[10px] font-bold uppercase rounded border border-brand/30">
                   {session?.role || 'Staff'}
                </span>
                <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">
                  ID: {session?.user?.id?.slice(0, 8)}...
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* FORM AREA */}
        <div className="p-8 space-y-8 bg-black/40">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Display Name</label>
              <input 
                value={profile.full_name} 
                onChange={e => setProfile({...profile, full_name: e.target.value})}
                className="w-full bg-black border border-zinc-800 rounded p-3 text-white text-sm focus:border-brand outline-none transition-all"
                placeholder="Operational Alias"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#5865F2] uppercase tracking-widest flex items-center gap-1">
                <MessageSquare size={12} /> Discord Identity
              </label>
              <input 
                value={profile.discord_handle} 
                onChange={e => setProfile({...profile, discord_handle: e.target.value})}
                className="w-full bg-black border border-zinc-800 rounded p-3 text-white text-sm focus:border-[#5865F2] outline-none transition-all"
                placeholder="username#0000"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1">
                <Globe size={12} /> Steam Profile URL
              </label>
              <input 
                value={profile.steam_link} 
                onChange={e => setProfile({...profile, steam_link: e.target.value})}
                className="w-full bg-black border border-zinc-800 rounded p-3 text-white text-sm focus:border-blue-500 outline-none transition-all"
                placeholder="https://steamcommunity.com/id/..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-orange-500 uppercase tracking-widest flex items-center gap-1">
                <Swords size={12} /> Faceit Profile URL
              </label>
              <input 
                value={profile.faceit_link} 
                onChange={e => setProfile({...profile, faceit_link: e.target.value})}
                className="w-full bg-black border border-zinc-800 rounded p-3 text-white text-sm focus:border-orange-500 outline-none transition-all"
                placeholder="https://www.faceit.com/en/players/..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Operator Bio</label>
            <textarea 
              value={profile.bio} 
              onChange={e => setProfile({...profile, bio: e.target.value})}
              className="w-full bg-black border border-zinc-800 rounded p-4 text-white text-sm focus:border-brand outline-none h-32 resize-none transition-all"
              placeholder="Operational background, primary games, or roles..."
            />
          </div>

          <div className="pt-4">
            <button 
              onClick={handleSave}
              disabled={saving}
              className="w-full py-4 bg-brand hover:bg-brand-glow text-white font-black uppercase text-xs tracking-[0.2em] rounded shadow-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Commit Profile Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;

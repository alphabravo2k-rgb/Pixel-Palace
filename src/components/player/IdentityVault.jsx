/**
 * 👤 IDENTITY VAULT: OPERATOR PROFILE (GENESIS OMNI)
 * VERSION: 2050.5.0 (MASTER OMNI)
 * STATUS: OPERATIONAL // NEURAL_LINK_STABLE
 * -----------------------------------------
 * The central hub for player customization and stats visualization.
 * Features holographic ID rendering and atomic profile updates.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Edit2, Save, X, Camera, Shield, 
  CreditCard, Activity, Zap, Share2, Copy, 
  Terminal, Target, Cpu, Globe
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '../../lib/utils';

// MASTER CORE
import { supabase, storageNexus } from '../../supabase/client';
import { useNexus } from '../../hooks/useNexus';
import { SoundNexus, CUES } from '../../lib/soundNexus';
import { Telemetry, EVENTS } from '../../lib/telemetry';

// 🎨 POWER LEVEL COLOR LOGIC
const getEloConfig = (elo) => {
  if (elo >= 2500) return { col: 'text-red-500', glow: 'shadow-[0_0_20px_rgba(239,68,68,0.3)]', label: 'APEX' };
  if (elo >= 2000) return { col: 'text-amber-500', glow: 'shadow-[0_0_20px_rgba(245,158,11,0.3)]', label: 'ELITE' };
  if (elo >= 1500) return { col: 'text-fuchsia-500', glow: 'shadow-[0_0_20px_rgba(192,38,211,0.3)]', label: 'DIAMOND' };
  return { col: 'text-emerald-500', glow: 'shadow-[0_0_20px_rgba(16,185,129,0.3)]', label: 'FIELD' };
};

export const IdentityVault = () => {
  const { user, syncNexus } = useNexus();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    display_name: '',
    steam_url: '',
    faceit_url: '',
    discord_handle: ''
  });

  // 📡 NEURAL UPLINK
  const fetchProfile = useCallback(async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setProfile(data);
      setFormData({
        display_name: data.display_name || '',
        steam_url: data.steam_url || '',
        faceit_url: data.faceit_url || '',
        discord_handle: data.discord_handle || ''
      });
    } catch (err) {
      toast.error("IDENTITY_SYNC_INTERRUPTED");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  // 💾 COMMIT CHANGES
  const handleSave = async () => {
    try {
      try{SoundNexus.play(CUES.UI_CLICK_HEAVY);}catch(e){}
      const { error } = await supabase
        .from('profiles')
        .update({ ...formData, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (error) throw error;

      await syncNexus(); // Global state refresh
      setProfile({ ...profile, ...formData });
      setIsEditing(false);
      toast.success("IDENTITY RECORD COMMITTED");
      try{SoundNexus.play(CUES.UI_SUCCESS);}catch(e){}
      Telemetry.log(EVENTS.ACTION, { action: 'PROFILE_COMMIT' }, user.id);
    } catch (err) {
      toast.error("COMMIT_REJECTED: " + err.message);
      try{SoundNexus.play(CUES.UI_ERROR);}catch(e){}
    }
  };

  // 📸 VISUAL ID UPLINK
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("DATA_OVERFLOW: MAX 2MB");
      return;
    }

    setUploading(true);
    try{SoundNexus.play(CUES.UI_CLICK);}catch(e){}
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `id_${user.id}_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const publicUrl = storageNexus.getUrl('avatars', fileName);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
      toast.success("VISUAL_ID_SYNCHRONIZED");
      try{SoundNexus.play(CUES.UI_SUCCESS);}catch(e){}
    } catch (err) {
      toast.error("UPLINK_FAILURE");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return (
    <div className="h-[600px] flex flex-col items-center justify-center gap-6">
       <div className="w-16 h-16 border-2 border-fuchsia-500/20 border-t-fuchsia-500 rounded-full animate-spin" />
       <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.6em]">Establishing_Neural_Sync...</p>
    </div>
  );

  const eloCfg = getEloConfig(profile?.faceit_elo || 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 p-10 animate-in fade-in duration-1000 font-sans">
      
      {/* 🪪 TIER 1: THE HOLOGRAPHIC ID (COL-4) */}
      <div className="lg:col-span-4 space-y-8">
        <motion.div 
          className="relative bg-[#09090b] border border-white/5 rounded-sm p-10 overflow-hidden group shadow-[0_0_100px_rgba(0,0,0,0.5)]"
          whileHover={{ y: -5 }}
        >
          {/* ATMOSPHERIC NOISE */}
          <div className="absolute inset-0 scanlines opacity-10 pointer-events-none" />
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-fuchsia-600/5 rounded-full blur-[80px]" />

          {/* AVATAR DOCK */}
          <div className="relative flex flex-col items-center mb-10">
            <div className="w-40 h-40 rounded-sm p-1 bg-gradient-to-br from-fuchsia-600/40 via-zinc-900 to-transparent relative rotate-3 group-hover:rotate-0 transition-all duration-700">
              <div className="w-full h-full rounded-sm bg-black overflow-hidden relative border border-white/10">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-800">
                    <User size={64} strokeWidth={1} />
                  </div>
                )}
                
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-fuchsia-600/80 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-md"
                >
                  <Camera className="text-white w-8 h-8 mb-2" />
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white">Modify_ID</span>
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} />
              </div>
            </div>
            
            {/* POWER INDEX BADGE */}
            <div className="mt-8 flex items-center gap-3 bg-black border border-white/5 px-6 py-2 rounded-sm shadow-2xl">
              <div className={cn("w-2 h-2 rounded-full animate-pulse shadow-neon", eloCfg.glow.replace('shadow-', 'bg-'))} />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white">
                Class: {eloCfg.label} // LVL {Math.floor((profile?.faceit_elo || 1000) / 200)}
              </span>
            </div>
          </div>

          {/* IDENTITY DATA */}
          <div className="text-center space-y-4 mb-10">
            <h2 className="text-4xl font-display font-black text-white uppercase italic tracking-tighter leading-none">
              {profile?.display_name || 'UNREGISTERED'}
            </h2>
            <div className="flex items-center justify-center gap-4 text-[9px] font-mono text-zinc-500 uppercase tracking-[0.4em]">
              <Target size={12} className="text-fuchsia-500" />
              <span>S_UNIT: {profile?.role || 'PLAYER'}</span>
            </div>
          </div>

          {/* COMBAT PROGRESSION */}
          <div className="space-y-4 bg-black/40 p-6 rounded-sm border border-white/5 relative">
            <div className="flex justify-between items-end">
              <div className="flex flex-col gap-1">
                <span className="text-[8px] font-black uppercase tracking-[0.4em] text-zinc-700">Combat_Rating</span>
                <span className={cn("text-3xl font-display font-black tracking-tighter", eloCfg.col)}>
                  {profile?.faceit_elo || '0000'}
                </span>
              </div>
              <Activity size={20} className="text-zinc-800 mb-2" />
            </div>
            <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }} 
                animate={{ width: `${Math.min(100, (profile?.faceit_elo / 3000) * 100)}%` }} 
                className={cn("h-full rounded-full transition-all duration-1000", eloCfg.col.replace('text-', 'bg-'))} 
              />
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-white/5 flex justify-between items-center opacity-30 group-hover:opacity-100 transition-opacity">
            <Cpu size={14} className="text-zinc-600" />
            <span className="text-[8px] font-mono text-zinc-600 tracking-[0.4em] uppercase">Auth_Trace: {user.id.slice(0,12)}</span>
          </div>
        </motion.div>
      </div>

      {/* 📝 TIER 2: SERVICE RECORD (COL-8) */}
      <div className="lg:col-span-8 flex flex-col gap-8">
        <div className="bg-[#09090b] border border-white/5 rounded-sm p-10 flex-1 relative overflow-hidden flex flex-col">
          {/* HEADER TERMINAL */}
          <div className="flex justify-between items-start mb-16 relative z-10">
            <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-zinc-900 border border-white/5 flex items-center justify-center rounded-sm">
                    <Terminal className="text-fuchsia-500" size={24} />
                </div>
                <div>
                    <h3 className="text-3xl font-display font-black text-white uppercase italic tracking-tighter">
                        Service Record
                    </h3>
                    <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.4em] mt-2">
                        Last_Handshake: {new Date(profile?.updated_at || Date.now()).toLocaleTimeString()}
                    </p>
                </div>
            </div>
            <button 
              onClick={() => { setIsEditing(!isEditing); try{SoundNexus.play(CUES.UI_CLICK);}catch(e){} }}
              className={cn(
                "px-6 py-3 rounded-sm border text-[10px] font-black uppercase tracking-[0.4em] transition-all flex items-center gap-3 active:scale-95",
                isEditing ? "bg-red-600/10 border-red-600 text-red-600" : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-white"
              )}
            >
              {isEditing ? <X size={14} /> : <Edit2 size={14} />}
              <span>{isEditing ? 'Cancel' : 'Edit_Record'}</span>
            </button>
          </div>

          {/* FORM MATRIX */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
            <div className="space-y-8">
                <div className="group">
                    <label className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.5em] mb-4 block group-focus-within:text-fuchsia-500 transition-colors">Tactical_Callsign</label>
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700 w-5 h-5" />
                        <input 
                            type="text" 
                            value={formData.display_name} 
                            disabled={!isEditing}
                            onChange={e => setFormData({ ...formData, display_name: e.target.value.toUpperCase() })}
                            className={cn(
                                "w-full bg-black border p-5 pl-14 text-sm font-mono text-white outline-none transition-all rounded-sm",
                                isEditing ? "border-zinc-800 focus:border-fuchsia-500 shadow-2xl" : "border-transparent text-zinc-600"
                            )}
                        />
                    </div>
                </div>

                <div className="group">
                    <label className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.5em] mb-4 block group-focus-within:text-indigo-500 transition-colors">Discord_Relay</label>
                    <div className="relative">
                        <Zap className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700 w-5 h-5" />
                        <input 
                            type="text" 
                            value={formData.discord_handle} 
                            disabled={!isEditing}
                            onChange={e => setFormData({ ...formData, discord_handle: e.target.value })}
                            className={cn(
                                "w-full bg-black border p-5 pl-14 text-sm font-mono text-white outline-none transition-all rounded-sm",
                                isEditing ? "border-zinc-800 focus:border-indigo-500 shadow-2xl" : "border-transparent text-zinc-600"
                            )}
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                <div className="group">
                    <label className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.5em] mb-4 block group-focus-within:text-orange-500 transition-colors">Faceit_Uplink</label>
                    <div className="relative">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700 w-5 h-5" />
                        <input 
                            type="text" 
                            value={formData.faceit_url} 
                            disabled={!isEditing}
                            onChange={e => setFormData({ ...formData, faceit_url: e.target.value })}
                            className={cn(
                                "w-full bg-black border p-5 pl-14 text-[10px] font-mono text-white outline-none transition-all rounded-sm",
                                isEditing ? "border-zinc-800 focus:border-orange-500 shadow-2xl" : "border-transparent text-zinc-600"
                            )}
                            placeholder="URL_REQUIRED"
                        />
                    </div>
                </div>

                <div className="group">
                    <label className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.5em] mb-4 block group-focus-within:text-blue-500 transition-colors">Steam_Registry</label>
                    <div className="relative">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700 w-5 h-5" />
                        <input 
                            type="text" 
                            value={formData.steam_url} 
                            disabled={!isEditing}
                            onChange={e => setFormData({ ...formData, steam_url: e.target.value })}
                            className={cn(
                                "w-full bg-black border p-5 pl-14 text-[10px] font-mono text-white outline-none transition-all rounded-sm",
                                isEditing ? "border-zinc-800 focus:border-blue-500 shadow-2xl" : "border-transparent text-zinc-600"
                            )}
                            placeholder="URL_REQUIRED"
                        />
                    </div>
                </div>
            </div>
          </div>

          {/* COMMIT GATE */}
          <AnimatePresence>
            {isEditing && (
              <motion.div 
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
                className="mt-auto pt-10 flex gap-6"
              >
                <button 
                  onClick={() => { setIsEditing(false); setFormData(profile); }}
                  className="flex-1 py-5 border border-zinc-800 text-zinc-600 hover:text-white uppercase font-black text-[11px] tracking-[0.4em] transition-all rounded-sm"
                >
                  Discard_Changes
                </button>
                <button 
                  onClick={handleSave}
                  className="flex-[2] py-5 bg-white text-black hover:bg-fuchsia-600 hover:text-white uppercase font-black text-[11px] tracking-[0.5em] shadow-2xl transition-all rounded-sm active:scale-95 flex items-center justify-center gap-4 group"
                >
                  <Save size={18} className="group-hover:rotate-12 transition-transform" /> 
                  Execute_Commit
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* DECORATIVE WATERMARK */}
          <div className="absolute bottom-6 right-8 opacity-5 pointer-events-none">
             <CreditCard size={180} strokeWidth={0.5} className="text-white" />
          </div>
        </div>

        {/* STATS OVERVIEW TILE */}
        <div className="grid grid-cols-3 gap-6">
            {[
                { label: 'Victory_Ratio', val: '64%', icon: Target },
                { label: 'System_Up', val: '99.9%', icon: Activity },
                { label: 'Clearance', val: 'L_10', icon: Shield }
            ].map((stat, i) => (
                <div key={i} className="bg-zinc-900/40 border border-white/5 p-6 rounded-sm flex flex-col justify-between group hover:border-fuchsia-500/20 transition-colors shadow-xl">
                    <stat.icon size={14} className="text-zinc-700 group-hover:text-fuchsia-500 transition-colors" />
                    <div className="mt-4">
                        <p className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-1">{stat.label}</p>
                        <p className="text-xl font-display font-black text-white italic">{stat.val}</p>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

/**
 * 🔐 TEAM LOGO VAULT: ASSET COMMAND (GENESIS OMNI)
 * VERSION: 2050.5.0 (MASTER OMNI)
 * STATUS: OPERATIONAL // SECURE_STORAGE
 * -----------------------------------------
 * The centralized interface for managing team identities.
 * Direct uplink to 'team-assets' storage bucket.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, Trash2, Image as ImageIcon, Copy, RefreshCw, 
  Shield, AlertTriangle, CheckCircle, HardDrive, Target, Zap, Cpu
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '../../lib/utils';

// MASTER CORE
import { supabase, storageNexus } from '../../supabase/client';
import { useNexus } from '../../hooks/useNexus';
import { SoundNexus, CUES } from '../../lib/soundNexus';
import { Telemetry, EVENTS } from '../../lib/telemetry';

// 🎨 FILE CONFIG (DUBAI STANDARD)
const MAX_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

export const TeamLogoVault = () => {
  const { user, can } = useNexus();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // 🛡️ SECURITY PROTOCOL
  if (!can('CAP_MANAGE_ASSETS')) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-16 text-center border border-red-500/10 bg-red-500/[0.01] rounded-sm">
        <HardDrive size={80} className="text-red-600 mb-8 animate-pulse opacity-10" />
        <h2 className="text-3xl font-display font-black uppercase italic text-red-500 tracking-tighter leading-none">Vault Sealed</h2>
        <p className="text-[10px] font-mono text-zinc-600 mt-5 uppercase tracking-[0.6em]">Secure Asset Protocol Required</p>
      </div>
    );
  }

  // 📡 DATA UPLINK
  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .storage
        .from('team-assets')
        .list('', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });

      if (error) throw error;

      const formatted = data.map(file => ({
        name: file.name,
        id: file.id,
        size: (file.metadata?.size / 1024).toFixed(1) + ' KB',
        url: storageNexus.getUrl('team-assets', file.name),
        created: new Date(file.created_at).toLocaleDateString()
      }));

      setAssets(formatted);
      Telemetry.log(EVENTS.ACTION, { action: 'VAULT_INDEXED' });
    } catch (err) {
      toast.error("VAULT INDEXING FAILED");
      try{SoundNexus.play(CUES.UI_ERROR);}catch(e){}
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAssets(); }, [fetchAssets]);

  // 📤 UPLOAD ENGINE (ATOMIC)
  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      try{SoundNexus.play(CUES.UI_ERROR);}catch(e){}
      toast.error("FORMAT_ERROR: PNG / WEBP ONLY");
      return;
    }
    if (file.size > MAX_SIZE) {
      try{SoundNexus.play(CUES.UI_ERROR);}catch(e){}
      toast.error("DATA_OVERFLOW: MAX 2MB");
      return;
    }

    setUploading(true);
    try{SoundNexus.play(CUES.UI_CLICK_HEAVY);}catch(e){}

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

      const { error } = await supabase.storage
        .from('team-assets')
        .upload(fileName, file);

      if (error) throw error;

      Telemetry.log(EVENTS.ACTION, { action: 'ASSET_COMMITTED', fileName }, user.id);
      try{SoundNexus.play(CUES.UI_SUCCESS);}catch(e){}
      toast.success("ASSET SEALED IN VAULT");
      fetchAssets();
    } catch (err) {
      toast.error("UPLINK_FAILURE: " + err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // 🗑️ PURGE PROTOCOL
  const handleDelete = async (fileName) => {
    if (!window.confirm("☢️ NUCLEAR ACTION: Permanently purge asset from secure storage?")) return;

    try {
      const { error } = await supabase.storage
        .from('team-assets')
        .remove([fileName]);

      if (error) throw error;

      Telemetry.log(EVENTS.ACTION, { action: 'ASSET_PURGED', fileName }, user.id);
      try{SoundNexus.play(CUES.UI_POWER_DOWN);}catch(e){}
      toast.success("ASSET ERASED");
      setAssets(prev => prev.filter(a => a.name !== fileName));
    } catch (err) {
      toast.error("PURGE_FAILED");
    }
  };

  const handleCopyUrl = (url) => {
      navigator.clipboard.writeText(url);
      try{SoundNexus.play(CUES.UI_CLICK);}catch(e){}
      toast.success("UPLINK COPIED TO CLIPBOARD");
  };

  return (
    <div className="h-full flex flex-col bg-[#050505] border border-white/5 rounded-sm relative overflow-hidden shadow-[0_0_80px_rgba(0,0,0,1)]">
      
      {/* HUD HEADER */}
      <div className="p-10 border-b border-white/5 bg-zinc-900/20 flex flex-col md:flex-row items-center justify-between backdrop-blur-3xl relative z-10 gap-8">
        <div className="flex items-center gap-8">
          <div className="w-16 h-16 bg-fuchsia-600/10 border border-fuchsia-500/20 rounded-sm flex items-center justify-center rotate-45 shadow-neon">
            <Target size={28} className="text-fuchsia-500 -rotate-45" />
          </div>
          <div>
            <h2 className="text-4xl font-display font-black text-white uppercase italic tracking-tighter leading-none">Asset Command</h2>
            <div className="flex items-center gap-4 mt-4">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-neon" />
                <p className="text-[10px] text-zinc-500 font-mono tracking-[0.5em] uppercase">
                    Stored_Units: {assets.length}
                </p>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
            <button 
                onClick={() => fileInputRef.current?.click()} 
                disabled={uploading}
                className="flex items-center gap-4 px-10 py-4 bg-fuchsia-600 hover:bg-fuchsia-500 text-white transition-all rounded-sm text-[10px] font-black uppercase tracking-[0.4em] active:scale-95 disabled:opacity-50 shadow-2xl shadow-fuchsia-600/20"
            >
               {uploading ? <RefreshCw size={16} className="animate-spin" /> : <Upload size={16} />} 
               {uploading ? 'Transmitting...' : 'Commit New Asset'}
            </button>
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleUpload} 
                className="hidden" 
                accept="image/png, image/jpeg, image/webp"
            />
            <button onClick={fetchAssets} className="p-4 bg-zinc-900 border border-zinc-800 hover:border-fuchsia-500 text-zinc-600 hover:text-white transition-all rounded-sm">
                <RefreshCw size={20} className={cn(loading && "animate-spin")} />
            </button>
        </div>
      </div>

      {/* ASSET GRID */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-12 relative">
        <div className="absolute inset-0 pointer-events-none opacity-10"><div className="scanlines" /></div>
        
        {assets.length === 0 && !loading ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-800 gap-6 opacity-30">
                <HardDrive size={100} strokeWidth={1} />
                <span className="text-[11px] font-mono uppercase tracking-[1em]">Storage_Empty</span>
            </div>
        ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-10">
                <AnimatePresence mode="popLayout">
                    {assets.map((asset, i) => (
                        <motion.div
                            key={asset.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.4, delay: i * 0.02 }}
                            className="group relative bg-[#09090b] border border-white/5 rounded-sm overflow-hidden aspect-square hover:border-fuchsia-500/50 transition-all shadow-2xl"
                        >
                            {/* PREVIEW MATRIX */}
                            <div className="absolute inset-0 p-8 flex items-center justify-center bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.02)_0%,_transparent_70%)]">
                                <img src={asset.url} alt={asset.name} className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(0,0,0,0.8)] group-hover:scale-110 transition-transform duration-700 ease-out" />
                            </div>

                            {/* TACTICAL OVERLAY */}
                            <div className="absolute inset-0 bg-[#020202]/90 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-between p-6 backdrop-blur-md translate-y-4 group-hover:translate-y-0">
                                <div className="flex justify-between items-start">
                                    <div className="w-8 h-8 bg-zinc-900 border border-zinc-800 rounded-sm flex items-center justify-center">
                                        <Zap size={14} className="text-amber-500" />
                                    </div>
                                    <button 
                                        onClick={() => handleDelete(asset.name)}
                                        className="p-3 bg-red-600/10 hover:bg-red-600 text-red-600 hover:text-white rounded-sm transition-all shadow-xl"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="border-l-2 border-fuchsia-500 pl-4">
                                        <p className="text-[10px] text-white font-mono font-bold truncate tracking-widest">{asset.name}</p>
                                        <p className="text-[8px] text-zinc-500 font-mono uppercase tracking-[0.2em] mt-1">{asset.size} // {asset.created}</p>
                                    </div>
                                    <button 
                                        onClick={() => handleCopyUrl(asset.url)}
                                        className="w-full py-3 bg-white text-black hover:bg-fuchsia-500 hover:text-white rounded-sm text-[9px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all active:scale-95"
                                    >
                                        <Copy size={12} /> Copy_Uplink
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        )}
      </div>

      {/* SYSTEM STATUS BAR */}
      <div className="p-4 bg-black/80 border-t border-white/5 flex justify-between items-center text-[9px] font-mono text-zinc-700 uppercase tracking-[0.4em]">
          <div className="flex items-center gap-3">
              <Cpu size={12} />
              <span>Storage_Node: Team_Assets_01</span>
          </div>
          <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-neon" />
              <span>Vault_Synchronized</span>
          </div>
      </div>
    </div>
  );
};

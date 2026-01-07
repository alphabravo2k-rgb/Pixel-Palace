/**
 * 📡 PIXEL PALACE: GLOBAL CHAT NEXUS
 * VERSION: 4.3.0 (MASTER HYBRID - HOTFIX)
 * STATUS: OPERATIONAL
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNexusStore } from '../../store/useNexusStore'; // ✅ Two levels up from communication folder
import { supabase } from '../../supabase/client';
import { SoundNexus, CUES } from '../../lib/soundNexus';
import { 
  MessageSquare, Send, Minimize2, Hash, 
  Shield, Crown, Mic, Activity 
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';

// --- 🎨 ROLE STYLING ENGINE ---
const getRoleStyle = (role) => {
  const r = String(role).toLowerCase();
  if (r === 'owner') return { color: 'text-yellow-500', icon: Crown, bg: 'bg-yellow-500/10' };
  if (r === 'admin') return { color: 'text-brand', icon: Shield, bg: 'bg-brand/10' };
  if (r === 'caster') return { color: 'text-purple-400', icon: Mic, bg: 'bg-purple-500/10' };
  if (r === 'captain') return { color: 'text-emerald-400', icon: Hash, bg: 'bg-emerald-500/10' };
  return { color: 'text-zinc-400', icon: null, bg: 'bg-zinc-800' };
};

const COOLDOWN_MS = 1500;

export const GlobalChatNexus = () => {
  // ✅ FIX: Destructure isLive and team_id properly
  const { profile, uid, isLive } = useNexusStore();
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [lastSent, setLastSent] = useState(0);
  
  const scrollRef = useRef(null);

  // 1️⃣ UPLINK ENGINE
  const fetchHistory = useCallback(async () => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (data) setMessages(data.reverse());
  }, []);

  useEffect(() => {
    fetchHistory();

    const channel = supabase
      .channel('nexus_comms_global')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages' 
      }, (payload) => {
        const msg = payload.new;
        setMessages(prev => [...prev.slice(-49), msg]); 
        
        if (msg.user_id !== uid) {
          const isStaff = ['owner', 'admin'].includes(msg.role);
          SoundNexus.play(isStaff ? CUES.NOTIFICATION : CUES.UI_CLICK);
          if (!isOpen) setUnreadCount(c => c + 1);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [uid, isOpen, fetchHistory]);

  // 2️⃣ SCROLL
  useEffect(() => {
    if (isOpen && scrollRef.current) {
      requestAnimationFrame(() => {
        scrollRef.current.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: 'smooth'
        });
      });
      setUnreadCount(0);
    }
  }, [messages, isOpen]);

  // 3️⃣ TRANSMISSION
  const handleSend = async (e) => {
    e.preventDefault();
    const now = Date.now();
    
    if (!inputText.trim() || isSending || (now - lastSent < COOLDOWN_MS)) return;

    setIsSending(true);
    setLastSent(now);
    const content = inputText;
    setInputText(''); 

    try {
      const { error } = await supabase.from('messages').insert({
        user_id: uid,
        display_name: profile?.display_name || 'Operator',
        role: profile?.role || 'guest',
        content,
        team_id: profile?.team_id
      });

      if (error) throw error;
      SoundNexus.play(CUES.UI_CLICK); 
    } catch (err) {
      console.error("Chat Error:", err);
      setInputText(content); 
      SoundNexus.play(CUES.DISPUTE_TRIGGER);
    } finally {
      setIsSending(false);
    }
  };

  // RENDER: MINIMIZED
  if (!isOpen) return (
    <button 
      onClick={() => { setIsOpen(true); SoundNexus.play(CUES.NAVIGATION_SWISH); }}
      className="fixed bottom-8 right-8 z-[200] flex items-center gap-4 bg-black/80 backdrop-blur-xl border border-white/10 p-5 rounded-sm shadow-neon hover:border-brand transition-all group active:scale-95"
    >
      <div className="relative">
        <MessageSquare className="text-brand w-6 h-6" />
        {unreadCount > 0 && (
          <div className="absolute -top-3 -right-3 px-1.5 py-0.5 bg-red-600 text-white text-[8px] font-black rounded-sm shadow-neon-red animate-pulse border border-red-400">
            {unreadCount} NEW
          </div>
        )}
      </div>
      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 group-hover:text-white transition-colors hidden md:block">
        Nexus Comms
      </span>
    </button>
  );

  // RENDER: EXPANDED
  return (
    <div className="fixed bottom-8 right-8 z-[200] w-[380px] h-[550px] bg-[#09090b]/95 backdrop-blur-2xl border border-white/5 rounded-sm shadow-2xl flex flex-col animate-in slide-in-from-bottom-6 duration-500 overflow-hidden">
      
      <div className="p-5 bg-white/[0.02] border-b border-white/5 flex justify-between items-center relative overflow-hidden cursor-move">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-brand animate-scan opacity-20" />
        <div className="flex items-center gap-3">
          <Activity size={14} className={cn("transition-colors", isLive ? "text-brand animate-pulse" : "text-zinc-600")} />
          <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Global Uplink</h3>
        </div>
        <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/5 rounded-sm text-zinc-700 hover:text-white transition-all">
          <Minimize2 size={18} />
        </button>
      </div>

      <div 
        ref={scrollRef} 
        className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:20px_20px]"
      >
        {messages.length === 0 && (
          <div className="text-center text-zinc-600 text-[10px] font-mono mt-20">--- CHANNEL SILENT ---</div>
        )}
        
        {messages.map((msg) => {
          const style = getRoleStyle(msg.role);
          const RoleIcon = style.icon;
          const isMe = msg.user_id === uid;

          return (
            <div key={msg.id} className={cn("flex flex-col animate-in fade-in slide-in-from-bottom-1", isMe ? "items-end" : "items-start")}>
              <div className="flex items-center gap-2 mb-2 opacity-80">
                {RoleIcon && !isMe && <RoleIcon size={10} className={style.color} />}
                <span className={cn("text-[9px] font-black uppercase tracking-widest", style.color)}>{msg.display_name}</span>
                <span className="text-[8px] text-zinc-700 font-mono italic">{format(new Date(msg.created_at), 'HH:mm')}</span>
              </div>
              <div className={cn(
                "max-w-[90%] p-4 text-[11px] font-medium leading-relaxed border transition-all duration-500",
                isMe ? "bg-brand/5 border-brand/20 text-white rounded-sm rounded-tr-none" : "bg-black border-white/5 text-zinc-400 rounded-sm rounded-tl-none hover:border-white/10"
              )}>
                {msg.content}
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSend} className="p-4 bg-black/60 border-t border-white/5 flex gap-3 items-center">
        <div className="flex-1 relative group">
           <input 
             value={inputText}
             onChange={(e) => setInputText(e.target.value)}
             placeholder={isLive ? "Transmit intelligence..." : "Nexus Offline"}
             disabled={!isLive && !['admin','owner'].includes(profile?.role)}
             className="w-full bg-zinc-900/50 border border-white/5 rounded-sm px-4 py-3 text-xs text-white placeholder:text-zinc-800 focus:border-brand/40 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
           />
           {inputText.length > 0 && <div className="absolute bottom-[-2px] left-0 h-[1px] bg-brand w-full scale-x-0 group-focus-within:scale-x-100 transition-transform origin-left" />}
        </div>
        <button 
          disabled={!inputText.trim() || isSending || (!isLive && !['admin','owner'].includes(profile?.role))}
          className="p-3 bg-brand text-white rounded-sm shadow-neon hover:brightness-110 disabled:opacity-20 disabled:grayscale transition-all"
        >
          <Send size={18} className={cn(isSending && "animate-pulse")} />
        </button>
      </form>

    </div>
  );
};

/**
 * 📡 GLOBAL CHAT NEXUS: TRANSCEIVER OMNI
 * VERSION: 2050.5.0 (MASTER OMNI)
 * STATUS: OPERATIONAL // REAL-TIME UPLINK
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, Send, Minimize2, Hash, 
  Shield, Crown, Mic, Activity, Zap 
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';

// MASTER CORE
import { useNexus } from '../../hooks/useNexus';
import { supabase } from '../../supabase/client';
import { SoundNexus, CUES } from '../../lib/soundNexus';
import { Telemetry, EVENTS } from '../../lib/telemetry';

const COOLDOWN_MS = 1200;

export const GlobalChatNexus = () => {
  const { user, theme, isAuthenticated } = useNexus();
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [lastSent, setLastSent] = useState(0);
  
  const scrollRef = useRef(null);

  // 1️⃣ SYNC ENGINE
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
      .channel('nexus_global_comms')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages' 
      }, (payload) => {
        const msg = payload.new;
        setMessages(prev => [...prev.slice(-49), msg]); 
        
        // 🔊 HAPTIC PRIORITY AUDIO
        if (msg.user_id !== user?.id) {
          const isStaff = ['owner', 'admin'].includes(msg.role);
          try { SoundNexus.play(isStaff ? CUES.NOTIFICATION : CUES.UI_CLICK); } catch(e){}
          if (!isOpen) setUnreadCount(c => c + 1);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id, isOpen, fetchHistory]);

  // 2️⃣ DYNAMIC AUTO-SCROLL
  useEffect(() => {
    if (isOpen && scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
      setUnreadCount(0);
    }
  }, [messages, isOpen]);

  // 3️⃣ TRANSMISSION HANDLER
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
        user_id: user?.id,
        display_name: user?.username || 'Unknown Agent',
        role: user?.role || 'guest',
        content,
        team_id: user?.teamId
      });

      if (error) throw error;
      
      Telemetry.log(EVENTS.ACTION, { action: 'CHAT_SENT' }, user?.id);
      SoundNexus.play(CUES.UI_CLICK);
    } catch (err) {
      setInputText(content); 
      SoundNexus.play(CUES.UI_ERROR);
      // toast.error("SIGNAL INTERRUPTED"); // Optional toast
    } finally {
      setIsSending(false);
    }
  };

  const getRoleIcon = (role) => {
    const r = String(role).toLowerCase();
    if (r === 'owner') return <Crown size={10} className="text-yellow-500" />;
    if (r === 'admin') return <Shield size={10} className="text-red-500" />;
    if (r === 'caster') return <Mic size={10} className="text-fuchsia-500" />;
    if (r === 'captain') return <Hash size={10} className="text-emerald-500" />;
    return null;
  };

  return (
    <AnimatePresence>
        {!isOpen ? (
            <motion.button 
              key="minimized"
              initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
              onClick={() => { setIsOpen(true); try{SoundNexus.play(CUES.NAVIGATION_SWISH);}catch(e){} }}
              className="fixed bottom-8 right-8 z-[200] flex items-center gap-4 bg-[#09090b]/80 backdrop-blur-xl border border-white/10 p-5 rounded-sm shadow-2xl hover:border-fuchsia-500/50 transition-all group"
            >
              <div className="relative">
                <MessageSquare className="text-fuchsia-500 w-6 h-6" />
                {unreadCount > 0 && (
                  <div className="absolute -top-3 -right-3 px-1.5 py-0.5 bg-red-600 text-white text-[8px] font-black rounded-sm shadow-lg animate-pulse border border-red-400">
                    {unreadCount} NEW
                  </div>
                )}
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 group-hover:text-white transition-colors hidden md:block">
                Nexus Comms
              </span>
            </motion.button>
        ) : (
            <motion.div 
              key="expanded"
              initial={{ opacity: 0, y: 50, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="fixed bottom-8 right-8 z-[200] w-[90vw] md:w-[400px] h-[600px] bg-[#09090b] border border-white/5 rounded-sm shadow-2xl flex flex-col overflow-hidden"
            >
              {/* SCANLINE OVERLAY */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,118,0.06))] bg-[length:100%_2px,3px_100%] z-20" />

              {/* HEADER */}
              <div className="p-5 bg-zinc-900/30 border-b border-white/5 flex justify-between items-center relative z-30">
                <div className="flex items-center gap-3">
                  <Zap size={14} className="text-fuchsia-500 animate-pulse" />
                  <h3 className="text-[10px] font-black text-white uppercase tracking-[0.5em]">Global Relay</h3>
                </div>
                <button 
                    onClick={() => { setIsOpen(false); try{SoundNexus.play(CUES.UI_CLICK);}catch(e){} }} 
                    className="p-2 hover:bg-white/5 rounded-sm text-zinc-600 hover:text-white transition-all"
                >
                  <Minimize2 size={18} />
                </button>
              </div>

              {/* MESSAGE VORTEX */}
              <div 
                ref={scrollRef} 
                className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-black/20 relative z-30"
              >
                {messages.map((msg) => {
                  const isMe = msg.user_id === user?.id;
                  const isStaff = ['owner', 'admin', 'caster'].includes(msg.role);

                  return (
                    <motion.div 
                        initial={{ opacity: 0, x: isMe ? 10 : -10 }} animate={{ opacity: 1, x: 0 }}
                        key={msg.id} 
                        className={cn("flex flex-col", isMe ? "items-end" : "items-start")}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {!isMe && getRoleIcon(msg.role)}
                        <span className={cn(
                            "text-[9px] font-black uppercase tracking-widest",
                            isStaff ? "text-fuchsia-500" : "text-zinc-500"
                        )}>
                          {msg.display_name}
                        </span>
                        <span className="text-[8px] text-zinc-800 font-mono italic">
                          {format(new Date(msg.created_at), 'HH:mm')}
                        </span>
                      </div>

                      <div className={cn(
                        "max-w-[85%] p-4 text-[11px] font-medium leading-relaxed border transition-all duration-300 rounded-sm",
                        isMe 
                          ? "bg-zinc-900 border-zinc-700 text-white rounded-tr-none" 
                          : "bg-black/40 border-white/5 text-zinc-400 rounded-tl-none"
                      )}>
                        {msg.content}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* INPUT MODULE */}
              <form onSubmit={handleSend} className="p-4 bg-zinc-900/50 border-t border-white/5 flex gap-3 items-center relative z-30">
                <div className="flex-1 relative group">
                   <input 
                     value={inputText}
                     onChange={(e) => setInputText(e.target.value)}
                     placeholder={isAuthenticated ? "Transmit message..." : "Uplink required to chat"}
                     disabled={!isAuthenticated || isSending}
                     className="w-full bg-black border border-zinc-800 rounded-sm px-4 py-3 text-xs text-white placeholder:text-zinc-800 focus:border-fuchsia-500 outline-none transition-all disabled:opacity-30 font-mono"
                   />
                </div>
                <button 
                  disabled={!inputText.trim() || isSending || !isAuthenticated}
                  className="p-3 bg-fuchsia-600 text-white rounded-sm hover:bg-fuchsia-500 disabled:opacity-20 transition-all active:scale-95 shadow-lg shadow-fuchsia-600/10"
                >
                  <Send size={18} />
                </button>
              </form>
            </motion.div>
        )}
    </AnimatePresence>
  );
};

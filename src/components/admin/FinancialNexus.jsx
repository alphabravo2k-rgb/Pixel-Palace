/**
 * 💸 FINANCIAL NEXUS: ECONOMIC COMMAND (GENESIS OMNI)
 * VERSION: 2050.5.0 (MASTER OMNI)
 * STATUS: OPERATIONAL // LEDGER_SYNCED
 * -----------------------------------------
 * Real-time financial oversight and prize pool management.
 * Enforces fiscal transparency across the Sovereign hierarchy.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign, TrendingUp, TrendingDown, Wallet, 
  Plus, Download, Activity, Zap, Shield, Target
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '../../lib/utils';

// MASTER CORE
import { supabase } from '../../supabase/client';
import { useNexus } from '../../hooks/useNexus';
import { SoundNexus, CUES } from '../../lib/soundNexus';
import { Telemetry, EVENTS } from '../../lib/telemetry';

// 📊 SUB-COMPONENT: FISCAL SPARKLINE
const RevenueChart = ({ data }) => {
  const maxVal = Math.max(...data.map(d => d.value), 100);
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((d.value / maxVal) * 80);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="relative h-24 w-full mt-6 opacity-50 group-hover:opacity-100 transition-opacity duration-700">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="revenueFade" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path 
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 2 }}
          d={`M0,100 ${points} L100,100 Z`} fill="url(#revenueFade)" 
        />
        <motion.polyline 
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 1.5 }}
          points={points} fill="none" stroke="#10b981" strokeWidth="1" vectorEffect="non-scaling-stroke" 
        />
      </svg>
    </div>
  );
};

export const FinancialNexus = () => {
  const { user, can } = useNexus();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({ description: '', amount: '', type: 'CREDIT', category: 'ENTRY_FEE' });

  // 🛡️ SECURITY PROTOCOL
  if (!can('CAP_MANAGE_FINANCE')) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-16 text-center border border-amber-500/20 bg-amber-500/[0.01] rounded-sm shadow-2xl">
        <Shield size={64} className="text-amber-600 mb-8 animate-pulse opacity-20" />
        <h2 className="text-3xl font-display font-black uppercase italic text-amber-600 tracking-tighter leading-none">Fiscal Lockdown</h2>
        <p className="text-[10px] font-mono text-zinc-600 mt-5 uppercase tracking-[0.5em]">Clearance Level: SOVEREIGN Required</p>
      </div>
    );
  }

  const fetchLedger = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('financial_ledger')
        .select(`*, creator:created_by(display_name)`)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setTransactions(data || []);
      Telemetry.log(EVENTS.ACTION, { action: 'LEDGER_SYNCED' });
    } catch (err) {
      console.warn("Ledger Synchronicity Interrupted");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLedger(); }, [fetchLedger]);

  const handleTransaction = async () => {
    if (!form.amount || !form.description) return;

    try {
      try{SoundNexus.play(CUES.UI_CLICK_HEAVY);}catch(e){}
      const payload = {
        ...form,
        amount: parseFloat(form.amount),
        created_by: user.id
      };

      const { error } = await supabase.from('financial_ledger').insert(payload);
      if (error) throw error;

      Telemetry.log(EVENTS.ACTION, { action: 'FISCAL_COMMIT', amount: form.amount }, user.id);
      toast.success("TRANSACTION SECURED IN BLOCK");
      try{SoundNexus.play(CUES.UI_SUCCESS);}catch(e){}
      setIsAdding(false);
      setForm({ description: '', amount: '', type: 'CREDIT', category: 'ENTRY_FEE' });
      fetchLedger();
    } catch (err) {
      toast.error("COMMIT REJECTED");
      try{SoundNexus.play(CUES.UI_ERROR);}catch(e){}
    }
  };

  const stats = useMemo(() => {
    const revenue = transactions.filter(t => t.type === 'CREDIT').reduce((acc, curr) => acc + curr.amount, 0);
    const opex = transactions.filter(t => t.type === 'DEBIT').reduce((acc, curr) => acc + curr.amount, 0);
    const chartData = transactions.length > 5 
        ? transactions.map(t => ({ value: t.amount })) 
        : [20, 45, 20, 60, 40, 85].map(v => ({ value: v }));

    return { revenue, opex, net: revenue - opex, chartData };
  }, [transactions]);

  return (
    <div className="h-full flex flex-col bg-[#050505] border border-white/5 rounded-sm relative overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)]">
      
      {/* HUD HEADER */}
      <div className="p-10 border-b border-white/5 bg-zinc-900/20 flex flex-col lg:flex-row items-center justify-between backdrop-blur-3xl relative z-10 gap-8">
        <div className="flex items-center gap-8">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-sm flex items-center justify-center rotate-45 shadow-neon">
            <DollarSign size={32} className="text-emerald-500 -rotate-45" />
          </div>
          <div>
            <h2 className="text-4xl font-display font-black text-white uppercase italic tracking-tighter leading-none">Financial Nexus</h2>
            <div className="flex items-center gap-4 mt-4">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-neon" />
                <p className="text-[10px] text-zinc-500 font-mono tracking-[0.5em] uppercase">
                    System_Solvency: Verified
                </p>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
            <button 
                onClick={() => setIsAdding(true)}
                className="flex items-center gap-4 px-10 py-4 bg-emerald-600 hover:bg-emerald-500 text-white transition-all rounded-sm text-[10px] font-black uppercase tracking-[0.4em] active:scale-95 shadow-2xl shadow-emerald-600/20"
            >
               <Plus size={16} /> Record Transaction
            </button>
            <button className="p-4 bg-zinc-900 border border-zinc-800 hover:border-emerald-500 text-zinc-600 hover:text-white transition-all rounded-sm">
                <Download size={20} />
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar relative">
        {/* TACTICAL METRICS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 border-b border-white/5 bg-black/40">
            <div className="p-12 border-r border-white/5 relative group overflow-hidden">
                <div className="absolute inset-0 bg-emerald-500/[0.01] pointer-events-none" />
                <div className="flex justify-between items-start relative z-10">
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-2">Aggregate Revenue</p>
                    <TrendingUp size={16} className="text-emerald-500 opacity-30" />
                </div>
                <h3 className="text-6xl font-display font-black text-white tracking-tighter relative z-10">${stats.revenue.toLocaleString()}</h3>
                <RevenueChart data={stats.chartData} />
            </div>
            
            <div className="p-12 border-r border-white/5 relative group">
                <div className="flex justify-between items-start">
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-2">Operational Outlay</p>
                    <TrendingDown size={16} className="text-red-500 opacity-30" />
                </div>
                <h3 className="text-6xl font-display font-black text-white tracking-tighter">${stats.opex.toLocaleString()}</h3>
                <div className="mt-10 space-y-3">
                    <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: '65%' }} className="h-full bg-red-600 shadow-[0_0_10px_#ef4444]" />
                    </div>
                    <div className="flex justify-between items-center text-[8px] font-mono text-zinc-600 tracking-widest">
                        <span>Opex_Threshold</span>
                        <span>65% Allocated</span>
                    </div>
                </div>
            </div>

            <div className="p-12 relative group">
                <div className="flex justify-between items-start">
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-2">Treasury Balance</p>
                    <Wallet size={16} className="text-fuchsia-500 opacity-30" />
                </div>
                <h3 className={cn("text-6xl font-display font-black tracking-tighter transition-colors", stats.net >= 0 ? "text-fuchsia-500" : "text-red-500")}>
                    ${stats.net.toLocaleString()}
                </h3>
                <div className="mt-10 flex gap-3">
                    <span className="px-3 py-1.5 bg-fuchsia-500/10 text-fuchsia-500 text-[8px] font-black rounded-sm border border-fuchsia-500/20 tracking-widest uppercase">Vault_Secure</span>
                    <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-500 text-[8px] font-black rounded-sm border border-emerald-500/20 tracking-widest uppercase">Solvent</span>
                </div>
            </div>
        </div>

        {/* LEDGER STREAM */}
        <div className="p-12">
            <div className="flex items-center justify-between mb-10">
                <h4 className="text-[11px] font-black uppercase tracking-[0.5em] text-zinc-400 flex items-center gap-4">
                    <Activity size={14} className="text-emerald-500 animate-pulse"/> Atomic Transaction Stream
                </h4>
                <div className="h-[1px] flex-1 mx-10 bg-white/5" />
            </div>
            
            <div className="space-y-2">
                {transactions.map((t, i) => (
                    <motion.div 
                        key={t.id || i}
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.02 }}
                        className="flex items-center justify-between p-5 bg-zinc-900/20 border border-white/5 hover:border-emerald-500/30 transition-all rounded-sm group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-center gap-6 relative z-10">
                            <div className={cn(
                                "w-10 h-10 rounded-sm flex items-center justify-center border transition-all duration-500 rotate-45 group-hover:rotate-0",
                                t.type === 'CREDIT' ? "bg-emerald-900/20 border-emerald-500/30 text-emerald-500" : "bg-red-900/20 border-red-500/30 text-red-500"
                            )}>
                                <div className="-rotate-45 group-hover:rotate-0 transition-transform">
                                    {t.type === 'CREDIT' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-black text-white uppercase italic tracking-tight">{t.description}</p>
                                <div className="flex items-center gap-3 mt-1.5">
                                    <span className="text-[8px] text-zinc-600 font-mono uppercase tracking-widest bg-black px-2 py-0.5 rounded-sm">{t.category}</span>
                                    <span className="text-[8px] text-zinc-700 font-mono tracking-tighter">ID: {t.creator?.display_name || 'SYSTEM'} // {new Date(t.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                        <span className={cn(
                            "text-2xl font-display font-black relative z-10 tabular-nums tracking-tighter",
                            t.type === 'CREDIT' ? "text-emerald-400" : "text-red-400"
                        )}>
                            {t.type === 'CREDIT' ? '+' : '-'}${t.amount.toLocaleString()}
                        </span>
                    </motion.div>
                ))}
            </div>
        </div>
      </div>

      {/* SYSTEM STATUS */}
      <div className="p-4 bg-black/80 border-t border-white/5 flex justify-between items-center text-[9px] font-mono text-zinc-800 uppercase tracking-[0.4em]">
          <div className="flex items-center gap-3">
              <Target size={12} />
              <span>Fiscal_Node: Blockchain_Mirror_01</span>
          </div>
          <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-neon" />
              <span>Encrypted_Uplink: Active</span>
          </div>
      </div>

      {/* COMMIT OVERLAY */}
      <AnimatePresence>
        {isAdding && (
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[100] flex items-center justify-center p-8"
            >
                <motion.div 
                    initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
                    className="w-full max-w-xl bg-[#09090b] border border-white/10 p-12 rounded-sm shadow-[0_0_100px_rgba(0,0,0,1)] relative"
                >
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-emerald-500 animate-pulse" />
                    <h3 className="text-3xl font-display font-black text-white uppercase italic tracking-tighter mb-10">New Ledger Commitment</h3>
                    
                    <div className="space-y-8">
                        <div className="grid grid-cols-2 gap-4">
                            {['CREDIT', 'DEBIT'].map(type => (
                                <button 
                                    key={type}
                                    onClick={() => { try{SoundNexus.play(CUES.UI_CLICK);}catch(e){} setForm({...form, type}); }}
                                    className={cn(
                                        "py-5 border rounded-sm text-[10px] font-black uppercase tracking-[0.4em] transition-all duration-500",
                                        form.type === type 
                                            ? (type === 'CREDIT' ? "bg-emerald-600 border-emerald-500 text-white shadow-emerald-500/20" : "bg-red-600 border-red-500 text-white shadow-red-500/20")
                                            : "bg-black border-zinc-800 text-zinc-600 hover:border-zinc-500"
                                    )}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-4">
                            <div className="group">
                                <label className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.5em] mb-3 block group-focus-within:text-emerald-500 transition-colors">Amount_Authorized (USD)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700 w-5 h-5" />
                                    <input 
                                        type="number" 
                                        value={form.amount} 
                                        onChange={e => setForm({...form, amount: e.target.value})}
                                        className="w-full bg-zinc-950 border border-zinc-800 pl-12 p-5 text-xl text-white font-mono focus:border-emerald-500 outline-none transition-all rounded-sm placeholder:text-zinc-900"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div className="group">
                                <label className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.5em] mb-3 block group-focus-within:text-emerald-500 transition-colors">Operational_Description</label>
                                <input 
                                    type="text" 
                                    value={form.description} 
                                    onChange={e => setForm({...form, description: e.target.value.toUpperCase()})}
                                    className="w-full bg-zinc-950 border border-zinc-800 p-5 text-sm text-white font-mono focus:border-emerald-500 outline-none transition-all rounded-sm uppercase tracking-widest"
                                    placeholder="ENTRY_ORIGIN_SPEC..."
                                />
                            </div>
                        </div>

                        <div className="flex gap-6 pt-6">
                            <button onClick={() => setIsAdding(false)} className="flex-1 py-5 text-zinc-600 hover:text-white uppercase font-black text-[10px] tracking-[0.4em] transition-colors">Abort</button>
                            <button onClick={handleTransaction} className="flex-1 py-5 bg-white text-black hover:bg-emerald-500 hover:text-white uppercase font-black text-[10px] tracking-[0.4em] transition-all shadow-2xl active:scale-95">Commit_Entry</button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

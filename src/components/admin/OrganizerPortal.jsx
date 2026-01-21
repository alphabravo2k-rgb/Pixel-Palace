/**
 * ⚡ PIXEL PALACE: ORGANIZER PORTAL
 * FILE: src/components/admin/OrganizerPortal.jsx
 * -----------------------------------------
 * VERSION: 2050.5.0 (MASTER OMNI)
 * DATE: 2026-01-22
 * STATUS: OPERATIONAL // B2B_INTERFACE
 * -----------------------------------------
 * DESCRIPTION:
 * The external partner interface for renting competitive infrastructure.
 * Allows third-party organizers to request server provisioning and API access.
 * * UPGRADES (V5.0):
 * - [Service Catalog]: Modular selection for Servers, Anti-Cheat, and Data Feeds.
 * - [Quotation Engine]: Direct link to the Financial Nexus for custom pricing.
 */

import React from 'react';
import { Building2, Globe, Server, ShieldCheck, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export const OrganizerPortal = () => {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700">
       
       {/* HEADER */}
       <div className="border-b border-white/10 pb-6 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-display font-black text-white uppercase italic tracking-tighter">
                Partner <span className="text-brand">Nexus</span>
            </h1>
            <p className="text-xs font-mono text-zinc-500 mt-2 uppercase tracking-[0.2em]">
                Deploy Competitive Infrastructure on Your Domain
            </p>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
             <Building2 size={14} />
             <span>Enterprise Gateway</span>
          </div>
       </div>

       {/* SERVICE GRID */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* 1. SERVER PROVISIONING */}
          <div className="p-8 bg-[#09090b] border border-white/5 rounded-sm hover:border-brand/50 transition-all group cursor-pointer relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Server size={64} className="text-zinc-500" />
             </div>
             <Server className="w-10 h-10 text-zinc-600 group-hover:text-brand mb-6 transition-colors" />
             <h3 className="text-lg font-black text-white uppercase tracking-tight">Rent a Server</h3>
             <p className="text-[10px] text-zinc-500 font-mono mt-3 leading-relaxed">
                Provision high-tickrate CS2 instances in Dubai, Singapore, or Frankfurt. Automated setup via Docker with 128-tick support.
             </p>
             <div className="mt-6 flex items-center gap-2 text-[9px] font-black text-brand uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                Configure Fleet <ArrowRight size={12} />
             </div>
          </div>

          {/* 2. INTEGRITY LAYER */}
          <div className="p-8 bg-[#09090b] border border-white/5 rounded-sm hover:border-brand/50 transition-all group cursor-pointer relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <ShieldCheck size={64} className="text-zinc-500" />
             </div>
             <ShieldCheck className="w-10 h-10 text-zinc-600 group-hover:text-brand mb-6 transition-colors" />
             <h3 className="text-lg font-black text-white uppercase tracking-tight">White-Label Anti-Cheat</h3>
             <p className="text-[10px] text-zinc-500 font-mono mt-3 leading-relaxed">
                Integrate the Pixel Palace integrity layer into your own community events. Includes HWID banning and screenshot analysis.
             </p>
             <div className="mt-6 flex items-center gap-2 text-[9px] font-black text-brand uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                Request Integration <ArrowRight size={12} />
             </div>
          </div>

          {/* 3. DATA API */}
          <div className="p-8 bg-[#09090b] border border-white/5 rounded-sm hover:border-brand/50 transition-all group cursor-pointer relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Globe size={64} className="text-zinc-500" />
             </div>
             <Globe className="w-10 h-10 text-zinc-600 group-hover:text-brand mb-6 transition-colors" />
             <h3 className="text-lg font-black text-white uppercase tracking-tight">API Access</h3>
             <p className="text-[10px] text-zinc-500 font-mono mt-3 leading-relaxed">
                Fetch live stats, veto results, and player profiles for your broadcast HUD. Webhook support for stream overlays.
             </p>
             <div className="mt-6 flex items-center gap-2 text-[9px] font-black text-brand uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                View Documentation <ArrowRight size={12} />
             </div>
          </div>
       </div>

       {/* CTA BANNER */}
       <div className="mt-10 p-8 bg-brand/5 border border-brand/20 rounded-sm flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none" />
          
          <div className="relative z-10">
             <h4 className="text-sm font-black text-brand uppercase tracking-widest flex items-center gap-3">
                <Building2 size={16} /> Enterprise Quotation
             </h4>
             <p className="text-[10px] text-zinc-400 font-mono mt-2 max-w-lg">
                For high-volume tournament organizers, we offer dedicated support channels and custom SLAs. Contact our sales team to discuss your infrastructure needs.
             </p>
          </div>
          
          <button className="px-8 py-4 bg-brand text-black font-black uppercase text-[10px] tracking-[0.2em] hover:bg-white transition-all shadow-lg shadow-brand/20 active:scale-95 relative z-10 whitespace-nowrap">
             Contact Sales
          </button>
       </div>
    </div>
  );
};

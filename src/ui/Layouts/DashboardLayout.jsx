/**
 * 🛰️ DASHBOARD LAYOUT: COMMAND INTERFACE
 * VERSION: 2050.5.0 (MASTER OMNI)
 * STATUS: OPERATIONAL // ROLE-AWARE
 */

import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Trophy, Users, Shield, 
  LogOut, Settings, BarChart3, Radio, HardDrive 
} from 'lucide-react';
import { CyberOverlay } from '../CyberOverlay';
import { RoleGuard } from '../RoleGuard';
import { cn } from '../../lib/utils';

// ⚠️ SYSTEM LINKS: Ensure these exist in the Logic Layer
import { ROLE_DEF } from '../../lib/roles';
import { useNexusStore } from '../../store/useNexusStore';
import { SoundNexus, CUES } from '../../lib/soundNexus';

const SidebarItem = ({ to, icon: Icon, label, badge }) => (
  <NavLink 
    to={to} 
    onClick={() => { try { SoundNexus.playSpatial(CUES.NAVIGATION_SWISH); } catch(e){} }}
    className={({ isActive }) => cn(
      "flex items-center justify-between p-3 rounded-sm transition-all duration-300 group relative overflow-hidden",
      isActive 
        ? "bg-brand/10 text-white border-r-2 border-brand shadow-[inset_-10px_0_20px_-10px_rgba(192,38,211,0.3)]" 
        : "text-zinc-500 hover:text-white hover:bg-white/5"
    )}
  >
    <div className="flex items-center gap-3 z-10">
      <Icon size={18} className="group-hover:text-brand-glow transition-colors" />
      <span className="font-display uppercase tracking-[0.15em] text-xs font-bold">{label}</span>
    </div>
    
    {badge && (
      <span className="z-10 bg-brand/20 text-brand-glow text-[8px] px-1.5 py-0.5 rounded-full border border-brand/30 animate-pulse">
        {badge}
      </span>
    )}

    {/* Kinetic Background Shutter */}
    <div className="absolute inset-0 bg-gradient-to-r from-brand/10 to-transparent translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 ease-out" />
  </NavLink>
);

export const DashboardLayout = () => {
  const { profile, logout } = useNexusStore();

  const handleLogout = async () => {
    try { SoundNexus.playSpatial(CUES.UI_ERROR); } catch(e){}
    await logout();
  };

  return (
    <div className="flex h-screen w-full bg-bg overflow-hidden relative selection:bg-brand/30">
      {/* 🌌 ATMOSPHERIC LAYER */}
      <CyberOverlay intensity="normal" />
      
      {/* 1. SIDEBAR (THE BONE STRUCTURE) */}
      <aside className="w-72 glass-hard border-r border-white/5 flex flex-col z-30 hidden lg:flex relative">
        {/* TOP BRANDING */}
        <div className="p-8 border-b border-white/5 bg-white/[0.01]">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-brand shadow-neon" />
            <h1 className="text-2xl font-display font-black italic tracking-tighter text-white">
              NEXUS<span className="text-brand-glow">OS</span>
            </h1>
          </div>
          <p className="text-[8px] text-zinc-600 font-mono mt-2 tracking-[0.4em] uppercase">
            Sovereign Command v5.0
          </p>
        </div>
        
        {/* SCROLLABLE NAV */}
        <nav className="flex-1 p-6 space-y-1.5 overflow-y-auto custom-scrollbar">
          <div className="text-[9px] text-zinc-700 font-black uppercase tracking-[0.3em] mb-4 ml-2">Main Navigation</div>
          
          <SidebarItem to="/dashboard" icon={LayoutDashboard} label="Command Center" />
          <SidebarItem to="/matches" icon={Radio} label="Live Matches" badge="LIVE" />
          <SidebarItem to="/tournaments" icon={Trophy} label="Operations" />
          <SidebarItem to="/rankings" icon={BarChart3} label="Global Leaderboard" />
          
          <div className="pt-8 mb-4 border-t border-white/5">
              <div className="text-[9px] text-zinc-700 font-black uppercase tracking-[0.3em] mb-4 ml-2">Personal Nexus</div>
          </div>
          
          <SidebarItem to="/profile" icon={Users} label="My Dossier" />
          <SidebarItem to="/settings" icon={Settings} label="System Config" />

          {/* 🛡️ EXECUTIVE CONTROLS (Only visible to Managers/Admins/Owners) */}
          {/* Note: Ensure ROLE_DEF.MANAGER exists in your roles library, or switch to 'ADMIN' */}
          <RoleGuard minLevel={80}> 
            <div className="pt-8 mb-4 border-t border-white/5">
               <div className="text-[9px] text-red-900/60 font-black uppercase tracking-[0.3em] mb-4 ml-2">High Command</div>
            </div>
            <SidebarItem to="/admin/staff" icon={Shield} label="Staff Allotment" />
            <SidebarItem to="/admin/terminal" icon={HardDrive} label="Root Terminal" />
          </RoleGuard>
        </nav>

        {/* BOTTOM USER PANEL */}
        <div className="p-6 border-t border-white/5 bg-black/20">
          <button 
             onClick={handleLogout}
             className="flex items-center justify-between w-full p-3 group border border-transparent hover:border-red-900/30 hover:bg-red-950/10 transition-all duration-300 rounded-sm"
          >
            <div className="flex items-center gap-3">
              <LogOut size={16} className="text-zinc-600 group-hover:text-red-500 transition-colors" />
              <span className="font-display font-bold uppercase tracking-widest text-xs text-zinc-500 group-hover:text-red-400">Jack Out</span>
            </div>
            <div className="w-1 h-1 bg-zinc-800 rounded-full group-hover:bg-red-500 group-hover:animate-ping" />
          </button>
        </div>
      </aside>

      {/* 2. MAIN VIEWPORT (Spatial Rendering Area) */}
      <main className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
        <div className="perspective-container min-h-full p-6 lg:p-12">
           {/* Dynamic Page Content Injected Here */}
           <Outlet /> 
        </div>
      </main>
    </div>
  );
};

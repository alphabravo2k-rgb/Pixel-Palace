import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Trophy, Users, Shield, LogOut } from 'lucide-react';
import { CyberOverlay } from '../CyberOverlay';
import { cn } from '../../lib/utils';
// import { useAuth } from '../../lib/auth'; // Uncomment when auth hook is ready

const SidebarItem = ({ to, icon: Icon, label }) => (
  <NavLink 
    to={to} 
    className={({ isActive }) => cn(
      "flex items-center gap-3 p-3 rounded-sm transition-all duration-300 group relative overflow-hidden",
      isActive ? "bg-brand/10 text-white border-r-2 border-brand" : "text-zinc-500 hover:text-white hover:bg-white/5"
    )}
  >
    <Icon size={18} className="group-hover:text-brand transition-colors" />
    <span className="font-display uppercase tracking-wider text-sm">{label}</span>
    {/* Hover Glow */}
    <div className="absolute inset-0 bg-brand/5 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300" />
  </NavLink>
);

export const DashboardLayout = () => {
  // const { signOut } = useAuth(); 

  return (
    <div className="flex h-screen w-full bg-bg overflow-hidden relative">
      <CyberOverlay />
      
      {/* 1. SIDEBAR (The Navigation Console) */}
      <aside className="w-64 glass-hard border-r border-white/5 flex flex-col z-20 hidden md:flex">
        <div className="p-6 border-b border-white/5">
          <h1 className="text-2xl font-display font-black italic tracking-tighter">
            NEXUS<span className="text-brand">cmd</span>
          </h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <SidebarItem to="/dashboard" icon={LayoutDashboard} label="Command Center" />
          <SidebarItem to="/tournaments" icon={Trophy} label="Tournaments" />
          <SidebarItem to="/teams" icon={Users} label="My Team" />
          <SidebarItem to="/matches" icon={Shield} label="Active Matches" />
        </nav>

        <div className="p-4 border-t border-white/5">
          <button 
             // onClick={signOut}
             className="flex items-center gap-3 p-3 text-red-500 hover:text-red-400 hover:bg-red-950/20 w-full rounded-sm transition-all uppercase font-display tracking-wider text-sm"
          >
            <LogOut size={18} />
            <span>Jack Out</span>
          </button>
        </div>
      </aside>

      {/* 2. MAIN VIEWPORT */}
      <main className="flex-1 overflow-y-auto custom-scrollbar relative z-10 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
           {/* Header / Breadcrumbs could go here */}
           <Outlet /> 
        </div>
      </main>
    </div>
  );
};

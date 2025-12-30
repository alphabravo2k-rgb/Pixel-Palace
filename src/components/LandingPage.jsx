import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Tv, Trophy, Check, AlertTriangle, Map, Leaf, Sun, Flame, Building2, Radiation, Gauge, TrainFront } from 'lucide-react';
import { useSession } from '../auth/useSession';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { session } = useSession();
  const [timeLeft, setTimeLeft] = useState('LOADING...');
  const [isRegistrationClosed, setIsRegistrationClosed] = useState(false);

  // 🕒 COUNTDOWN LOGIC
  useEffect(() => {
    const deadlineDate = new Date('2026-01-09T00:00:00Z').getTime();
    
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = deadlineDate - now;

      if (difference < 0) {
        setTimeLeft('REGISTRATION OFFLINE');
        setIsRegistrationClosed(true);
        clearInterval(timer);
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`${days}D ${String(hours).padStart(2,'0')}H ${String(minutes).padStart(2,'0')}M`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleEnter = () => {
    if (session?.isAuthenticated) {
        navigate('/admin/dashboard');
    } else {
        navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 font-sans selection:bg-fuchsia-500/30 overflow-x-hidden relative">
      
      {/* 1. DYNAMIC BACKGROUND */}
      <div className="fixed inset-0 z-0">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-color-violet-900)_0%,_transparent_70%)] opacity-20 animate-pulse"></div>
         <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,18,0.85),rgba(0,0,0,0.98)),url('https://www.transparenttextures.com/patterns/cubes.png')] bg-cover bg-fixed"></div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-16 flex flex-col items-center">

        {/* HEADER */}
        <header className="text-center mb-16 flex flex-col items-center">
            <img src="https://raw.githubusercontent.com/alphabravo2k-rgb/pixel-palace-registration/1a7d90c43796fd037316bdaf4f3b4de9a485d615/image_4379f9.png" 
                 alt="Pixel Palace Logo" 
                 className="w-40 h-40 md:w-64 md:h-64 object-contain mb-8 hover:scale-105 transition-transform duration-500 drop-shadow-[0_0_25px_rgba(168,85,247,0.5)]" />
            
            <h1 className="text-6xl md:text-9xl font-black text-white italic tracking-tighter leading-none drop-shadow-[0_0_15px_rgba(192,38,211,0.5)]">
                COMMUNITY <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-pink-500 to-purple-600">CUP</span>
            </h1>
            
            <div className="flex items-center gap-4 mt-4 mb-8">
                <div className="h-[1px] w-12 bg-zinc-600"></div>
                <p className="text-xl md:text-3xl text-zinc-300 font-['Teko'] tracking-[0.3em] uppercase">January 09 • 2026</p>
                <div className="h-[1px] w-12 bg-zinc-600"></div>
            </div>

            {/* STATS GRID */}
            <div className="w-full max-w-5xl mx-auto p-[1px] bg-gradient-to-r from-transparent via-zinc-700 to-transparent">
                <div className="grid grid-cols-2 md:grid-cols-4 bg-black/80 backdrop-blur-md divide-x divide-zinc-800 border-b border-zinc-800 md:border-b-0">
                    <StatBox label="Prize Pool" value="$4,000 USD" color="text-yellow-400" />
                    <StatBox label="Live Slots" value="20 OPEN" color="text-fuchsia-400" />
                    <StatBox label="Format" value="5v5 BO5" color="text-cyan-400" />
                    <StatBox label="Requirement" value="Discord Member" color="text-green-400" size="text-sm" />
                </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                <button 
                  onClick={handleEnter}
                  className="px-8 py-3 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold text-lg uppercase tracking-wider rounded transition-all shadow-lg shadow-fuchsia-900/20"
                >
                  Enter System
                </button>
                <a href="https://discord.gg/JdXheQbvec" target="_blank" className="px-8 py-3 border border-purple-500/50 text-purple-300 hover:bg-purple-500/10 font-bold text-lg uppercase tracking-wider flex items-center justify-center gap-2 transition-all">
                    <MessageCircle className="w-5 h-5" /> Join Discord
                </a>
            </div>
        </header>

        {/* INFO PANELS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
            
            {/* LEFT COLUMN */}
            <div className="space-y-6">
                <HudPanel title="TOURNAMENT INTEL" icon={<Trophy className="w-5 h-5 text-cyan-400" />}>
                     <div className="space-y-4">
                        <div>
                            <p className="text-[10px] uppercase text-zinc-500 font-bold tracking-widest">Operation Start</p>
                            <p className="text-xl font-bold text-white">January 09, 2026</p>
                            <p className="text-xs text-zinc-400">Brackets released on Discord.</p>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase text-zinc-500 font-bold tracking-widest">Registration Cutoff</p>
                            <p className="text-xl font-bold text-white">Dec 31, 2025 <span className="text-sm font-normal text-zinc-500">(23:59 CET)</span></p>
                        </div>
                     </div>
                </HudPanel>

                <div className="bg-black/40 border-l-4 border-fuchsia-500 p-6 backdrop-blur-md border-y border-r border-white/5">
                    <p className="text-center text-xs uppercase tracking-widest text-fuchsia-400 mb-1">Time Remaining</p>
                    <p className="text-4xl font-['Teko'] text-white text-center drop-shadow-[0_0_10px_rgba(232,121,249,0.5)]">{timeLeft}</p>
                </div>

                <HudPanel title="MANDATORY PROTOCOLS" icon={<AlertTriangle className="w-5 h-5 text-red-400" />}>
                    <ul className="text-sm space-y-3 text-zinc-300">
                        <li className="flex gap-2"><Check className="w-4 h-4 text-green-500" /> <span><strong>Akros Anti-Cheat</strong> required.</span></li>
                        <li className="flex gap-2"><AlertTriangle className="w-4 h-4 text-yellow-500" /> <span>Admins reserve right to DQ.</span></li>
                    </ul>
                    <a href="https://akros.ac/#downloadSteps" target="_blank" className="mt-4 block w-full py-2 bg-red-900/30 border border-red-500/30 hover:bg-red-500/20 text-center text-red-300 text-sm font-bold uppercase tracking-wider transition-colors">
                        Get Akros Client
                    </a>
                </HudPanel>
            </div>

            {/* MIDDLE: MAP POOL */}
            <div className="lg:col-span-2">
                 <HudPanel title="ACTIVE DUTY POOL" icon={<Map className="w-5 h-5 text-zinc-400" />}>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <MapCard name="Ancient" icon={<Leaf className="text-green-400" />} color="border-green-500/30" />
                        <MapCard name="Dust 2" icon={<Sun className="text-yellow-400" />} color="border-yellow-500/30" />
                        <MapCard name="Inferno" icon={<Flame className="text-red-500" />} color="border-red-500/30" />
                        <MapCard name="Mirage" icon={<Building2 className="text-amber-400" />} color="border-amber-500/30" />
                        <MapCard name="Nuke" icon={<Radiation className="text-sky-400" />} color="border-sky-500/30" />
                        <MapCard name="Overpass" icon={<Gauge className="text-gray-400" />} color="border-gray-500/30" />
                        <MapCard name="Train" icon={<TrainFront className="text-zinc-300" />} color="border-zinc-500/30" className="col-span-2" />
                    </div>
                 </HudPanel>
                 
                 <div className="mt-6 p-8 bg-zinc-900/50 border border-white/10 text-center rounded-lg">
                    <p className="text-zinc-500 font-mono text-sm mb-4">READY TO DEPLOY?</p>
                    <a href="registration.html" className="inline-block px-8 py-4 bg-white text-black font-black uppercase tracking-widest hover:bg-zinc-200 transition-colors">
                        Access Registration Terminal
                    </a>
                 </div>
            </div>

        </div>

      </div>
    </div>
  );
};

// UI SUB-COMPONENTS
const StatBox = ({ label, value, color, size = "text-3xl" }) => (
  <div className="p-4 text-center group cursor-default">
    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">{label}</p>
    <p className={`${size} ${color} font-['Teko'] drop-shadow-md group-hover:scale-105 transition-transform`}>{value}</p>
  </div>
);

const HudPanel = ({ title, icon, children }) => (
  <div className="bg-zinc-900/80 backdrop-blur-md border border-white/5 p-6 relative overflow-hidden group hover:border-fuchsia-500/30 transition-colors">
     <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-fuchsia-600 to-purple-600 opacity-50"></div>
     <h3 className="text-xl font-['Teko'] text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
        {icon} {title}
     </h3>
     {children}
  </div>
);

const MapCard = ({ name, icon, color, className = "" }) => (
  <div className={`p-4 border ${color} bg-black/40 flex flex-col items-center justify-center gap-2 hover:bg-white/5 transition-colors cursor-default ${className}`}>
     {React.cloneElement(icon, { className: `w-6 h-6 ${icon.props.className}` })}
     <span className="text-sm font-bold uppercase tracking-wider font-['Teko'] text-white">{name}</span>
  </div>
);

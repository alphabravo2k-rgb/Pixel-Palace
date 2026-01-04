import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../auth/useSession';
import { Shield, ChevronRight, Loader2, Terminal, Wifi } from 'lucide-react';
import { BRAND } from '../lib/identity';
import { ROLES } from '../lib/roles';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { session } = useSession();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleEnter = async () => {
    if (isConnecting) return; // Prevent double clicks
    setIsConnecting(true);

    // 1. Artificial "System Boot" Delay (1s) for cinematic feel
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 2. Intelligent Routing based on Role
    if (session?.isAuthenticated) {
      // Check for Staff Roles (Owner, Admin, Crew)
      const staffRoles = [ROLES.OWNER, ROLES.ADMIN, ROLES.CREW];
      
      if (staffRoles.includes(session.role)) {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard'); // Player/Captain Dashboard
      }
    } else {
      navigate('/login');
    }
    // Note: No need to set isConnecting(false) as we unmount here
  };

  return (
    <div className="relative min-h-screen w-full bg-bg overflow-hidden flex flex-col items-center justify-center selection:bg-brand/30 font-sans text-white">
      
      {/* 1. ATMOSPHERE LAYER */}
      <div className="scanlines"></div>
      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000_120%)] z-10 pointer-events-none"></div>
      {/* Texture */}
      <div className="absolute inset-0 opacity-[0.03] z-0 pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
      
      {/* Glow Orbs (GPU Accelerated) */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand/20 rounded-full blur-[128px] animate-pulse z-0 will-change-transform"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-glow/10 rounded-full blur-[128px] animate-pulse z-0 will-change-transform" style={{ animationDelay: '1s' }}></div>

      {/* 2. CENTERPIECE UI */}
      <div className="relative z-50 flex flex-col items-center">
        
        {/* Floating Logo */}
        <div className="relative group cursor-default mb-10">
          <div className="absolute inset-0 bg-brand/30 rounded-full blur-3xl opacity-20 group-hover:opacity-50 transition-opacity duration-1000"></div>
          <img 
              src={BRAND.logo} 
              alt={BRAND.name} 
              className="relative w-40 h-40 md:w-56 md:h-56 object-contain drop-shadow-2xl transition-transform duration-700 group-hover:scale-105 animate-breathe"
          />
        </div>

        {/* Glitch Typography */}
        <div className="text-center relative select-none">
          <h1 className="text-6xl md:text-9xl font-black text-white italic tracking-tighter leading-none font-display uppercase glitch-wrapper" data-text="PIXEL PALACE">
              PIXEL <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-glow">PALACE</span>
          </h1>
          
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="h-px w-12 bg-zinc-800"></div>
            <p className="text-zinc-500 font-mono text-xs tracking-[0.4em] uppercase">
                {BRAND.tagline || "COMPETITIVE OS"} // {BRAND.version}
            </p>
            <div className="h-px w-12 bg-zinc-800"></div>
          </div>
        </div>

        {/* Initialize Button */}
        <div className="mt-16 w-full max-w-xs relative group">
          {/* Button Glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-brand to-brand-glow rounded blur opacity-20 group-hover:opacity-60 transition duration-500"></div>
          
          <button 
              onClick={handleEnter}
              disabled={isConnecting}
              className="relative w-full py-4 bg-white text-black font-black text-lg uppercase tracking-widest hover:bg-zinc-100 transition-all duration-100 flex items-center justify-center gap-3 disabled:opacity-80 disabled:cursor-wait hover:scale-[1.02] active:scale-[0.98]"
              style={{ clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)' }}
          >
              {isConnecting ? (
                  <>
                      <Loader2 className="w-5 h-5 animate-spin text-brand" />
                      <span className="animate-pulse">Connecting...</span>
                  </>
              ) : (
                  <>
                      <span>Initialize</span> 
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-brand" />
                  </>
              )}
          </button>
        </div>

        {/* Footer Status */}
        <div className="mt-12 flex items-center gap-8 text-[10px] text-zinc-600 font-mono uppercase tracking-wider">
          <span className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full animate-pulse shadow-[0_0_5px_currentColor] ${session?.isAuthenticated ? 'bg-emerald-500 text-emerald-500' : 'bg-amber-500 text-amber-500'}`}></div>
              {session?.isAuthenticated ? 'System Online' : 'Guest Access'}
          </span>
          <span className="flex items-center gap-2">
              <Terminal size={12} />
              Secure V3.0
          </span>
          <span className="flex items-center gap-2">
              <Wifi size={12} />
              12ms
          </span>
        </div>

      </div>
    </div>
  );
};

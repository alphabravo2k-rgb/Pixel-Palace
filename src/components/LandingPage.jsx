import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../auth/useSession';
import { Shield, ChevronRight } from 'lucide-react';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { session } = useSession();

  const handleEnter = () => {
    if (session?.isAuthenticated) {
        navigate('/admin/dashboard');
    } else {
        navigate('/login');
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#050505] overflow-hidden flex flex-col items-center justify-center selection:bg-fuchsia-500/30">
      
      {/* 1. ATMOSPHERE (The "Vibe") */}
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
      
      {/* Ambient Glows (Your Color Scheme) */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-900/20 rounded-full blur-[128px] animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-900/20 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: '1s' }}></div>

      {/* 2. THE BRAND (Centerpiece) */}
      <div className="relative z-10 flex flex-col items-center">
        
        {/* Logo Container with Neon Backlight */}
        <div className="relative group cursor-default">
            <div className="absolute inset-0 bg-gradient-to-tr from-fuchsia-600 to-purple-600 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000"></div>
            <img 
                src="https://raw.githubusercontent.com/alphabravo2k-rgb/pixel-palace-registration/1a7d90c43796fd037316bdaf4f3b4de9a485d615/image_4379f9.png" 
                alt="Pixel Palace" 
                className="relative w-48 h-48 md:w-64 md:h-64 object-contain drop-shadow-2xl transition-transform duration-700 group-hover:scale-105"
            />
        </div>

        {/* Title Typography */}
        <h1 className="mt-8 text-5xl md:text-8xl font-black text-white italic tracking-tighter leading-none font-['Teko'] uppercase">
            PIXEL <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-purple-600">PALACE</span>
        </h1>
        
        <p className="mt-2 text-zinc-500 font-mono text-xs md:text-sm tracking-[0.3em] uppercase">
            Competitive Operating System // v1.0
        </p>

        {/* 3. THE ACTION (Minimal Entry) */}
        <div className="mt-12 flex flex-col items-center gap-4 w-full max-w-xs">
            <button 
                onClick={handleEnter}
                className="group relative w-full py-4 bg-white text-black font-black text-lg uppercase tracking-widest hover:bg-fuchsia-500 hover:text-white transition-all duration-300 clip-path-slant"
                style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
            >
                <span className="flex items-center justify-center gap-2">
                    Enter System <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
            </button>

            {!session?.isAuthenticated && (
                <button 
                    onClick={() => navigate('/login')}
                    className="text-xs text-zinc-600 hover:text-zinc-400 uppercase tracking-widest font-bold transition-colors flex items-center gap-2"
                >
                    <Shield className="w-3 h-3" /> Secure Login
                </button>
            )}
        </div>
      </div>

      {/* 4. FOOTER (Subtle) */}
      <div className="absolute bottom-8 text-center">
        <div className="h-px w-24 bg-gradient-to-r from-transparent via-zinc-800 to-transparent mx-auto mb-4"></div>
        <p className="text-[10px] text-zinc-700 font-mono uppercase">
            Standardized Competitive Infrastructure
        </p>
      </div>

    </div>
  );
};

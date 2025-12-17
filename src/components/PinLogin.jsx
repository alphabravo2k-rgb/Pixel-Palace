import React, { useState, useEffect } from 'react';
import { useSession } from '../auth/useSession';
import { Modal, Button } from '../ui/Components';
import { Lock, ShieldAlert, LifeBuoy, Eye, EyeOff } from 'lucide-react';

const PinLogin = () => {
  const { verifyPin, loginAsSpectator, isPinModalOpen } = useSession();
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  // Focus management
  useEffect(() => {
    if (isPinModalOpen && !loading) {
      const input = document.getElementById('secure-pin-input');
      if (input) input.focus();
    }
  }, [isPinModalOpen, loading]);

  if (!isPinModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pin.trim()) return;
    
    setLoading(true);
    setError(null);
    setShake(false);

    const result = await verifyPin(pin);
    
    if (!result.success) {
       setError(result.reason || "ACCESS DENIED: INVALID PROTOCOL");
       setPin('');
       setShake(true);
       
       // Remove shake class after animation
       setTimeout(() => setShake(false), 500);

       // Refocus
       requestAnimationFrame(() => {
         const inputEl = document.getElementById('secure-pin-input');
         if (inputEl) inputEl.focus();
       });
    }
    setLoading(false);
  };

  const handleSpectate = () => {
    loginAsSpectator();
  };

  return (
    <Modal isOpen={isPinModalOpen} onClose={() => {}} title="SECURE ACCESS" maxWidth="max-w-sm">
      <div role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
          
          {/* Tactical Header Icon */}
          <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center mx-auto shadow-inner">
                 <Lock className="w-6 h-6 text-[#ff5500]" />
              </div>
              <div className="space-y-1">
                 <p id="modal-title" className="text-white font-black uppercase tracking-widest text-sm">Pixel Palace Authority</p>
                 <p className="text-zinc-600 text-[10px] font-mono uppercase tracking-[0.2em]">Authentication Required</p>
              </div>
          </div>

          {/* PIN Input Group */}
          <div className="space-y-2">
              <div className="relative group">
                <input 
                   id="secure-pin-input"
                   aria-label="Secure Access PIN"
                   type={showPin ? "text" : "password"}
                   inputMode={showPin ? "text" : "numeric"} // Optimization for mobile keyboards
                   autoComplete="off"
                   className={`w-full bg-[#0b0c0f] border ${error ? 'border-red-500/50' : 'border-zinc-700/50'} rounded-sm p-4 pr-12 text-center text-2xl tracking-[0.5em] text-white focus:border-[#ff5500] outline-none transition-all font-mono placeholder:tracking-normal placeholder:text-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-inner`}
                   placeholder="••••"
                   value={pin}
                   onChange={(e) => setPin(e.target.value)}
                   disabled={loading}
                   maxLength={12} 
                   autoFocus
                />
                
                {/* Show/Hide Toggle */}
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300 transition-colors p-1"
                  tabIndex="-1" // Skip tab index for smoother typing flow
                  aria-label={showPin ? "Hide PIN" : "Show PIN"}
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
          </div>

          {/* Error Feedback with Support Links */}
          {error && (
              <div className={`space-y-3 ${shake ? 'animate-pulse' : ''}`}>
                  <div className="bg-red-950/20 border border-red-900/50 p-3 flex items-center gap-3 rounded-sm animate-in slide-in-from-top-1 fade-in duration-200" role="alert">
                     <ShieldAlert className="w-4 h-4 text-red-500" />
                     <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">{error}</span>
                  </div>
                  
                  {/* Tactical Support Links */}
                  <div className="flex justify-center gap-4 text-[9px] font-mono text-zinc-500 uppercase tracking-widest pt-2 border-t border-zinc-800/50 animate-in fade-in duration-500">
                      <a 
                        href="https://discord.com/users/425754174932910090" 
                        target="_blank" 
                        rel="noreferrer" 
                        className="hover:text-[#ff5500] flex items-center gap-1 transition-colors group"
                        title="Contact Admin"
                      >
                          <LifeBuoy className="w-3 h-3 group-hover:animate-spin-slow" /> Contact Bravo
                      </a>
                      <span className="text-zinc-800">|</span>
                      <a 
                        href="https://discord.gg/fKgaGEtY" 
                        target="_blank" 
                        rel="noreferrer" 
                        className="hover:text-blue-400 flex items-center gap-1 transition-colors"
                        title="Join Support Server"
                      >
                          Support Unit
                      </a>
                  </div>
              </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
              <Button 
                type="submit"
                className="w-full py-4 bg-[#ff5500] hover:bg-[#ff7733] text-black border-none shadow-[0_0_15px_rgba(255,85,0,0.2)] font-black uppercase tracking-[0.2em] relative overflow-hidden" 
                disabled={loading}
              >
                 {loading ? (
                   <span className="flex items-center justify-center gap-2 animate-pulse">
                     DECRYPTING...
                   </span>
                 ) : 'AUTHORIZE'}
              </Button>
              
              <button
                 type="button"
                 onClick={handleSpectate}
                 disabled={loading}
                 className="w-full text-[10px] text-zinc-600 hover:text-zinc-400 uppercase tracking-widest font-mono transition-colors disabled:opacity-50 hover:underline decoration-zinc-800 underline-offset-4"
              >
                 Proceed as Spectator (Read Only)
              </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default PinLogin;

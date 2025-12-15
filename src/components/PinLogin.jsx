import React, { useState } from 'react';
import { useSession } from '../auth/useSession';
import { Modal, Button } from '../ui/Components';

const PinLogin = () => {
  const { verifyPin, isPinModalOpen, setIsPinModalOpen } = useSession();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const success = await verifyPin(pin);
    if (!success) {
        setError("Invalid Access Code");
        setPin('');
    }
    setLoading(false);
  };

  const handleSpectate = () => {
      setIsPinModalOpen(false);
  };

  return (
    <Modal isOpen={isPinModalOpen} onClose={() => {}} title="Pixel Palace Authority" maxWidth="max-w-sm">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center space-y-2">
            <div className="text-4xl">🔐</div>
            <p className="text-slate-400 text-sm">Enter your Access Code to authenticate.</p>
        </div>

        <div>
            <input 
                type="password" 
                inputMode="text"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-4 text-center text-xl tracking-widest text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:tracking-normal font-mono"
                placeholder="••••••••"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                maxLength={20} 
                autoFocus
            />
        </div>

        {error && (
            <div className="space-y-3">
                <div className="text-red-400 text-sm text-center bg-red-900/20 p-2 rounded animate-shake">
                    {error}
                </div>
                
                {/* Support Options on Failure */}
                <div className="pt-2 border-t border-white/5 space-y-2">
                    <p className="text-[10px] text-center text-slate-500 uppercase tracking-widest font-bold">Login Issues?</p>
                    <div className="grid grid-cols-2 gap-2">
                        <a 
                            href="https://discord.com/users/425754174932910090" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[10px] text-center bg-[#5865F2]/10 text-[#5865F2] hover:bg-[#5865F2]/20 border border-[#5865F2]/20 rounded py-2 transition-colors font-bold"
                        >
                            Contact Bravo.gg
                        </a>
                        <a 
                            href="https://discord.gg/fKgaGEtY" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[10px] text-center bg-[#5865F2]/10 text-[#5865F2] hover:bg-[#5865F2]/20 border border-[#5865F2]/20 rounded py-2 transition-colors font-bold"
                        >
                            Epic Support Team
                        </a>
                    </div>
                </div>
            </div>
        )}

        <div className="space-y-3">
            <Button className="w-full py-3 font-bold shadow-lg shadow-blue-900/20" disabled={loading}>
                {loading ? 'Verifying...' : 'Authenticate'}
            </Button>
            <button 
                type="button"
                onClick={handleSpectate}
                className="w-full text-xs text-slate-500 hover:text-slate-300 underline"
            >
                Continue as Spectator (Read Only)
            </button>
        </div>
      </form>
    </Modal>
  );
};

export default PinLogin;

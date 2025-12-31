export const LandingPage = () => {
  const navigate = useNavigate();
  const { session } = useSession();
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    let timer;
    if (isConnecting) {
      timer = setTimeout(() => {
        if (session?.isAuthenticated) {
            navigate('/admin/dashboard');
        } else {
            navigate('/login');
        }
      }, 1500);
    }
    return () => clearTimeout(timer);
  }, [isConnecting, session, navigate]);

  const handleEnter = () => setIsConnecting(true);

  return (
    <div className="relative min-h-screen w-full bg-[#050505] overflow-hidden flex flex-col items-center justify-center selection:bg-fuchsia-500/30 font-sans">
      {/* Textures and Background */}
      <div className="scanlines"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000_100%)] z-40 pointer-events-none"></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 z-0"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-900/20 rounded-full blur-[128px] animate-pulse z-0"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-900/20 rounded-full blur-[128px] animate-pulse z-0" style={{ animationDelay: '1s' }}></div>

      {/* Centerpiece */}
      <div className="relative z-50 flex flex-col items-center">
        <div className="relative group cursor-default mb-10">
          <div className="absolute inset-0 bg-gradient-to-tr from-fuchsia-600 to-purple-600 rounded-full blur-3xl opacity-20 group-hover:opacity-50 transition-opacity duration-1000"></div>
          <img 
              src="https://raw.githubusercontent.com/alphabravo2k-rgb/pixel-palace-registration/1a7d90c43796fd037316bdaf4f3b4de9a485d615/image_4379f9.png" 
              alt="Pixel Palace" 
              className="relative w-40 h-40 md:w-56 md:h-56 object-contain drop-shadow-2xl transition-transform duration-700 group-hover:scale-105"
          />
        </div>

        {/* Glitch Typography */}
        <div className="text-center relative">
          <h1 className="text-6xl md:text-9xl font-black text-white italic tracking-tighter leading-none font-['Teko'] uppercase glitch-wrapper" data-text="PIXEL PALACE">
              PIXEL <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-purple-600">PALACE</span>
          </h1>
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="h-px w-8 bg-zinc-800"></div>
            <p className="text-zinc-500 font-mono text-xs tracking-[0.4em] uppercase">
                Competitive OS // v2.0
            </p>
            <div className="h-px w-8 bg-zinc-800"></div>
          </div>
        </div>

        {/* Initialize Button */}
        <div className="mt-16 w-full max-w-xs relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-fuchsia-600 to-purple-600 rounded blur opacity-20 group-hover:opacity-60 transition duration-500"></div>
          <button 
              onClick={handleEnter}
              disabled={isConnecting}
              className="relative w-full py-4 bg-white text-black font-black text-lg uppercase tracking-widest hover:bg-zinc-100 transition-all duration-100 clip-path-slant flex items-center justify-center gap-3 disabled:opacity-80 disabled:cursor-wait"
              style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
          >
              {isConnecting ? (
                  <>
                      <Loader2 className="w-5 h-5 animate-spin text-fuchsia-600" />
                      <span className="animate-pulse">Connecting...</span>
                  </>
              ) : (
                  <>
                      <span>Initialize</span> 
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-fuchsia-600" />
                  </>
              )}
          </button>
        </div>

        {/* Footer Status */}
        <div className="mt-8 flex items-center gap-6 text-[10px] text-zinc-600 font-mono uppercase tracking-wider">
          <span className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_#22c55e]"></div>
              System Online
          </span>
          <span className="flex items-center gap-2">
              <Terminal size={10} />
              Secure Connection
          </span>
        </div>
      </div>
    </div>
  );
};

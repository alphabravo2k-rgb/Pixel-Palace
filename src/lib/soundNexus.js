/**
 * 🔊 PIXEL PALACE: AUDIO NEXUS PRO
 * ------------------------------
 * STATUS: MASTERED (DUBAI STANDARD)
 * VERSION: 4.0.0
 * * FEATURES:
 * 1. POLYPHONIC ENGINE: Allows overlapping sounds (e.g., rapid clicks).
 * 2. SPATIAL VARIANCE: Subtle pitch shifting to prevent "audio fatigue".
 * 3. BROWSER SAFE: Handles auto-play policies gracefully.
 */

export const CUES = {
  UI_CLICK: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  UI_HOVER: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
  NOTIFICATION: 'https://assets.mixkit.co/active_storage/sfx/2344/2344-preview.mp3',
  NAVIGATION_SWISH: 'https://assets.mixkit.co/active_storage/sfx/2044/2044-preview.mp3',
  VETO_ACTION: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3',
  DISPUTE_TRIGGER: 'https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3',
  SUCCESS: 'https://assets.mixkit.co/active_storage/sfx/2567/2567-preview.mp3'
};

class AudioEngine {
  constructor() {
    this.sounds = new Map();
    this.enabled = true;
    this.globalVolume = 0.35; // Default tactical volume (Not too loud)
    this.initialized = false;
  }

  /**
   * 🔓 IGNITION PROTOCOL
   * Pre-loads assets into memory. Call this on the first user interaction (Landing Page).
   */
  init() {
    if (this.initialized || typeof window === 'undefined') return;

    Object.entries(CUES).forEach(([key, url]) => {
      const audio = new Audio(url);
      audio.preload = 'auto';
      this.sounds.set(key, audio);
    });

    this.initialized = true;
    console.log("%c 🔊 AUDIO NEXUS: ONLINE", "color: #e879f9; font-weight: bold; letter-spacing: 1px;");
  }

  /**
   * ⚡ FIRE SOUND
   * @param {string} cueKey - The key from CUES object
   * @param {number} [forceVolume] - Optional override volume
   */
  play(cueKey, forceVolume = null) {
    if (!this.enabled || !this.sounds.has(cueKey)) return;

    try {
      const master = this.sounds.get(cueKey);
      
      // 🧬 CLONING: Essential for rapid-fire sounds (Polyphony)
      // Without this, the sound restarts before finishing, sounding glitchy.
      const sfx = master.cloneNode();
      
      // 🎛️ VARIANCE: 0.98x - 1.02x pitch shift for organic realism
      sfx.playbackRate = 0.98 + Math.random() * 0.04;
      sfx.volume = forceVolume !== null ? forceVolume : this.globalVolume;

      // 🛡️ SAFETY: Catch auto-play blocks (User hasn't clicked yet)
      const playPromise = sfx.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Silent fail is best UX here to avoid console spam
        });
      }
    } catch (e) {
      // Audio engine failure should never crash the app
    }
  }

  // Allow user to mute/adjust in Settings later
  setVolume(val) {
    this.globalVolume = Math.min(Math.max(val, 0), 1);
  }

  toggle(state) {
    this.enabled = state !== undefined ? state : !this.enabled;
  }
}

export const SoundNexus = new AudioEngine();

import { Howl, Howler } from 'howler';

/**
 * 🔊 PIXEL PALACE: SOUND NEXUS (8D SPATIAL ENGINE)
 * ------------------------------------------------
 * STATUS: MASTERED (BURJ KHALIFA STANDARD)
 * ENGINE: HOWLER.JS (WEB AUDIO API ACCELERATED)
 * * FEATURES:
 * 1. SPATIAL AUDIO: Supports full stereo panning (-1.0 to 1.0).
 * 2. 8D SIMULATION: Auto-rotates specific cues around the user's head.
 * 3. LATENCY KILLER: Preloads assets into GPU/Audio Context memory.
 */

// 💽 ASSET MANIFEST
// We use high-fidelity assets.
export const CUES = {
  UI_CLICK: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  UI_HOVER: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
  NOTIFICATION: 'https://assets.mixkit.co/active_storage/sfx/2344/2344-preview.mp3',
  NAVIGATION_SWISH: 'https://assets.mixkit.co/active_storage/sfx/2044/2044-preview.mp3',
  VETO_ACTION: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3',
  DISPUTE_TRIGGER: 'https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3',
  SUCCESS: 'https://assets.mixkit.co/active_storage/sfx/2567/2567-preview.mp3',
  // New Tactical Cues
  COMBAT_START: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
  ERROR: 'https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3'
};

class AudioEngine {
  constructor() {
    this.sounds = {};
    this.enabled = true;
    this.globalVolume = 0.4;
    this.initialized = false;
    this.bgm = null; // Background Music Track
  }

  /**
   * 🔓 IGNITION PROTOCOL
   * Instantiates Howl objects for zero-latency triggering.
   */
  init() {
    if (this.initialized || typeof window === 'undefined') return;

    Object.entries(CUES).forEach(([key, url]) => {
      this.sounds[key] = new Howl({
        src: [url],
        preload: true,
        volume: this.globalVolume,
        html5: false, // Force Web Audio API for 3D effects
      });
    });

    this.initialized = true;
    console.log("%c 🔊 8D AUDIO NEXUS: ONLINE", "color: #10b981; font-weight: bold; letter-spacing: 1px;");
  }

  /**
   * ⚡ FIRE SOUND (TACTICAL)
   * @param {string} cueKey - The key from CUES
   * @param {Object} options - { volume: 0-1, pan: -1 to 1, rate: 0.5-2 }
   */
  play(cueKey, options = {}) {
    if (!this.enabled || !this.sounds[cueKey]) return;

    const sfx = this.sounds[cueKey];
    
    // 🎛️ VARIANCE: 0.98x - 1.02x pitch shift (Organic feel)
    const rate = options.rate || (0.98 + Math.random() * 0.04);
    
    // 🎧 SPATIAL 8D LOGIC
    // If 'pan' is provided, move sound. If not, center it.
    const pan = options.pan !== undefined ? options.pan : 0; // 0 is center, -1 left, 1 right

    // Create a unique instance ID to control just this one shot
    const id = sfx.play();
    
    sfx.volume(options.forceVolume || this.globalVolume, id);
    sfx.rate(rate, id);
    sfx.stereo(pan, id); // <--- THIS IS THE 8D MAGIC
  }

  /**
   * 🔄 8D ORBIT (Experimental)
   * Rotates a sound around the user's head
   */
  playOrbit(cueKey) {
    if (!this.enabled || !this.sounds[cueKey]) return;
    const sfx = this.sounds[cueKey];
    const id = sfx.play();
    let pan = -1.0;
    let direction = 0.05;

    // Animate panning from Left -> Right -> Left
    const interval = setInterval(() => {
      pan += direction;
      if (pan >= 1.0 || pan <= -1.0) direction *= -1;
      sfx.stereo(pan, id);
      
      // Stop checking if sound finished
      if (!sfx.playing(id)) clearInterval(interval);
    }, 50);
  }

  setVolume(val) {
    this.globalVolume = Math.min(Math.max(val, 0), 1);
    Howler.volume(this.globalVolume); // Master Howler volume
  }

  toggle(state) {
    this.enabled = state !== undefined ? state : !this.enabled;
    Howler.mute(!this.enabled);
  }
}

export const SoundNexus = new AudioEngine();

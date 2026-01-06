/**
 * 🔊 PIXEL PALACE: AUDIO NEXUS
 * ---------------------------
 * STATUS: MASTERED
 * PURPOSE: Zero-latency SFX management with spatial variation.
 */

export const CUES = {
  UI_CLICK: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  UI_HOVER: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
  NOTIFICATION: 'https://assets.mixkit.co/active_storage/sfx/2344/2344-preview.mp3',
  NAVIGATION_SWISH: 'https://assets.mixkit.co/active_storage/sfx/2044/2044-preview.mp3',
  VETO_ACTION: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3',
  DISPUTE_TRIGGER: 'https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3',
};

class AudioEngine {
  constructor() {
    this.sounds = {};
    this.enabled = true;
    this.volume = 0.4; 
  }

  init() {
    if (typeof window === 'undefined') return;
    Object.keys(CUES).forEach(key => {
      this.sounds[key] = new Audio(CUES[key]);
      this.sounds[key].volume = this.volume;
    });
  }

  play(cueKey) {
    if (!this.enabled || !this.sounds[cueKey]) return;
    try {
      const sound = this.sounds[cueKey];
      sound.currentTime = 0;
      // Slight pitch variation to prevent "ear fatigue"
      sound.playbackRate = 0.95 + Math.random() * 0.1; 
      
      const clone = sound.cloneNode();
      clone.volume = this.volume;
      clone.play().catch(() => {}); 
    } catch (e) {
      // Silent fail is acceptable for audio
    }
  }
}

export const SoundNexus = new AudioEngine();

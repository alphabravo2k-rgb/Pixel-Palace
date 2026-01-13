/**
 * 🔊 PIXEL PALACE: SOUND NEXUS (8D SPATIAL ENGINE)
 * VERSION: 2050.5.0 (MASTER OMNI)
 * STATUS: OPERATIONAL // WEB-AUDIO ACCELERATED
 */

import { Howl, Howler } from 'howler';

// 💽 TACTICAL ASSET MANIFEST
// Using localized CUES for various UI and Match states
export const CUES = {
  UI_CLICK: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  UI_HOVER: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
  UI_TICK: 'https://www.soundjay.com/buttons/button-50.mp3', // Sharp mechanical tick
  UI_SUCCESS: 'https://assets.mixkit.co/active_storage/sfx/2567/2567-preview.mp3',
  UI_ERROR: 'https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3',
  UI_POWER_UP: 'https://assets.mixkit.co/active_storage/sfx/2044/2044-preview.mp3',
  UI_POWER_DOWN: 'https://www.soundjay.com/buttons/button-10.mp3',
  NOTIFICATION: 'https://assets.mixkit.co/active_storage/sfx/2344/2344-preview.mp3',
  VETO_SLAM: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3',
  MATCH_FOUND: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
  UI_CLICK_HEAVY: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3'
};

class AudioEngine {
  constructor() {
    this.sounds = {};
    this.enabled = true;
    this.masterVolume = 0.5;
    this.initialized = false;
  }

  /**
   * 🔓 NEURAL LINK INITIATION
   * Pre-fetches all cues into memory for zero-ms response times.
   */
  init() {
    if (this.initialized || typeof window === 'undefined') return;

    Object.entries(CUES).forEach(([key, url]) => {
      this.sounds[key] = new Howl({
        src: [url],
        preload: true,
        volume: this.masterVolume,
        html5: false, // Forces Web Audio API for high-perf spatialization
      });
    });

    this.initialized = true;
    console.log("%c 🔊 SOUND NEXUS: LINK ESTABLISHED", "color: #c026d3; font-weight: bold;");
  }

  /**
   * ⚡ TACTICAL TRIGGER (Standard Play)
   */
  play(cueKey, options = {}) {
    if (!this.enabled || !this.sounds[cueKey]) return;

    const sfx = this.sounds[cueKey];
    
    // 🧬 ORGANIC VARIANCE
    // Tiny random pitch shifts prevent "machine-gun" fatigue on repeated sounds
    const rate = options.pitch || (0.97 + Math.random() * 0.06);
    
    const id = sfx.play();
    sfx.volume(options.volume || this.masterVolume, id);
    sfx.rate(rate, id);
    
    return id;
  }

  /**
   * 🎧 SPATIAL PANNING (8D Logic)
   * Plays a sound at a specific point in the stereo field.
   * @param {string} cueKey 
   * @param {Object} options - { pan: -1.0 to 1.0, pitch: 1.0, volume: 1.0 }
   */
  playSpatial(cueKey, options = {}) {
    // Merge defaults
    const config = { pan: 0, ...options };
    
    const id = this.play(cueKey, config);
    if (id && this.sounds[cueKey]) {
      // Direct WebAudio Panner Node manipulation
      this.sounds[cueKey].stereo(config.pan, id);
    }
  }

  /**
   * 🔄 VORTEX EFFECT (8D Orbit)
   * Rotates sound around the user's axis. Perfect for Match Readiness.
   */
  playVortex(cueKey, duration = 2000) {
    if (!this.enabled || !this.sounds[cueKey]) return;
    const sfx = this.sounds[cueKey];
    const id = sfx.play();
    
    let start = null;
    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      
      // Calculate pan using a sine wave for smooth 360 rotation
      const pan = Math.sin(progress / (duration / 4));
      sfx.stereo(pan, id);

      if (progress < duration && sfx.playing(id)) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }

  mute(state) {
    this.enabled = !state;
    Howler.mute(state);
  }
  
  toggleMute() {
    this.mute(this.enabled);
    return !this.enabled;
  }
}

export const SoundNexus = new AudioEngine();

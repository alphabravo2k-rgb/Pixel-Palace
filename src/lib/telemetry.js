/**
 * 🔭 PIXEL PALACE: TELEMETRY & ANALYTICS
 * VERSION: 2050.5.0 (SENTINEL OMNI)
 * STATUS: ACTIVE // PERFORMANCE MONITORING ENABLED
 * PURPOSE: Tracks system health, FPS, latency, and user actions.
 */

import { supabase } from '../supabase/client';

// 1. EVENT TYPES (Standardized Vocabulary)
export const EVENTS = {
  PAGE_VIEW: 'page_view',
  ERROR: 'system_error',
  ACTION: 'user_action',      // Clicks, Toggles
  AUTH: 'auth_event',         // Login/Logout
  COMBAT: 'combat_event',     // Match Join/Leave
  PERFORMANCE: 'vital_sign'   // FPS, Ping, Load Times
};

class TelemetryEngine {
  constructor() {
    this.sessionStart = Date.now();
    this.env = import.meta.env.MODE; // 'development' or 'production'
    this.queue = [];
    this.isFlushing = false;
    this.fpsRequest = null;
    
    // Auto-flush every 10 seconds to save bandwidth
    if (typeof window !== 'undefined') {
      setInterval(() => this.flush(), 10000);
    }
  }

  /**
   * 📡 LOG EVENT (The Primary Input)
   * Queues an event to be sent to the server.
   * @param {string} eventType - From EVENTS constant
   * @param {object} payload - Key data (e.g. { path: '/match/123' })
   * @param {string|null} userId - Optional: Link to specific user
   */
  log(eventType, payload = {}, userId = null) {
    // 1. Console Feedback (Dev Mode Only)
    if (this.env === 'development') {
      const color = eventType === EVENTS.ERROR ? '#ef4444' : '#3b82f6';
      console.log(`%c 🔭 [${eventType}]`, `color: ${color}; font-weight: bold;`, payload);
    }

    // 2. Queue for Database
    this.queue.push({
      event_type: eventType,
      user_id: userId,
      metadata: {
        ...payload,
        timestamp: new Date().toISOString(),
        url: typeof window !== 'undefined' ? window.location.pathname : '',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : ''
      },
      created_at: new Date().toISOString()
    });

    // 3. Immediate Flush for Critical Errors
    if (eventType === EVENTS.ERROR) {
      this.flush();
    }
  }

  /**
   * ⏱️ TRACK VITAL SIGN
   * Measure how long an operation takes (e.g. "Match Load Time").
   * Usage: const timer = Telemetry.time('match_load'); ... timer.end(uid);
   */
  time(label) {
    const start = performance.now();
    return {
      end: (userId = null) => {
        const duration = Math.round(performance.now() - start);
        this.log(EVENTS.PERFORMANCE, { label, duration_ms: duration }, userId);
      }
    };
  }

  /**
   * 🛰️ PROBE PING (Network Health)
   * Measures real-time latency to the Supabase Edge.
   * Usage: Call this before a match starts to warn users of high lag.
   */
  async getPing() {
    const start = performance.now();
    try {
      // Lightest possible request to DB
      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/`, { 
        method: 'HEAD',
        headers: { 'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY } 
      });
      const latency = Math.round(performance.now() - start);
      
      if (latency > 150) {
        this.log(EVENTS.PERFORMANCE, { label: 'high_latency_alert', ms: latency });
      }
      return latency;
    } catch (e) { 
      return 999; 
    }
  }

  /**
   * 🎞️ MONITOR FPS (Graphics Health)
   * Detects if the 3D HUD is lagging on the user's hardware.
   * Auto-stops if the user navigates away (cleanup handled by component).
   */
  trackFPS(threshold = 30) {
    if (typeof window === 'undefined') return () => {};

    let frames = 0;
    let lastTime = performance.now();
    let active = true;
    
    const check = () => {
      if (!active) return;
      
      frames++;
      const now = performance.now();
      
      if (now >= lastTime + 1000) {
        if (frames < threshold) {
          // Only log significant drops to avoid spam
          this.log(EVENTS.PERFORMANCE, { label: 'low_fps_alert', fps: frames });
        }
        frames = 0;
        lastTime = now;
      }
      this.fpsRequest = requestAnimationFrame(check);
    };
    
    this.fpsRequest = requestAnimationFrame(check);

    // Return cleanup function
    return () => { active = false; cancelAnimationFrame(this.fpsRequest); };
  }

  /**
   * 🚀 FLUSH QUEUE
   * Sends batch data to Supabase 'audit_logs' table.
   */
  async flush() {
    if (this.queue.length === 0 || this.isFlushing) return;

    this.isFlushing = true;
    const batch = [...this.queue];
    this.queue = []; // Clear local queue immediately

    try {
      // Safe write: We map our internal event format to the DB schema
      const { error } = await supabase
        .from('audit_logs')
        .insert(batch.map(item => ({
          actor_id: item.user_id || null, // Null allows anon logs
          action_type: item.event_type,
          metadata: item.metadata
        })));

      if (error) {
        // Silent fail in production to avoid disruption
        if (this.env === 'development') console.warn("Telemetry Write Error:", error);
      }
    } catch (err) {
      if (this.env === 'development') console.warn("Telemetry Flush Failed:", err);
    } finally {
      this.isFlushing = false;
    }
  }
}

export const Telemetry = new TelemetryEngine();
